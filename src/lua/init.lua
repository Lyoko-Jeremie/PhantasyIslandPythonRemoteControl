local airplane_manager = require("airplane_manager")
local airplane_core = require("airplane_core")
local control_command = require("control_command")
local ph0apy = require("ph0apy")
local uav = require("uav")

return {
    get_airplane_manager = airplane_manager.get_airplane_manager,
    AirplaneManager = airplane_manager.AirplaneManager,
    AirplaneCore = airplane_core.AirplaneCore,
    AirplaneController = control_command.AirplaneController,
    FH0A = ph0apy.FH0A,
    UAV = uav.UAV
}
