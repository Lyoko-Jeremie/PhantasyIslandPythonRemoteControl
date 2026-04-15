-- FlyApi implementation in Lua

local api_module = require("radio/api_module")

local FlyApi = {}
FlyApi.__index = FlyApi
setmetatable(FlyApi, { __index = api_module.ApiModule })

function FlyApi.new(rm)
    local self = api_module.ApiModule.new(rm)
    setmetatable(self, FlyApi)
    return self
end

function FlyApi:listFlyObject()
    return self:send("fly.listFlyObject")
end

function FlyApi:getFlyObjectInfo(keyName)
    return self:send("fly.getFlyObjectInfo", { keyName = keyName })
end

function FlyApi:getFlyObjectCameraImageDown(keyName)
    return self:send("fly.getFlyObjectCameraImageDown", { keyName = keyName })
end

function FlyApi:getFlyObjectCameraImageFront(keyName)
    return self:send("fly.getFlyObjectCameraImageFront", { keyName = keyName })
end

return {
    FlyApi = FlyApi
}
