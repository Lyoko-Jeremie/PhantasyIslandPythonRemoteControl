-module(phantasy_island).
-export([start/0]).

start() ->
    % 启动所有需要的 gen_server
    airplane_manager:start_link(),
    ok.
