require_relative 'http_layer'
require_relative 'image_process'
require_relative 'image_receiver_mook'

# 每个飞机的飞行状态
class AirplaneFlyStatus
  attr_accessor :landing, :isStop, :x, :y, :h, :rX, :rY, :rZ

  def initialize(landing:, isStop:, x:, y:, h:, rX:, rY:, rZ:)
    @landing = landing
    @isStop = isStop
    @x = x
    @y = y
    @h = h
    @rX = rX
    @rY = rY
    @rZ = rZ
  end

  def self.from_h(fly_status)
    new(
      landing: fly_status['landing'],
      isStop: fly_status['isStop'],
      x: fly_status['x'],
      y: fly_status['y'],
      h: fly_status['h'],
      rX: fly_status['rX'],
      rY: fly_status['rY'],
      rZ: fly_status['rZ']
    )
  end
end

# 每个飞机的基本信息
class AirplaneCore
  attr_accessor :keyName, :typeName, :updateTimestamp, :status, :cameraFront, :cameraDown, :image_receiver

  def initialize(keyName:, typeName:, updateTimestamp:, status:, cameraFront:, cameraDown:)
    @keyName = keyName
    @typeName = typeName
    @updateTimestamp = updateTimestamp
    @status = status
    @cameraFront = cameraFront
    @cameraDown = cameraDown
    
    # 在这里实例化，此时可以安全地将 self 传给 ImageReceiver
    @image_receiver = ImageReceiver.new(self)
  end

  # 拍照
  def cap_image(user_receive_callback = nil, user_progress_callback = nil)
    @image_receiver.send_cap_image(user_receive_callback, user_progress_callback)
  end

  def get_image_transfer_progress
    @image_receiver.get_transfer_progress
  end

  def is_image_transfer_in_progress
    @image_receiver.is_transfer_in_progress
  end

  def get_latest_image
    @image_receiver.get_latest_image
  end

  # 获取前置摄像头图像
  def get_camera_front_img
    ImageProcess.read_b64_img(HttpLayer.get_airplane_camera_image(@keyName, 'front'))
  end

  # 获取下置摄像头图像
  def get_camera_down_img
    ImageProcess.read_b64_img(HttpLayer.get_airplane_camera_image(@keyName, 'down'))
  end
end
