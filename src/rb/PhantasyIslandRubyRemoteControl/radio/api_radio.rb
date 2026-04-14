require_relative 'api_module'
require_relative 'type_def'

class RadioApi < ApiModule
  def isSceneInit
    send('radio.isSceneInit', post_processor: ->(d) { d['init'] })
  end

  def isRadioReachabilityCheckerInit
    send('radio.isRadioReachabilityCheckerInit', post_processor: ->(d) { d['init'] })
  end

  def checkReachability(aTx, bRx, options)
    send('radio.checkReachability', {
      'aTx' => aTx,
      'bRx' => bRx,
      'options' => options ? options.to_h : nil
    })
  end

  def updateObjectPos(objectId, position)
    send('radio.updateObjectPos', {
      'objectId' => objectId,
      'position' => position
    })
  end

  def getObjectPos(objectId)
    send('radio.updateObjectPos', { 'objectId' => objectId }, 
         post_processor: ->(d) { d['position'] })
  end

  def updateMeshRadioMaterial(meshId, materialId, thickness_m)
    send('radio.updateMeshRadioMaterial', {
      'meshId' => meshId,
      'materialId' => materialId,
      'thickness_m' => thickness_m
    })
  end

  def getAllRadioMaterial
    send('radio.getAllRadioMaterial',
         post_processor: ->(d) { d['meshIds'].map { |n| RadioMaterialProperties.from_h(n) } })
  end

  def localRadioMaterial
    send('radio.localRadioMaterial',
         post_processor: ->(d) { d['meshIds'].map { |n| RadioMaterialProperties.from_h(n) } })
  end

  def getBuildingRadioMaterial
    send('radio.getBuildingRadioMaterial')
  end

  def addRadioMaterial(material)
    send('radio.addRadioMaterial', material.to_h)
  end

  def listRadioLocalObjectsIds
    send('radio.listRadioLocalObjects', 
         post_processor: ->(d) { d['localObjectIds'] })
  end
end
