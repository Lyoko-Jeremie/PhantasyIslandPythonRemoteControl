-module(control_command).
-behaviour(gen_server).

-export([start_link/1, use_fast_mode/3, mode/2, takeoff/2, land/1, emergency/1, up/2, down/2, forward/2, back/2, left/2, right/2, goto/4, flip/2, rotate/2, cw/2, ccw/2, high/2, speed/2, led/4, bln/4, rainbow/4, airplane_mode/2, stop/1, hover/1]).
-export([init/1, handle_call/3, handle_cast/2, handle_info/2]).

-record(state, {
    airplane_core,
    count = 1,
    fast_mode = false,
    future_mode = false
}).

start_link(AirplaneCore) ->
    gen_server:start_link(?MODULE, [AirplaneCore], []).

use_fast_mode(Pid, FastMode, FutureMode) ->
    gen_server:cast(Pid, {use_fast_mode, FastMode, FutureMode}).

mode(Pid, M) -> airplane_mode(Pid, M).

takeoff(Pid, High) -> gen_server:call(Pid, {send_cmd, "takeoff " ++ integer_to_list(High)}).
land(Pid) -> gen_server:call(Pid, {send_cmd, "land"}).
emergency(Pid) -> gen_server:call(Pid, {send_cmd, "emergency"}).
up(Pid, Dist) -> gen_server:call(Pid, {send_cmd, "up " ++ integer_to_list(Dist)}).
down(Pid, Dist) -> gen_server:call(Pid, {send_cmd, "down " ++ integer_to_list(Dist)}).
forward(Pid, Dist) -> gen_server:call(Pid, {send_cmd, "forward " ++ integer_to_list(Dist)}).
back(Pid, Dist) -> gen_server:call(Pid, {send_cmd, "back " ++ integer_to_list(Dist)}).
left(Pid, Dist) -> gen_server:call(Pid, {send_cmd, "left " ++ integer_to_list(Dist)}).
right(Pid, Dist) -> gen_server:call(Pid, {send_cmd, "right " ++ integer_to_list(Dist)}).
goto(Pid, X, Y, H) -> gen_server:call(Pid, {send_cmd, "goto " ++ integer_to_list(X) ++ " " ++ integer_to_list(Y) ++ " " ++ integer_to_list(H)}).
flip(Pid, Dir) -> gen_server:call(Pid, {send_cmd, "flip " ++ Dir ++ " 1"}).
rotate(Pid, Deg) -> gen_server:call(Pid, {send_cmd, "rotate " ++ integer_to_list(Deg)}).
cw(Pid, Deg) -> gen_server:call(Pid, {send_cmd, "cw " ++ integer_to_list(Deg)}).
ccw(Pid, Deg) -> gen_server:call(Pid, {send_cmd, "ccw " ++ integer_to_list(Deg)}).
high(Pid, H) -> gen_server:call(Pid, {send_cmd, "high " ++ integer_to_list(H)}).
speed(Pid, S) -> gen_server:call(Pid, {send_cmd, "setSpeed " ++ integer_to_list(S)}).
led(Pid, R, G, B) -> gen_server:call(Pid, {send_cmd, "light " ++ integer_to_list(R) ++ " " ++ integer_to_list(G) ++ " " ++ integer_to_list(B)}).
bln(Pid, R, G, B) -> gen_server:call(Pid, {send_cmd, "bln " ++ integer_to_list(R) ++ " " ++ integer_to_list(G) ++ " " ++ integer_to_list(B)}).
rainbow(Pid, R, G, B) -> gen_server:call(Pid, {send_cmd, "rainbow " ++ integer_to_list(R) ++ " " ++ integer_to_list(G) ++ " " ++ integer_to_list(B)}).
airplane_mode(Pid, M) -> gen_server:call(Pid, {send_cmd, "airplane_mode " ++ integer_to_list(M)}).
stop(Pid) -> hover(Pid).
hover(Pid) -> gen_server:call(Pid, {send_cmd, "hover"}).

init([AirplaneCore]) ->
    {ok, #state{airplane_core = AirplaneCore}}.

handle_cast({use_fast_mode, FastMode, FutureMode}, State) ->
    {noreply, State#state{fast_mode = FastMode, future_mode = FutureMode}}.

handle_call({send_cmd, Command}, _From, State = #state{airplane_core = AC, count = C, fast_mode = Fast, future_mode = Future}) ->
    NewCount = C + 2,
    FullCmd = binary_to_list(maps:get(<<"keyName">>, AC)) ++ " " ++ integer_to_list(NewCount) ++ " " ++ Command,
    
    Result = case {Fast, Future} of
        {_, true} ->
            % 异步模式，这里简单起见，启动一个进程去发，然后立即返回 ok 或 PID
            spawn(fun() -> 
                case Fast of
                    true -> http_layer:send_cmd_volatile(FullCmd);
                    false -> http_layer:send_cmd(FullCmd)
                end
            end),
            ok;
        {true, false} ->
            http_layer:send_cmd_volatile(FullCmd);
        {false, false} ->
            http_layer:send_cmd(FullCmd)
    end,
    {reply, Result, State#state{count = NewCount}}.

handle_info(_Info, State) -> {noreply, State}.
