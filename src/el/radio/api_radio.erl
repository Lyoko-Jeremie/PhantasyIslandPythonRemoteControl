-module(api_radio).
-export([isSceneInit/1, isRadioReachabilityCheckerInit/1, checkReachability/4, updateObjectPos/3, getObjectPos/2, updateMeshRadioMaterial/4, getAllRadioMaterial/1, localRadioMaterial/1, getBuildingRadioMaterial/1, addRadioMaterial/2, listRadioLocalObjectsIds/1]).

isSceneInit(State) ->
    api_module:send(State, "radio.isSceneInit", #{}).

isRadioReachabilityCheckerInit(State) ->
    api_module:send(State, "radio.isRadioReachabilityCheckerInit", #{}).

checkReachability(State, ATx, BRx, Options) ->
    Data = #{
        <<"aTx">> => ATx,
        <<"bRx">> => BRx,
        <<"options">> => if Options =/= nil -> type_def:radio_check_options_to_map(Options); true -> nil end
    },
    api_module:send(State, "radio.checkReachability", Data).

updateObjectPos(State, ObjectId, Position) ->
    api_module:send(State, "radio.updateObjectPos", #{<<"objectId">> => ObjectId, <<"position">> => Position}).

getObjectPos(State, ObjectId) ->
    api_module:send(State, "radio.getObjectPos", #{<<"objectId">> => ObjectId}).

updateMeshRadioMaterial(State, MeshId, MaterialId, Thickness) ->
    api_module:send(State, "radio.updateMeshRadioMaterial", #{<<"meshId">> => MeshId, <<"materialId">> => MaterialId, <<"thickness_m">> => Thickness}).

getAllRadioMaterial(State) ->
    api_module:send(State, "radio.getAllRadioMaterial", #{}).

localRadioMaterial(State) ->
    api_module:send(State, "radio.localRadioMaterial", #{}).

getBuildingRadioMaterial(State) ->
    api_module:send(State, "radio.getBuildingRadioMaterial", #{}).

addRadioMaterial(State, Material) ->
    api_module:send(State, "radio.addRadioMaterial", type_def:radio_material_properties_to_map(Material)).

listRadioLocalObjectsIds(State) ->
    api_module:send(State, "radio.listRadioLocalObjects", #{}).
