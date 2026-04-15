-module(api_module).
-export([init/1, mode/2, send/3, send/4, send/5]).

init(RM) ->
    #{rm => RM, mode => sync}.

mode(State, Mode) ->
    State#{mode => Mode}.

send(State, Cmd, Data) ->
    send(State, Cmd, Data, Cmd, 3.0).

send(State, Cmd, Data, WaitCmd) ->
    send(State, Cmd, Data, WaitCmd, 3.0).

send(#{rm := RM, mode := Mode}, Cmd, Data, WaitCmd, Timeout) ->
    case Mode of
        sync -> radio_manager:send_and_wait_sync(Cmd, Data, WaitCmd, Timeout);
        token -> 
            % 在 Erlang 中，我们可以立即返回 Pid
            {ok, TokenPid} = gen_server:call(RM, {create_token, Cmd, Data, WaitCmd}),
            TokenPid;
        async ->
            % 异步发送并返回一个参考，或者直接 spawn
            spawn(fun() -> radio_manager:send_and_wait_sync(Cmd, Data, WaitCmd, Timeout) end),
            ok
    end.
