-- FH0A Adapter for Lua

local airplane_manager = require("airplane_manager")

local FH0A = {}
FH0A.__index = FH0A

function FH0A.new()
    local self = setmetatable({}, FH0A)
    self.airs = airplane_manager.get_airplane_manager()
    self.airs:flush()
    self.airs:start()
    self.airs:flush()
    return self
end

function FH0A:sleep(time)
    -- Assuming a sleep function is available
    local start = os.clock()
    while os.clock() - start < time do end
end

function FH0A:destroy()
    -- Placeholder
end

function FH0A:add_uav(port)
    self.airs:get_airplane(port)
end

function FH0A:p(port)
    return self.airs:get_airplane(port)
end

function FH0A:land(port)
    local uav = self:p(port)
    if uav then uav:land() end
end

function FH0A:takeoff(port, high)
    local uav = self:p(port)
    if uav then uav:takeoff(high) end
end

function FH0A:up(port, distance)
    local uav = self:p(port)
    if uav then uav:up(distance) end
end

function FH0A:down(port, distance)
    local uav = self:p(port)
    if uav then uav:down(distance) end
end

function FH0A:forward(port, distance)
    local uav = self:p(port)
    if uav then uav:forward(distance) end
end

function FH0A:back(port, distance)
    local uav = self:p(port)
    if uav then uav:back(distance) end
end

function FH0A:left(port, distance)
    local uav = self:p(port)
    if uav then uav:left(distance) end
end

function FH0A:right(port, distance)
    local uav = self:p(port)
    if uav then uav:right(distance) end
end

function FH0A:goto_pos(port, x, y, h)
    local uav = self:p(port)
    if uav then uav:goto_pos(x, y, h) end
end

function FH0A:flip(port, direction)
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

function FH0A:rotate(port, degree)
    local uav = self:p(port)
    if uav then uav:rotate(degree) end
end

function FH0A:cw(port, degree)
    local uav = self:p(port)
    if uav then uav:cw(degree) end
end

function FH0A:ccw(port, degree)
    local uav = self:p(port)
    if uav then uav:ccw(degree) end
end

function FH0A:speed(port, speed_val)
    local uav = self:p(port)
    if uav then uav:speed(speed_val) end
end

function FH0A:high(port, high_val)
    local uav = self:p(port)
    if uav then uav:high(high_val) end
end

function FH0A:led(port, r, g, b)
    local uav = self:p(port)
    if uav then uav:led(r, g, b) end
end

function FH0A:bln(port, r, g, b)
    local uav = self:p(port)
    if uav then uav:bln(r, g, b) end
end

function FH0A:rainbow(port, r, g, b)
    local uav = self:p(port)
    if uav then uav:rainbow(r, g, b) end
end

function FH0A:mode(port, mode_val)
    local uav = self:p(port)
    if uav then uav:airplane_mode(mode_val) end
end

function FH0A:color_detect(port, L_L, L_H, A_L, A_H, B_L, B_H)
    -- Placeholder
end

function FH0A:vision_mode(port, mode_val)
    -- Placeholder
end

function FH0A:stop(port)
    local uav = self:p(port)
    if uav then uav:stop() end
end

function FH0A:hover(port)
    local uav = self:p(port)
    if uav then uav:hover() end
end

return {
    FH0A = FH0A
}
