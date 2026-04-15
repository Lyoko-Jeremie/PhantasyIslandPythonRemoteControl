-module(radio_manager).
-behaviour(gen_server).

-export([start_link/0, connect/1, connect/2, ping/0, send_and_wait_sync/2, send_and_wait_sync/3, send_and_wait_sync/4]).
-export([init/1, handle_call/3, handle_cast/2, handle_info/2]).

-record(state, {
    socket,
    scene_is_init = false,
    pending_waiters = #{} % WaitCmd -> [Pid]
}).

start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

connect(Url) -> connect(Url, "/UserSide").
connect(Url, Namespace) ->
    gen_server:cast(?MODULE, {connect, Url, Namespace}).

ping() ->
    send_and_wait_sync("ping", #{}, "pong", 3000).

send_and_wait_sync(Cmd, Data) -> send_and_wait_sync(Cmd, Data, Cmd, 3000).
send_and_wait_sync(Cmd, Data, WaitCmd) -> send_and_wait_sync(Cmd, Data, WaitCmd, 3000).
send_and_wait_sync(Cmd, Data, WaitCmd, Timeout) ->
    {ok, TokenPid} = gen_server:call(?MODULE, {create_token, Cmd, Data, WaitCmd}),
    wait_token:wait(TokenPid, Timeout).

init([]) ->
    {ok, #state{}}.

handle_call({create_token, Cmd, Data, WaitCmd}, _From, State = #state{pending_waiters = Waiters}) ->
    TimeID = erlang:system_time(millisecond) * 100,
    {ok, TokenPid} = wait_token:start_link(WaitCmd, TimeID),
    
    Msg = maps:merge(#{<<"cmd">> => list_to_binary(Cmd), <<"timestampIdPython">> => TimeID}, Data),
    % 在这里应该通过 socket 发送 Msg
    % 由于没有真实的 socketio client 库，我们暂时打印
    io:format("Sending Radio Msg: ~p~n", [Msg]),
    
    NewWaiters = maps:update_with(list_to_binary(WaitCmd), fun(L) -> [TokenPid | L] end, [TokenPid], Waiters),
    {reply, {ok, TokenPid}, State#state{pending_waiters = NewWaiters}}.

handle_cast({connect, _Url, _Namespace}, State) ->
    % 模拟连接
    {noreply, State};

handle_cast({incoming_msg, Msg}, State = #state{pending_waiters = Waiters}) ->
    Cmd = maps:get(<<"cmd">>, Msg, nil),
    TimeID = maps:get(<<"timestampIdPython">>, Msg, nil),
    case maps:get(Cmd, Waiters, []) of
        [] -> {noreply, State};
        Pids ->
            % 寻找匹配的 Token 并通知
            % 这里简单处理，通知所有等待该 Cmd 的 Token，Token 内部会校验 TimeID
            lists:foreach(fun(Pid) -> wait_token:complete(Pid, Msg) end, Pids),
            NewWaiters = maps:remove(Cmd, Waiters),
            {noreply, State#state{pending_waiters = NewWaiters}}
    end.

handle_info(_Info, State) -> {noreply, State}.
