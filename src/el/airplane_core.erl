-module(airplane_core).
-export([make_airplane_fly_status/1, cap_image/3, get_image_transfer_progress/1, is_image_transfer_in_progress/1, get_latest_image/1, get_camera_front_img/1, get_camera_down_img/1]).

-record(airplane_fly_status, {
    landing,
    isStop,
    x,
    y,
    h,
    rX,
    rY,
    rZ
}).

-record(airplane_core, {
    keyName,
    typeName,
    updateTimestamp,
    status,
    cameraFront,
    cameraDown,
    image_receiver_pid
}).

make_airplane_fly_status(FlyStatusMap) ->
    #airplane_fly_status{
        landing = maps:get(<<"landing">>, FlyStatusMap),
        isStop = maps:get(<<"isStop">>, FlyStatusMap),
        x = maps:get(<<"x">>, FlyStatusMap),
        y = maps:get(<<"y">>, FlyStatusMap),
        h = maps:get(<<"h">>, FlyStatusMap),
        rX = maps:get(<<"rX">>, FlyStatusMap),
        rY = maps:get(<<"rY">>, FlyStatusMap),
        rZ = maps:get(<<"rZ">>, FlyStatusMap)
    }.

cap_image(AirplaneCore, UserReceiveCb, UserProgressCb) ->
    Pid = AirplaneCore#airplane_core.image_receiver_pid,
    image_receiver_mook:send_cap_image(Pid, UserReceiveCb, UserProgressCb).

get_image_transfer_progress(AirplaneCore) ->
    Pid = AirplaneCore#airplane_core.image_receiver_pid,
    image_receiver_mook:get_transfer_progress(Pid).

is_image_transfer_in_progress(AirplaneCore) ->
    Pid = AirplaneCore#airplane_core.image_receiver_pid,
    image_receiver_mook:is_transfer_in_progress(Pid).

get_latest_image(AirplaneCore) ->
    Pid = AirplaneCore#airplane_core.image_receiver_pid,
    image_receiver_mook:get_latest_image(Pid).

get_camera_front_img(AirplaneCore) ->
    KeyName = AirplaneCore#airplane_core.keyName,
    ImgB64 = http_layer:get_airplane_camera_image(KeyName, "front"),
    image_process:read_b64_img(ImgB64).

get_camera_down_img(AirplaneCore) ->
    KeyName = AirplaneCore#airplane_core.keyName,
    ImgB64 = http_layer:get_airplane_camera_image(KeyName, "down"),
    image_process:read_b64_img(ImgB64).
