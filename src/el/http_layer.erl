-module(http_layer).

-export([ping/0, ping_volatile/0, start/0, start_volatile/0]).
-export([send_cmd/1, send_cmd_volatile/1, get_all_airplane_status/0]).
-export([get_airplane_camera_image/2, process_airplane/1]).

-define(TIMEOUT, 10000).

ping() ->
    send_cmd("ping").

ping_volatile() ->
    send_cmd_volatile("ping").

start() ->
    send_cmd("start").

start_volatile() ->
    send_cmd_volatile("start").

send_cmd(S) ->
    URL = "http://" ++ config:remote_location() ++ "/ECU_HTTP/sendStringCmd?c=" ++ S,
    http_request(URL).

send_cmd_volatile(S) ->
    URL = "http://" ++ config:remote_location() ++ "/ECU_HTTP/sendStringCmd?cc=" ++ S,
    http_request(URL).

get_all_airplane_status() ->
    URL = "http://" ++ config:remote_location() ++ "/ECU_HTTP/requestPullAllAirplaneState",
    case httpc:request(get, {URL, []}, [{timeout, 5000}], []) of
        {ok, {{_, 200, _}, _, Body}} ->
            jsone:decode(list_to_binary(Body));
        {error, Reason} ->
            io:format(standard_error, "ConnectionError Cannot Connect to PhantasyIsland: ~p~n", [Reason]),
            error(connection_error)
    end.

get_airplane_camera_image(Port, Camera) ->
    URL = "http://" ++ config:remote_location() ++ "/ECU_HTTP/requestPullImage?flyPort=" ++ Port ++ "&imageType=" ++ Camera,
    case httpc:request(get, {URL, []}, [{timeout, 5000}], []) of
        {ok, {{_, 200, _}, _, Body}} ->
            J = jsone:decode(list_to_binary(Body)),
            case maps:get(<<"ok">>, J) of
                true -> maps:get(<<"imgDataString">>, J);
                false -> nil
            end;
        {error, _} ->
            nil
    end.

process_airplane(J) ->
    case maps:get(<<"ok">>, J) of
        true ->
            Airplanes = maps:get(<<"airplanes">>, J),
            lists:foldl(fun(Air, Acc) ->
                KeyName = maps:get(<<"keyName">>, Air),
                Status = #{
                    <<"keyName">> => KeyName,
                    <<"typeName">> => maps:get(<<"typeName">>, Air),
                    <<"updateTimestamp">> => maps:get(<<"updateTimestamp">>, Air),
                    <<"status">> => maps:get(<<"status">>, Air),
                    <<"cameraFront">> => get_img_data(maps:get(<<"cameraFront">>, Air)),
                    <<"cameraDown">> => get_img_data(maps:get(<<"cameraDown">>, Air))
                },
                maps:put(KeyName, Status, Acc)
            end, #{}, Airplanes);
        false ->
            nil
    end.

get_img_data(CameraMap) ->
    maps:get(<<"imgDataString">>, CameraMap, nil).

http_request(URL) ->
    case httpc:request(get, {URL, []}, [{timeout, ?TIMEOUT}], []) of
        {ok, {{_, 200, _}, _, Body}} ->
            jsone:decode(list_to_binary(Body));
        {error, timeout} ->
            #{<<"ok">> => false, <<"r">> => <<"Timeout">>};
        {error, _} ->
            #{<<"ok">> => false, <<"r">> => <<"ConnectionError">>}
    end.
