-- RadioApi implementation in Lua

local api_module = require("radio/api_module")
local type_def = require("radio/type_def")

local RadioApi = {}
RadioApi.__index = RadioApi
setmetatable(RadioApi, { __index = api_module.ApiModule })

function RadioApi.new(rm)
    local self = api_module.ApiModule.new(rm)
    setmetatable(self, RadioApi)
    return self
end

function RadioApi:isSceneInit()
    return self:send("radio.isSceneInit", nil, nil, nil, function(d) return d.init end)
end

function RadioApi:isRadioReachabilityCheckerInit()
    return self:send("radio.isRadioReachabilityCheckerInit", nil, nil, nil, function(d) return d.init end)
end

function RadioApi:checkReachability(aTx, bRx, options)
    return self:send("radio.checkReachability", {
        aTx = aTx,
        bRx = bRx,
        options = options and options:to_dict() or nil
    })
end

function RadioApi:updateObjectPos(objectId, position)
    return self:send("radio.updateObjectPos", {
        objectId = objectId,
        position = position
    })
end

function RadioApi:getObjectPos(objectId)
    return self:send("radio.updateObjectPos", {
        objectId = objectId
    }, nil, nil, function(d) return d.position end)
end

function RadioApi:updateMeshRadioMaterial(meshId, materialId, thickness_m)
    return self:send("radio.updateMeshRadioMaterial", {
        meshId = meshId,
        materialId = materialId,
        thickness_m = thickness_m
    })
end

function RadioApi:getAllRadioMaterial()
    return self:send("radio.getAllRadioMaterial", nil, nil, nil, function(d)
        local results = {}
        if d.meshIds then
            for _, n in ipairs(d.meshIds) do
                table.insert(results, type_def.radio_material_properties_from_dict(n))
            end
        end
        return results
    end)
end

function RadioApi:localRadioMaterial()
    return self:send("radio.localRadioMaterial", nil, nil, nil, function(d)
        local results = {}
        if d.meshIds then
            for _, n in ipairs(d.meshIds) do
                table.insert(results, type_def.radio_material_properties_from_dict(n))
            end
        end
        return results
    end)
end

function RadioApi:getBuildingRadioMaterial()
    return self:send("radio.getBuildingRadioMaterial")
end

function RadioApi:addRadioMaterial(material)
    return self:send("radio.addRadioMaterial", material:to_dict())
end

function RadioApi:listRadioLocalObjectsIds()
    return self:send("radio.listRadioLocalObjects", nil, nil, nil, function(d) return d.localObjectIds end)
end

return {
    RadioApi = RadioApi
}
