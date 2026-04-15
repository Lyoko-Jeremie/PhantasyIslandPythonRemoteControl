-- Debug Radio script in Lua

local radio_manager = require("radio/radio_manager")
local api_module = require("radio/api_module")

local rm = radio_manager.RadioManager.new()
rm:connect()

print(rm:create_msg_timestamp_id())
print(rm:ping())

-- sync 模式（默认）
local data = api_module.as_sync(rm.radioApi:listRadioLocalObjectsIds())
print(data)

--[[
-- token 模式
rm.radioApi:mode("token")
local t = api_module.as_token(rm.radioApi:listRadioLocalObjectsIds())
print(t)
print(t:wait(10))
print(rm.radioApi:get_now_mode())
--]]

print("isSceneInit", rm.radioApi:isSceneInit())
print("isRadioReachabilityCheckerInit", rm.radioApi:isRadioReachabilityCheckerInit())
print("getAllRadioMaterial", rm.radioApi:getAllRadioMaterial())
print("localRadioMaterial", rm.radioApi:localRadioMaterial())
print("listRadioLocalObjectsIds", rm.radioApi:listRadioLocalObjectsIds())

-- In Lua, there isn't a direct equivalent to socketio.wait() 
-- unless using a specific library's loop.
-- os.execute("pause") -- Simple way to keep window open on Windows
