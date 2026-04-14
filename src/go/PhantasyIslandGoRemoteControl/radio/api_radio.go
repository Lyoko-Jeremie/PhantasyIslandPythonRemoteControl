package radio

import "time"

type RadioApi struct {
	*ApiModule
}

func NewRadioApi(rm *RadioManager) *RadioApi {
	return &RadioApi{NewApiModule(rm)}
}

func (api *RadioApi) IsSceneInit() interface{} {
	return api.Send("radio.isSceneInit", nil, "", 3*time.Second, func(d map[string]interface{}) interface{} {
		return d["init"]
	})
}

func (api *RadioApi) IsRadioReachabilityCheckerInit() interface{} {
	return api.Send("radio.isRadioReachabilityCheckerInit", nil, "", 3*time.Second, func(d map[string]interface{}) interface{} {
		return d["init"]
	})
}

func (api *RadioApi) CheckReachability(aTx XYZ, bRx XYZ, options *RadioCheckOptions) interface{} {
	data := map[string]interface{}{
		"aTx":     []float64{aTx[0], aTx[1], aTx[2]},
		"bRx":     []float64{bRx[0], bRx[1], bRx[2]},
		"options": options,
	}
	return api.Send("radio.checkReachability", data, "", 3*time.Second, nil)
}

func (api *RadioApi) UpdateObjectPos(objectId string, position XYZ) interface{} {
	data := map[string]interface{}{
		"objectId": objectId,
		"position": []float64{position[0], position[1], position[2]},
	}
	return api.Send("radio.updateObjectPos", data, "", 3*time.Second, nil)
}

func (api *RadioApi) GetObjectPos(objectId string) interface{} {
	data := map[string]interface{}{
		"objectId": objectId,
	}
	return api.Send("radio.updateObjectPos", data, "", 3*time.Second, func(d map[string]interface{}) interface{} {
		return d["position"]
	})
}

func (api *RadioApi) UpdateMeshRadioMaterial(meshId string, materialId *string, thicknessM *float64) interface{} {
	data := map[string]interface{}{
		"meshId":      meshId,
		"materialId":  materialId,
		"thickness_m": thicknessM,
	}
	return api.Send("radio.updateMeshRadioMaterial", data, "", 3*time.Second, nil)
}

func (api *RadioApi) GetAllRadioMaterial() interface{} {
	return api.Send("radio.getAllRadioMaterial", nil, "", 3*time.Second, func(d map[string]interface{}) interface{} {
		return d["meshIds"]
	})
}

func (api *RadioApi) LocalRadioMaterial() interface{} {
	return api.Send("radio.localRadioMaterial", nil, "", 3*time.Second, func(d map[string]interface{}) interface{} {
		return d["meshIds"]
	})
}

func (api *RadioApi) GetBuildingRadioMaterial() interface{} {
	return api.Send("radio.getBuildingRadioMaterial", nil, "", 3*time.Second, nil)
}

func (api *RadioApi) AddRadioMaterial(material RadioMaterialProperties) interface{} {
	data := map[string]interface{}{
		"id":                         material.ID,
		"displayName":                material.DisplayName,
		"penetrationLoss_dBPerMeter": material.PenetrationLoss_dBPerMeter,
		"reflectionCoefficient":      material.ReflectionCoefficient,
		"defaultThickness_m":         material.DefaultThicknessM,
	}
	return api.Send("radio.addRadioMaterial", data, "", 3*time.Second, nil)
}

func (api *RadioApi) ListRadioLocalObjectsIds() interface{} {
	return api.Send("radio.listRadioLocalObjects", nil, "", 3*time.Second, func(d map[string]interface{}) interface{} {
		return d["localObjectIds"]
	})
}
