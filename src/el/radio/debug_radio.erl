-module(debug_radio).
-export([run/0]).

run() ->
    radio_manager:start_link(),
    radio_manager:connect("http://127.0.0.1:60002"),
    
    io:format("Ping: ~p~n", [radio_manager:ping()]),
    
    RM = whereis(radio_manager),
    State = api_module:init(RM),
    
    io:format("IsSceneInit: ~p~n", [api_radio:isSceneInit(State)]),
    io:format("IsRadioReachabilityCheckerInit: ~p~n", [api_radio:isRadioReachabilityCheckerInit(State)]),
    io:format("AllRadioMaterial: ~p~n", [api_radio:getAllRadioMaterial(State)]),
    
    ok.
