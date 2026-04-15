-module(api_debug).
-export([ping/1]).

ping(State) ->
    api_module:send(State, "ping", #{}, "pong").
