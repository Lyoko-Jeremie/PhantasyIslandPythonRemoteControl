local airplane_core = require("airplane_core")
local http_layer = require("http_layer")

local AirplaneController = {}
AirplaneController.__index = AirplaneController
setmetatable(AirplaneController, {__index = airplane_core.AirplaneCore})

function AirplaneController.new(data)
    local self = airplane_core.AirplaneCore.new(data)
    setmetatable(self, AirplaneController)
    self.count = 1
    self._send_cmd_fn = http_layer.send_cmd
    return self
end

function AirplaneController:use_fast_mode(fast_mode, future_mode)
    if fast_mode == nil then fast_mode = true end
    if future_mode == nil then future_mode = true end
    
    if not future_mode then
        if fast_mode then
            self._send_cmd_fn = http_layer.send_cmd_volatile
        else
            self._send_cmd_fn = http_layer.send_cmd
        end
    else
        -- Lua doesn't have a built-in ThreadPoolExecutor like Python.
        -- In a real Lua environment, this might use a coroutine or a task scheduler.
        -- For this preliminary implementation, we'll just wrap it.
        if fast_mode then
            self._send_cmd_fn = function(cmd)
                -- Placeholder for async/future execution
                return http_layer.send_cmd_volatile(cmd)
            end
        else
            self._send_cmd_fn = function(cmd)
                -- Placeholder for async/future execution
                return http_layer.send_cmd(cmd)
            end
        end
    end
end

function AirplaneController:_next_count()
    self.count = self.count + 2
    return self.count
end

function AirplaneController:_prepare_command(command)
    return self.keyName .. " " .. tostring(self:_next_count()) .. " " .. command
end

function AirplaneController:_send_cmd(command)
    return self._send_cmd_fn(self:_prepare_command(command))
end

function AirplaneController:mode(mode_val)
    self:airplane_mode(mode_val)
end

function AirplaneController:takeoff(high)
    return self:_send_cmd(string.format("takeoff %d", high))
end

function AirplaneController:land()
    return self:_send_cmd("land")
end

function AirplaneController:emergency()
    return self:_send_cmd("emergency")
end

function AirplaneController:up(distance)
    return self:_send_cmd(string.format("up %d", distance))
end

function AirplaneController:down(distance)
    return self:_send_cmd(string.format("down %d", distance))
end

function AirplaneController:forward(distance)
    return self:_send_cmd(string.format("forward %d", distance))
end

function AirplaneController:back(distance)
    return self:_send_cmd(string.format("back %d", distance))
end

function AirplaneController:left(distance)
    return self:_send_cmd(string.format("left %d", distance))
end

function AirplaneController:right(distance)
    return self:_send_cmd(string.format("right %d", distance))
end

function AirplaneController:goto_pos(x, y, h)
    return self:_send_cmd(string.format("goto %d %d %d", x, y, h))
end

function AirplaneController:flip(direction)
    return self:_send_cmd(string.format("flip %s 1", direction))
end

function AirplaneController:flip_forward()
    self:flip("f")
end

function AirplaneController:flip_back()
    self:flip("b")
end

function AirplaneController:flip_left()
    self:flip("l")
end

function AirplaneController:flip_right()
    self:flip("r")
end

function AirplaneController:rotate(degree)
    return self:_send_cmd(string.format("rotate %d", degree))
end

function AirplaneController:cw(degree)
    return self:_send_cmd(string.format("cw %d", degree))
end

function AirplaneController:ccw(degree)
    return self:_send_cmd(string.format("ccw %d", degree))
end

function AirplaneController:high(high_val)
    return self:_send_cmd(string.format("high %d", high_val))
end

function AirplaneController:speed(speed_val)
    return self:_send_cmd(string.format("setSpeed %d", speed_val))
end

function AirplaneController:led(r, g, b)
    return self:_send_cmd(string.format("light %d %d %d", r, g, b))
end

function AirplaneController:bln(r, g, b)
    return self:_send_cmd(string.format("bln %d %d %d", r, g, b))
end

function AirplaneController:rainbow(r, g, b)
    return self:_send_cmd(string.format("rainbow %d %d %d", r, g, b))
end

function AirplaneController:airplane_mode(mode_val)
    return self:_send_cmd(string.format("airplane_mode %d", mode_val))
end

function AirplaneController:stop()
    return self:hover()
end

function AirplaneController:hover()
    return self:_send_cmd("hover")
end

return {
    AirplaneController = AirplaneController
}
