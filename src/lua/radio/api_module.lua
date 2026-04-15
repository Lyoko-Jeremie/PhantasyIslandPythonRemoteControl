-- ApiModule implementation in Lua

local ApiModule = {}
ApiModule.__index = ApiModule

function ApiModule.new(rm)
    local self = setmetatable({}, ApiModule)
    self._rm = rm
    self._now_mode = "sync"
    self.send = self._send_and_wait_sync
    return self
end

function ApiModule:mode(mode_val)
    if mode_val == "sync" then
        self.send = self._send_and_wait_sync
        self._now_mode = "sync"
    elseif mode_val == "async" then
        -- In Lua, 'async' will be treated similar to token or direct call for now
        self.send = self._send_and_wait_async
        self._now_mode = "async"
    elseif mode_val == "token" then
        self.send = self._send_and_wait_token
        self._now_mode = "token"
    else
        error("Invalid mode: " .. tostring(mode_val))
    end
    return self
end

function ApiModule:get_now_mode()
    return self._now_mode
end

function ApiModule:_send(cmd, data)
    return self._rm:_send(cmd, data)
end

function ApiModule:_send_and_wait_sync(cmd, data, wait_cmd, timeout, post_processor)
    return self._rm:_send_and_wait_sync(cmd, data, wait_cmd, timeout, post_processor)
end

function ApiModule:_send_and_wait_token(cmd, data, wait_cmd, post_processor)
    return self._rm:_send_and_wait_token(cmd, data, wait_cmd, post_processor)
end

function ApiModule:_send_and_wait_async(cmd, data, wait_cmd, timeout, post_processor)
    -- Placeholder for async behavior
    return self._rm:_send_and_wait_sync(cmd, data, wait_cmd, timeout, post_processor)
end

-- Narrowing helpers (optional in Lua, but for completeness)
local function as_sync(result)
    return result
end

local function as_token(result)
    return result
end

return {
    ApiModule = ApiModule,
    as_sync = as_sync,
    as_token = as_token
}
