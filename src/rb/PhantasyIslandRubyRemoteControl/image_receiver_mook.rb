require 'thread'

class ImageInfo
  attr_accessor :img, :id, :total_count, :progress_count, :ok

  def initialize(img:, id:, total_count:, progress_count: 0, ok: false)
    @img = img
    @id = id
    @total_count = total_count
    @progress_count = progress_count
    @ok = ok
  end
end

class ImageReceiver
  attr_accessor :airplane, :image_instance, :now_loading_id, :user_receive_callback, :user_progress_callback

  def initialize(airplane)
    @airplane = airplane
    @image_instance = nil
    @cmd_id_counter = 1
    @now_loading_id = 0
    @lock = Mutex.new
    @mook_time = 3
  end

  def send_cap_image(user_receive_callback = nil, user_progress_callback = nil)
    @user_receive_callback = user_receive_callback
    @user_progress_callback = user_progress_callback

    Thread.new do
      mook_receive_thread
    end
  end

  def mook_receive_thread
    @lock.synchronize do
      @cmd_id_counter += 1
      @now_loading_id = @cmd_id_counter
      @image_instance = ImageInfo.new(
        img: @airplane.get_camera_down_img,
        id: @cmd_id_counter,
        total_count: @mook_time * 100
      )
    end

    while @image_instance.progress_count < @image_instance.total_count
      sleep(0.01)
      @lock.synchronize do
        break if @image_instance.id != @now_loading_id
        @image_instance.progress_count += 1
      end

      if @user_progress_callback
        @user_progress_callback.call(@image_instance.progress_count, @image_instance.total_count)
      end
    end

    @lock.synchronize do
      if @image_instance.id == @now_loading_id
        @image_instance.ok = true
      end
    end

    if @image_instance.id == @now_loading_id && @image_instance.progress_count >= @image_instance.total_count && @user_receive_callback
      @user_receive_callback.call(@image_instance.img)
    end
  end

  def get_latest_image
    @lock.synchronize do
      return nil if @image_instance.nil?
      @image_instance.ok ? @image_instance.img : nil
    end
  end

  def get_transfer_progress
    @lock.synchronize do
      return nil if @image_instance.nil?
      @image_instance.progress_count
    end
  end

  def is_transfer_in_progress
    @lock.synchronize do
      return false if @image_instance.nil?
      !@image_instance.ok
    end
  end
end
