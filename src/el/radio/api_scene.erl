-module(api_scene).
-export([listAllMeshObjectInScene/1, getObjectInfoById/2, removeObjectById/2, moveObjectById/3, setObjectRadioMaterial/4, updateMeshViewMaterial/3, updateMeshViewMaterialSimple/3]).

listAllMeshObjectInScene(State) ->
    api_module:send(State, "scene.listAllMeshObjectInScene", #{}).

getObjectInfoById(State, ObjectId) ->
    api_module:send(State, "scene.getObjectInfoById", #{<<"objectId">> => ObjectId}).

removeObjectById(State, ObjectId) ->
    api_module:send(State, "scene.removeObjectById", #{<<"objectId">> => ObjectId}).

moveObjectById(State, ObjectId, {X, Y, Z}) ->
    api_module:send(State, "scene.moveObjectById", #{<<"objectId">> => ObjectId, <<"position">> => [X, Y, Z]}).

setObjectRadioMaterial(State, ObjectId, MaterialId, Thickness) ->
    api_module:send(State, "scene.setObjectRadioMaterial", #{<<"objectId">> => ObjectId, <<"materialId">> => MaterialId, <<"thickness_m">> => Thickness}).

updateMeshViewMaterial(State, MeshId, Command) ->
    api_module:send(State, "scene.updateMeshViewMaterial", #{<<"meshId">> => MeshId, <<"viewMaterialChangeCommand">> => type_def_view:view_material_change_command_to_map(Command)}).

updateMeshViewMaterialSimple(State, MeshId, Command) ->
    api_module:send(State, "scene.updateMeshViewMaterialSimple", #{<<"meshId">> => MeshId, <<"viewMaterialChangeCommandSimple">> => type_def_view:view_material_change_command_simple_to_map(Command)}).
