-- UAV Adapter for Lua

local airplane_manager = require("airplane_manager")

local UAV = {}
UAV.__index = UAV

function UAV.new()
    local self = setmetatable({}, UAV)
    self.airs = airplane_manager.get_airplane_manager()
    self.airs:flush()
    self.airs:start()
    self.airs:flush()
    return self
end

function UAV:sleep(time)
    local start = os.clock()
    while os.clock() - start < time do end
end

function UAV:destroy()
end

function UAV:add_uav(port)
    self.airs:get_airplane(port)
end

function UAV:p(port)
    return self.airs:get_airplane(port)
end

function UAV:land(port)
    local uav = self:p(port)
    if uav then uav:land() end
end

function UAV:emergency(port)
    local uav = self:p(port)
    if uav then uav:stop() end
end

function UAV:takeoff(port, high)
    local uav = self:p(port)
    if uav then uav:takeoff(high) end
end

function UAV:up(port, distance)
    local uav = self:p(port)
    if uav then uav:up(distance) end
end

function UAV:down(port, distance)
    local uav = self:p(port)
    if uav then uav:down(distance) end
end

function UAV:forward(port, distance)
    local uav = self:p(port)
    if uav then uav:forward(distance) end
end

function UAV:back(port, distance)
    local uav = self:p(port)
    if uav then uav:back(distance) end
end

function UAV:left(port, distance)
    local uav = self:p(port)
    if uav then uav:left(distance) end
end

function UAV:right(port, distance)
    local uav = self:p(port)
    if uav then uav:right(distance) end
end

function UAV:goto_pos(port, x, y, h)
    local uav = self:p(port)
    if uav then uav:goto_pos(x, y, h) end
end

function UAV:flip(port, direction)
    local uav = self:p(port)
    if not uav then return end
    if direction == "f" then
        uav:flip_forward()
    elseif direction == "b" then
        uav:flip_back()
    elseif direction == "r" then
        uav:flip_right()
    elseif direction == "l" then
        uav:flip_left()
    end
end

function UAV:rotate(port, degree)
    local uav = self:p(port)
    if uav then uav:rotate(degree) end
end

function UAV:cw(port, degree)
    local uav = self:p(port)
    if uav then uav:cw(degree) end
end

function UAV:ccw(port, degree)
    local uav = self:p(port)
    if uav then uav:ccw(degree) end
end

function UAV:speed(port, speed_val)
    local uav = self:p(port)
    if uav then uav:speed(speed_val) end
end

function UAV:high(port, high_val)
    local uav = self:p(port)
    if uav then uav:high(high_val) end
end

function UAV:led(port, r, g, b)
    local uav = self:p(port)
    if uav then uav:led(r, g, b) end
end

function UAV:bln(port, r, g, b)
    local uav = self:p(port)
    if uav then uav:bln(r, g, b) end
end

function UAV:rainbow(port, r, g, b)
    local uav = self:p(port)
    if uav then uav:rainbow(r, g, b) end
end

function UAV:mode(port, mode_val)
    local uav = self:p(port)
    if uav then uav:airplane_mode(mode_val) end
end

function UAV:stop(port)
    local uav = self:p(port)
    if uav then uav:stop() end
end

function UAV:hover(port)
    local uav = self:p(port)
    if uav then uav:hover() end
end

return {
    UAV = UAV
}
