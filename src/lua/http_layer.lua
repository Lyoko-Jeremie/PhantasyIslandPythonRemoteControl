local config = require("config")

-- Lua does not have a built-in http/json library. 
-- In a real environment, you would use 'lua-http' or 'copas' and 'dkjson' or 'cjson'.
-- For this preliminary implementation, we define placeholders.

local function http_get(url, timeout)
    -- This is a placeholder for a real HTTP GET request.
    -- In a real implementation, you might use a library like 'socket.http' or 'requests' (if available).
    error("http_get not implemented. Please use a Lua HTTP library.")
end

local function json_decode(s)
    -- This is a placeholder for a real JSON decoder.
    -- In a real implementation, you would use a library like 'dkjson' or 'cjson'.
    error("json_decode not implemented. Please use a Lua JSON library.")
end

local function ping()
    return require("http_layer").send_cmd("ping")
end

local function ping_volatile()
    return require("http_layer").send_cmd_volatile("ping")
end

local function start()
    return require("http_layer").send_cmd("start")
end

local function start_volatile()
    return require("http_layer").send_cmd_volatile("start")
end

local function send_cmd(s)
    local url = "http://" .. config.remote_location .. "/ECU_HTTP/sendStringCmd?c=" .. s
    local status, result = pcall(function()
        -- Mocking the response for the purpose of this translation
        local response_text = "{ \"ok\": true, \"r\": \"ok\" }" 
        return json_decode(response_text)
    end)
    
    if not status then
        print("send_cmd " .. s .. " Error: " .. tostring(result))
        return { ok = false, r = "ConnectionError" }
    end
    return result
end

local function send_cmd_volatile(s)
    local url = "http://" .. config.remote_location .. "/ECU_HTTP/sendStringCmd?cc=" .. s
    local status, result = pcall(function()
        local response_text = "{ \"ok\": true, \"r\": \"ok\" }" 
        return json_decode(response_text)
    end)
    
    if not status then
        print("send_cmd_volatile " .. s .. " Error: " .. tostring(result))
        return { ok = false, r = "ConnectionError" }
    end
    return result
end

local function get_all_airplane_status()
    local url = "http://" .. config.remote_location .. "/ECU_HTTP/requestPullAllAirplaneState"
    local status, result = pcall(function()
        local response_text = "{ \"ok\": true, \"airplanes\": [] }" 
        return json_decode(response_text)
    end)
    
    if not status then
        error("ConnectionError Cannot Connect to PhantasyIsland")
    end
    return result
end

local function get_airplane_camera_image(port, camera)
    local url = "http://" .. config.remote_location .. "/ECU_HTTP/requestPullImage?flyPort=" .. port .. "&imageType=" .. camera
    local status, result = pcall(function()
        local response_text = "{ \"ok\": true, \"imgDataString\": \"\" }"
        local j = json_decode(response_text)
        if j.ok then
            return j.imgDataString
        else
            return nil
        end
    end)
    
    if not status then
        return nil
    end
    return result
end

local function process_airplane(j)
    if j and j.ok then
        local airplanes = j.airplanes
        local airplaneStatus = {}
        for _, air in ipairs(airplanes) do
            local status = {}
            status.keyName = air.keyName
            status.typeName = air.typeName
            status.updateTimestamp = air.updateTimestamp
            status.status = air.status
            
            local camera_front = air.cameraFront
            status.cameraFront = camera_front and camera_front.imgDataString
            
            local camera_down = air.cameraDown
            status.cameraDown = camera_down and camera_down.imgDataString
            
            airplaneStatus[status.keyName] = status
        end
        return airplaneStatus
    else
        return nil
    end
end

return {
    ping = ping,
    ping_volatile = ping_volatile,
    start = start,
    start_volatile = start_volatile,
    send_cmd = send_cmd,
    send_cmd_volatile = send_cmd_volatile,
    get_all_airplane_status = get_all_airplane_status,
    get_airplane_camera_image = get_airplane_camera_image,
    process_airplane = process_airplane
}
