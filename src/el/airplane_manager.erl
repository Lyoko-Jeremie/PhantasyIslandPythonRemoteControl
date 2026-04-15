-module(airplane_manager).
-behaviour(gen_server).

-export([start_link/0, ping/0, ping_volatile/0, start/0, start_volatile/0, get_airplane/1, sleep/1, flush/0]).
-export([init/1, handle_call/3, handle_cast/2]).

-record(state, {
    airplanes_table = #{}
}).

start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, [], []).

ping() -> http_layer:ping().
ping_volatile() -> http_layer:ping_volatile().
start() -> http_layer:start().
start_volatile() -> http_layer:start_volatile().

get_airplane(Id) ->
    gen_server:call(?MODULE, {get_airplane, Id}).

sleep(T) ->
    timer:sleep(round(T * 1000)).

flush() ->
    gen_server:cast(?MODULE, flush).

init([]) ->
    {ok, #state{}}.

handle_call({get_airplane, Id}, _From, State = #state{airplanes_table = Table}) ->
    {reply, maps:get(list_to_binary(Id), Table, nil), State}.

handle_cast(flush, State = #state{airplanes_table = Table}) ->
    StatusMap = http_layer:process_airplane(http_layer:get_all_airplane_status()),
    NewTable = case StatusMap of
        nil -> Table;
        _ ->
            maps:fold(fun(K, Status, Acc) ->
                case maps:get(K, Acc, nil) of
                    nil ->
                        {ok, Pid} = control_command:start_link(Status),
                        maps:put(K, Pid, Acc);
                    Pid ->
                        % 在 Erlang 中，状态更新通常通过向进程发送消息或在管理进程中更新
                        % 这里我们简单地保持 PID，控制逻辑在 gen_server 内部处理。
                        % 如果需要更新 Pid 内部的 AC 数据，可以定义一个 update 消息。
                        Acc
                end
            end, Table, StatusMap)
    end,
    {noreply, State#state{airplanes_table = NewTable}}.
