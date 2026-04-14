require_relative 'api_module'

class SceneApi < ApiModule
  def listAllMeshObjectInScene
    send('scene.listAllMeshObjectInScene')
  end

  def getObjectInfoById(objectId)
    send('scene.getObjectInfoById', { 'objectId' => objectId })
  end

  def removeObjectById(objectId)
    send('scene.removeObjectById', { 'objectId' => objectId })
  end

  def moveObjectById(objectId, position)
    send('scene.moveObjectById', {
      'objectId' => objectId,
      'position' => [position[0], position[1], position[2]]
    })
  end

  def setObjectRadioMaterial(objectId, materialId, thickness_m)
    send('scene.setObjectRadioMaterial', {
      'objectId' => objectId,
      'materialId' => materialId,
      'thickness_m' => thickness_m
    })
  end

  def updateMeshViewMaterial(meshId, viewMaterialChangeCommand)
    send('scene.updateMeshViewMaterial', {
      'meshId' => meshId,
      'viewMaterialChangeCommand' => viewMaterialChangeCommand
    })
  end

  def updateMeshViewMaterialSimple(meshId, viewMaterialChangeCommandSimple)
    send('scene.updateMeshViewMaterialSimple', {
      'meshId' => meshId,
      'viewMaterialChangeCommandSimple' => viewMaterialChangeCommandSimple
    })
  end
end
