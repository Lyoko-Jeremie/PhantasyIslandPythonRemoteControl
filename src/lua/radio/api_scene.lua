-- SceneApi implementation in Lua

local api_module = require("radio/api_module")

local SceneApi = {}
SceneApi.__index = SceneApi
setmetatable(SceneApi, { __index = api_module.ApiModule })

function SceneApi.new(rm)
    local self = api_module.ApiModule.new(rm)
    setmetatable(self, SceneApi)
    return self
end

function SceneApi:listAllMeshObjectInScene()
    return self:send("scene.listAllMeshObjectInScene")
end

function SceneApi:getObjectInfoById(objectId)
    return self:send("scene.getObjectInfoById", { objectId = objectId })
end

function SceneApi:removeObjectById(objectId)
    return self:send("scene.removeObjectById", { objectId = objectId })
end

function SceneApi:moveObjectById(objectId, position)
    return self:send("scene.moveObjectById", {
        objectId = objectId,
        position = { position[1], position[2], position[3] }
    })
end

function SceneApi:setObjectRadioMaterial(objectId, materialId, thickness_m)
    return self:send("scene.setObjectRadioMaterial", {
        objectId = objectId,
        materialId = materialId,
        thickness_m = thickness_m
    })
end

function SceneApi:updateMeshViewMaterial(meshId, viewMaterialChangeCommand)
    return self:send("scene.updateMeshViewMaterial", {
        meshId = meshId,
        viewMaterialChangeCommand = viewMaterialChangeCommand
    })
end

function SceneApi:updateMeshViewMaterialSimple(meshId, viewMaterialChangeCommandSimple)
    return self:send("scene.updateMeshViewMaterialSimple", {
        meshId = meshId,
        viewMaterialChangeCommandSimple = viewMaterialChangeCommandSimple
    })
end

return {
    SceneApi = SceneApi
}
