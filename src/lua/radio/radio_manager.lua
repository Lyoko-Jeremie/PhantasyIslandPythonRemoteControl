-- RadioManager implementation in Lua

local wait_token = require("radio/wait_token")
local api_debug = require("radio/api_debug")
local api_scene = require("radio/api_scene")
local api_fly = require("radio/api_fly")
local api_radio = require("radio/api_radio")
local socketio = require("luasocketio")

local RadioManager = {}
RadioManager.__index = RadioManager

function RadioManager.new()
    local self = setmetatable({}, RadioManager)
    
    self.socketio = socketio.client()
    
    self.namespace = "/UserSide"
    self.scene_is_init = false
    self._pending_waiters = {}
    
    -- Initialize Sub-API modules
    self.debugApi = api_debug.DebugApi.new(self)
    self.sceneApi = api_scene.SceneApi.new(self)
    self.flyApi = api_fly.FlyApi.new(self)
    self.radioApi = api_radio.RadioApi.new(self)
    
    return self
end

function RadioManager:create_msg_timestamp_id()
    return math.floor(os.time() * 1000 * 100)
end

function RadioManager:connect(url, namespace)
    url = url or "http://127.0.0.1:60002"
    self.namespace = namespace or "/UserSide"
    self:reset()
    self:_init_listener()
    
    local parsed_url = url:gsub("http://", "")
    local host, port = parsed_url:match("([^:]+):?(%d*)")
    port = tonumber(port) or 80
    
    print("[RadioManager] connecting to " .. host .. ":" .. port .. " namespace: " .. self.namespace)
    self.socketio:connect(host, port)
end

function RadioManager:reset()
    if self.socketio.is_connected then
        self.socketio:disconnect()
    end
    self.scene_is_init = false
end

function RadioManager:_init_listener()
    self.socketio:on("connect", function()
        print("[RadioManager] connected")
        self:_check_scene_status()
    end)
    
    self.socketio:on("disconnect", function()
        print("[RadioManager] disconnected")
        self.scene_is_init = false
    end)

    self.socketio:on("message", function(data)
        -- Data might be a string (JSON) or a table depending on the library's decoder
        local msg = data
        if type(data) == "string" then
            -- If the library doesn't auto-decode, we'd use a JSON library here
            -- msg = json.decode(data)
        end
        self:msg_dispatch(msg)
    end)
end

function RadioManager:step()
    if self.socketio and self.socketio.step then
        self.socketio:step()
    end
end

function RadioManager:_check_scene_status()
    self:_send("ping")
    self:_send("scene.getInitState")
end

function RadioManager:ping()
    return self:_send_and_wait_sync("ping", nil, "pong")
end

function RadioManager:_send(cmd, data)
    local msg = { cmd = cmd }
    if data then
        for k, v in pairs(data) do
            msg[k] = v
        end
    end
    self.socketio:emit("message", msg, self.namespace)
end

function RadioManager:_send_with_token(cmd, data, wait_cmd, post_processor)
    wait_cmd = wait_cmd or cmd
    local time_base_id = self:create_msg_timestamp_id()
    local token = wait_token.WaitToken.new(wait_cmd, time_base_id)
    
    if post_processor then
        token:set_post_processor(post_processor)
    end
    
    if not self._pending_waiters[wait_cmd] then
        self._pending_waiters[wait_cmd] = {}
    end
    -- In Lua, we don't have weak references for objects in the same way as Python's weakref.ref(token)
    -- unless we use a weak table. For this preliminary version, we'll just store the token.
    table.insert(self._pending_waiters[wait_cmd], token)
    
    local msg = { timestampIdPython = time_base_id }
    if data then
        for k, v in pairs(data) do
            if v ~= nil then msg[k] = v end
        end
    end
    
    self:_send(cmd, msg)
    return token
end

function RadioManager:_send_and_wait_sync(cmd, data, wait_cmd, timeout, post_processor)
    timeout = timeout or 3.0
    local token = self:_send_with_token(cmd, data, wait_cmd, post_processor)
    return token:wait(timeout, self.socketio)
end

function RadioManager:_send_and_wait_token(cmd, data, wait_cmd, post_processor)
    return self:_send_with_token(cmd, data, wait_cmd, post_processor)
end

function RadioManager:_notify_waiters(cmd, data)
    local timestamp_id = data.timestampIdPython
    local waiters = self._pending_waiters[cmd]
    if not waiters then return false end
    
    local surviving = {}
    local matched = false
    for i, token in ipairs(waiters) do
        if not matched and timestamp_id and token.time_base_id == timestamp_id then
            token:complete(data)
            matched = true
        else
            table.insert(surviving, token)
        end
    end
    
    if #surviving > 0 then
        self._pending_waiters[cmd] = surviving
    else
        self._pending_waiters[cmd] = nil
    end
    
    return matched
end

function RadioManager:msg_dispatch(data)
    local cmd = data.cmd
    if self:_notify_waiters(cmd, data) then
        return
    end
    
    if cmd == "pong" then
        -- pass
    elseif cmd == "sceneReset" or cmd == "sceneNotInit" then
        self:_on_scene_reset(data)
    elseif cmd == "sceneInit" or cmd == "sceneIsInit" then
        self:_on_scene_init(data)
    else
        print("[RadioManager] unknown cmd: " .. tostring(cmd))
    end
end

function RadioManager:_on_scene_reset(data)
    print("[RadioManager] handle sceneReset")
    self.scene_is_init = false
end

function RadioManager:_on_scene_init(data)
    print("[RadioManager] handle sceneInit")
    self.scene_is_init = true
end

return {
    RadioManager = RadioManager
}
