package radio

import "time"

type SceneApi struct {
	*ApiModule
}

func NewSceneApi(rm *RadioManager) *SceneApi {
	return &SceneApi{NewApiModule(rm)}
}

func (api *SceneApi) ListAllMeshObjectInScene() interface{} {
	return api.Send("scene.listAllMeshObjectInScene", nil, "", 3*time.Second, nil)
}

func (api *SceneApi) GetObjectInfoByID(objectId string) interface{} {
	return api.Send("scene.getObjectInfoById", map[string]interface{}{"objectId": objectId}, "", 3*time.Second, nil)
}

func (api *SceneApi) RemoveObjectByID(objectId string) interface{} {
	return api.Send("scene.removeObjectById", map[string]interface{}{"objectId": objectId}, "", 3*time.Second, nil)
}

func (api *SceneApi) MoveObjectByID(objectId string, position XYZ) interface{} {
	return api.Send("scene.moveObjectById", map[string]interface{}{
		"objectId": objectId,
		"position": []float64{position[0], position[1], position[2]},
	}, "", 3*time.Second, nil)
}

func (api *SceneApi) SetObjectRadioMaterial(objectId string, materialId *string, thicknessM *float64) interface{} {
	return api.Send("scene.setObjectRadioMaterial", map[string]interface{}{
		"objectId":    objectId,
		"materialId":  materialId,
		"thickness_m": thicknessM,
	}, "", 3*time.Second, nil)
}

func (api *SceneApi) UpdateMeshViewMaterial(meshId string, cmd ViewMaterialChangeCommand) interface{} {
	return api.Send("scene.updateMeshViewMaterial", map[string]interface{}{
		"meshId":                    meshId,
		"viewMaterialChangeCommand": cmd,
	}, "", 3*time.Second, nil)
}

func (api *SceneApi) UpdateMeshViewMaterialSimple(meshId string, cmd ViewMaterialChangeCommandSimple) interface{} {
	return api.Send("scene.updateMeshViewMaterialSimple", map[string]interface{}{
		"meshId":                          meshId,
		"viewMaterialChangeCommandSimple": cmd,
	}, "", 3*time.Second, nil)
}
