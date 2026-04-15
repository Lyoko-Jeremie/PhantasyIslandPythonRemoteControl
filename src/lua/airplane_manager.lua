local airplane_core = require("airplane_core")
local control_command = require("control_command")
local http_layer = require("http_layer")

local AirplaneManager = {}
AirplaneManager.__index = AirplaneManager

function AirplaneManager.new()
    local self = setmetatable({}, AirplaneManager)
    self.airplanes_table = {}
    return self
end

function AirplaneManager:ping()
    return http_layer.ping()
end

function AirplaneManager:ping_volatile()
    return http_layer.ping_volatile()
end

function AirplaneManager:start()
    return http_layer.start()
end

function AirplaneManager:start_volatile()
    return http_layer.start_volatile()
end

function AirplaneManager:get_airplane(id)
    return self.airplanes_table[id]
end

function AirplaneManager:sleep(time)
    -- Lua standard library doesn't have sleep, but we can assume a sleep function is available or implemented
    -- In some environments it might be os.execute("sleep " .. tonumber(time)) or a socket-based sleep
    local start = os.clock()
    while os.clock() - start < time do end
end

function AirplaneManager:flush()
    local airplane_status = http_layer.process_airplane(http_layer.get_all_airplane_status())
    if airplane_status then
        for k, status in pairs(airplane_status) do
            if not self.airplanes_table[k] then
                self.airplanes_table[k] = control_command.AirplaneController.new({
                    keyName = status.keyName,
                    typeName = status.typeName,
                    updateTimestamp = status.updateTimestamp,
                    status = status.status,
                    cameraFront = status.cameraFront,
                    cameraDown = status.cameraDown
                })
            else
                local a = self.airplanes_table[k]
                a.keyName = status.keyName
                a.typeName = status.typeName
                a.updateTimestamp = status.updateTimestamp
                a.status = airplane_core.make_AirplaneFlyStatus(status.status)
                a.cameraFront = status.cameraFront
                a.cameraDown = status.cameraDown
            end
        end
    else
        return nil
    end
end

local airplane_manager_singleton = AirplaneManager.new()

local function get_airplane_manager()
    return airplane_manager_singleton
end

return {
    AirplaneManager = AirplaneManager,
    get_airplane_manager = get_airplane_manager
}
