local http_layer = require("http_layer")
local image_process = require("image_process")
local image_receiver_mook = require("image_receiver_mook")

local AirplaneFlyStatus = {}
AirplaneFlyStatus.__index = AirplaneFlyStatus

function AirplaneFlyStatus.new(data)
    local self = setmetatable({}, AirplaneFlyStatus)
    self.landing = data.landing
    self.isStop = data.isStop
    self.x = data.x
    self.y = data.y
    self.h = data.h
    self.rX = data.rX
    self.rY = data.rY
    self.rZ = data.rZ
    return self
end

local function make_AirplaneFlyStatus(fly_status)
    return AirplaneFlyStatus.new(fly_status)
end

local AirplaneCore = {}
AirplaneCore.__index = AirplaneCore

function AirplaneCore.new(data)
    local self = setmetatable({}, AirplaneCore)
    self.keyName = data.keyName
    self.typeName = data.typeName
    self.updateTimestamp = data.updateTimestamp
    self.status = data.status
    self.cameraFront = data.cameraFront
    self.cameraDown = data.cameraDown
    
    -- __post_init__ logic
    self.image_receiver = image_receiver_mook.ImageReceiver.new(self)
    
    return self
end

function AirplaneCore:cap_image(user_receive_callback, user_progress_callback)
    self.image_receiver:send_cap_image(user_receive_callback, user_progress_callback)
end

function AirplaneCore:get_image_transfer_progress()
    return self.image_receiver:get_transfer_progress()
end

function AirplaneCore:is_image_transfer_in_progress()
    return self.image_receiver:is_transfer_in_progress()
end

function AirplaneCore:get_latest_image()
    return self.image_receiver:get_latest_image()
end

function AirplaneCore:get_camera_front_img()
    return image_process.read_b64_img(http_layer.get_airplane_camera_image(self.keyName, "front"))
end

function AirplaneCore:get_camera_down_img()
    return image_process.read_b64_img(http_layer.get_airplane_camera_image(self.keyName, "down"))
end

return {
    AirplaneFlyStatus = AirplaneFlyStatus,
    make_AirplaneFlyStatus = make_AirplaneFlyStatus,
    AirplaneCore = AirplaneCore
}
