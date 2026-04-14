<?php

namespace PhantasyIslandPhpRemoteControl\Radio;

class SceneApi extends ApiModule
{
    public function listAllMeshObjectInScene()
    {
        return $this->send('scene.listAllMeshObjectInScene');
    }

    public function getObjectInfoById($objectId)
    {
        return $this->send('scene.getObjectInfoById', ['objectId' => $objectId]);
    }

    public function removeObjectById($objectId)
    {
        return $this->send('scene.removeObjectById', ['objectId' => $objectId]);
    }

    public function moveObjectById($objectId, $position)
    {
        return $this->send('scene.moveObjectById', [
            'objectId' => $objectId,
            'position' => [$position[0], $position[1], $position[2]]
        ]);
    }

    public function setObjectRadioMaterial($objectId, $materialId = null, $thickness_m = null)
    {
        return $this->send('scene.setObjectRadioMaterial', [
            'objectId' => $objectId,
            'materialId' => $materialId,
            'thickness_m' => $thickness_m
        ]);
    }

    public function updateMeshViewMaterial($meshId, $viewMaterialChangeCommand)
    {
        return $this->send('scene.updateMeshViewMaterial', [
            'meshId' => $meshId,
            'viewMaterialChangeCommand' => $viewMaterialChangeCommand
        ]);
    }

    public function updateMeshViewMaterialSimple($meshId, $viewMaterialChangeCommandSimple)
    {
        return $this->send('scene.updateMeshViewMaterialSimple', [
            'meshId' => $meshId,
            'viewMaterialChangeCommandSimple' => $viewMaterialChangeCommandSimple
        ]);
    }
}
