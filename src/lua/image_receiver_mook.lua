-- Image receiver mock implementation in Lua

local ImageInfo = {}
ImageInfo.__index = ImageInfo

function ImageInfo.new(data)
    local self = setmetatable({}, ImageInfo)
    self.img = data.img
    self.id = data.id
    self.total_count = data.total_count
    self.progress_count = data.progress_count or 0
    self.ok = data.ok or false
    return self
end

local ImageReceiver = {}
ImageReceiver.__index = ImageReceiver

function ImageReceiver.new(airplane)
    local self = setmetatable({}, ImageReceiver)
    self.airplane = airplane
    self.image_instance = nil
    self._cmd_id_counter = 1
    self.now_loading_id = 0
    self.user_receive_callback = nil
    self.user_progress_callback = nil
    self.mook_time = 3
    return self
end

function ImageReceiver:send_cap_image(user_receive_callback, user_progress_callback)
    self.user_receive_callback = user_receive_callback
    self.user_progress_callback = user_progress_callback

    -- Lua doesn't have built-in threading like Python.
    -- In a typical Lua environment (e.g., game engine), this would be a coroutine.
    -- For this translation, we'll use a coroutine-based approach placeholder.
    
    local function mook_receive_task()
        self._cmd_id_counter = self._cmd_id_counter + 1
        self.now_loading_id = self._cmd_id_counter
        
        self.image_instance = ImageInfo.new({
            img = self.airplane:get_camera_down_img(),
            id = self._cmd_id_counter,
            total_count = self.mook_time * 100
        })

        while self.image_instance.progress_count < self.image_instance.total_count do
            -- Simulate time passing. In real Lua, you'd yield here or wait for a timer.
            -- os.execute("sleep 0.01") is too slow due to process overhead.
            self.image_instance.progress_count = self.image_instance.progress_count + 1
            
            if self.image_instance.id ~= self.now_loading_id then
                return
            end

            if self.user_progress_callback then
                self.user_progress_callback(self.image_instance.progress_count, self.image_instance.total_count)
            end
        end

        if self.image_instance.id == self.now_loading_id then
            self.image_instance.ok = true
            if self.user_receive_callback then
                self.user_receive_callback(self.image_instance.img)
            end
        end
    end

    -- In a real Lua system, you would schedule this function.
    -- Here we just call it directly for the preliminary version, 
    -- acknowledging it's blocking in this simple translation.
    mook_receive_task()
end

function ImageReceiver:get_latest_image()
    if self.image_instance == nil then
        return nil
    end
    if self.image_instance.ok then
        return self.image_instance.img
    else
        return nil
    end
end

function ImageReceiver:get_transfer_progress()
    if self.image_instance == nil then
        return nil
    end
    return self.image_instance.progress_count
end

function ImageReceiver:is_transfer_in_progress()
    if self.image_instance == nil then
        return false
    end
    return not self.image_instance.ok
end

return {
    ImageInfo = ImageInfo,
    ImageReceiver = ImageReceiver
}
