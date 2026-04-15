-- DebugApi implementation in Lua

local api_module = require("radio/api_module")

local DebugApi = {}
DebugApi.__index = DebugApi
setmetatable(DebugApi, { __index = api_module.ApiModule })

function DebugApi.new(rm)
    local self = api_module.ApiModule.new(rm)
    setmetatable(self, DebugApi)
    return self
end

function DebugApi:ping()
    return self:send("ping", nil, "pong")
end

return {
    DebugApi = DebugApi
}
