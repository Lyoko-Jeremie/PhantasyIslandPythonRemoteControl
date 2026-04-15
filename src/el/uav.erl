-module(uav).
-export([init/0, sleep/1, add_uav/1, land/1, emergency/1, takeoff/2, up/2, down/2, forward/2, back/2, left/2, right/2, goto/4, flip/2, rotate/2, cw/2, ccw/2, speed/2, high/2, led/4, bln/4, rainbow/4, mode/2, stop/1, hover/1]).

init() ->
    airplane_manager:flush(),
    airplane_manager:start(),
    airplane_manager:flush().

sleep(Time) ->
    airplane_manager:sleep(Time).

add_uav(Port) ->
    airplane_manager:get_airplane(Port).

p(Port) ->
    airplane_manager:get_airplane(Port).

land(Port) -> control_command:land(p(Port)).
emergency(Port) -> control_command:stop(p(Port)).
takeoff(Port, High) -> control_command:takeoff(p(Port), High).
up(Port, Dist) -> control_command:up(p(Port), Dist).
down(Port, Dist) -> control_command:down(p(Port), Dist).
forward(Port, Dist) -> control_command:forward(p(Port), Dist).
back(Port, Dist) -> control_command:back(p(Port), Dist).
left(Port, Dist) -> control_command:left(p(Port), Dist).
right(Port, Dist) -> control_command:right(p(Port), Dist).
goto(Port, X, Y, H) -> control_command:goto(p(Port), X, Y, H).
flip(Port, Dir) -> control_command:flip(p(Port), Dir).
rotate(Port, Deg) -> control_command:rotate(p(Port), Deg).
cw(Port, Deg) -> control_command:cw(p(Port), Deg).
ccw(Port, Deg) -> control_command:ccw(p(Port), Deg).
speed(Port, S) -> control_command:speed(p(Port), S).
high(Port, H) -> control_command:high(p(Port), H).
led(Port, R, G, B) -> control_command:led(p(Port), R, G, B).
bln(Port, R, G, B) -> control_command:bln(p(Port), R, G, B).
rainbow(Port, R, G, B) -> control_command:rainbow(p(Port), R, G, B).
mode(Port, M) -> control_command:mode(p(Port), M).
stop(Port) -> control_command:stop(p(Port)).
hover(Port) -> control_command:hover(p(Port)).
