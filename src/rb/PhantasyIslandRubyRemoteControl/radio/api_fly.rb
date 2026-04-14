require_relative 'api_module'

class FlyApi < ApiModule
  def listFlyObject
    send('fly.listFlyObject')
  end

  def getFlyObjectInfo(keyName)
    send('fly.getFlyObjectInfo', { 'keyName' => keyName })
  end

  def getFlyObjectCameraImageDown(keyName)
    send('fly.getFlyObjectCameraImageDown', { 'keyName' => keyName })
  end

  def getFlyObjectCameraImageFront(keyName)
    send('fly.getFlyObjectCameraImageFront', { 'keyName' => keyName })
  end
end
