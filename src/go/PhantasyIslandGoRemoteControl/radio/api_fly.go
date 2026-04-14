package radio

import "time"

type FlyApi struct {
	*ApiModule
}

func NewFlyApi(rm *RadioManager) *FlyApi {
	return &FlyApi{NewApiModule(rm)}
}

func (api *FlyApi) ListFlyObject() interface{} {
	return api.Send("fly.listFlyObject", nil, "", 3*time.Second, nil)
}

func (api *FlyApi) GetFlyObjectInfo(keyName string) interface{} {
	return api.Send("fly.getFlyObjectInfo", map[string]interface{}{"keyName": keyName}, "", 3*time.Second, nil)
}

func (api *FlyApi) GetFlyObjectCameraImageDown(keyName string) interface{} {
	return api.Send("fly.getFlyObjectCameraImageDown", map[string]interface{}{"keyName": keyName}, "", 3*time.Second, nil)
}

func (api *FlyApi) GetFlyObjectCameraImageFront(keyName string) interface{} {
	return api.Send("fly.getFlyObjectCameraImageFront", map[string]interface{}{"keyName": keyName}, "", 3*time.Second, nil)
}
