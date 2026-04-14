package radio

import "time"

type DebugApi struct {
	*ApiModule
}

func NewDebugApi(rm *RadioManager) *DebugApi {
	return &DebugApi{NewApiModule(rm)}
}

func (api *DebugApi) Ping() interface{} {
	return api.Send("ping", nil, "pong", 3*time.Second, nil)
}
