-module(api_fly).
-export([listFlyObject/1, getFlyObjectInfo/2, getFlyObjectCameraImageDown/2, getFlyObjectCameraImageFront/2]).

listFlyObject(State) ->
    api_module:send(State, "fly.listFlyObject", #{}).

getFlyObjectInfo(State, KeyName) ->
    api_module:send(State, "fly.getFlyObjectInfo", #{<<"keyName">> => KeyName}).

getFlyObjectCameraImageDown(State, KeyName) ->
    api_module:send(State, "fly.getFlyObjectCameraImageDown", #{<<"keyName">> => KeyName}).

getFlyObjectCameraImageFront(State, KeyName) ->
    api_module:send(State, "fly.getFlyObjectCameraImageFront", #{<<"keyName">> => KeyName}).
