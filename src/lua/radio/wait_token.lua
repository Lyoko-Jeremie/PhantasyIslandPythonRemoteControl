-- WaitToken implementation in Lua

local WaitToken = {}
WaitToken.__index = WaitToken

function WaitToken.new(wait_cmd, time_base_id)
    local self = setmetatable({}, WaitToken)
    self.wait_cmd = wait_cmd
    self.time_base_id = time_base_id
    self.response = nil
    self.processed_response = nil
    self._done = false
    self._post_processor = nil
    return self
end

function WaitToken:is_done()
    return self._done
end

function WaitToken:set_post_processor(processor)
    self._post_processor = processor
    return self
end

function WaitToken:_apply_post_processor(data)
    local result
    if self._post_processor then
        result = self._post_processor(data)
    else
        result = data
    end
    self.processed_response = result
    return result
end

function WaitToken:complete(data)
    self.response = data
    self:_apply_post_processor(data)
    self._done = true
    -- In Lua, we don't have a standard Event object.
    -- If using a specific framework, you'd trigger an event here.
end

function WaitToken:wait(timeout, client)
    timeout = timeout or 3.0
    local start_time = os.clock()
    while not self._done do
        if os.clock() - start_time > timeout then
            return nil
        end
        if client and client.step then
            client:step()
        end
    end
    return self.processed_response
end

return {
    WaitToken = WaitToken
}
