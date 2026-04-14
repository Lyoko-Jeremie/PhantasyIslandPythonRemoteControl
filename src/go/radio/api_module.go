package radio

import (
	"context"
	"time"
)

// ApiModule API 子模块的基类。
type ApiModule struct {
	rm      *RadioManager
	nowMode string
}

func NewApiModule(rm *RadioManager) *ApiModule {
	return &ApiModule{
		rm:      rm,
		nowMode: "sync",
	}
}

func (am *ApiModule) Mode(mode string) *ApiModule {
	am.nowMode = mode
	return am
}

func (am *ApiModule) Send(cmd string, data map[string]interface{}, waitCmd string, timeout time.Duration, postProcessor func(map[string]interface{}) interface{}) interface{} {
	switch am.nowMode {
	case "token":
		return am.rm.SendWithToken(cmd, data, waitCmd, postProcessor)
	case "async":
		// Go 中异步通常通过返回 channel 或使用 context。
		// 这里为了简化，我们让用户自己处理 context。
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()
		res, _ := am.rm.SendAndWaitAsync(ctx, cmd, data, waitCmd, postProcessor)
		return res
	case "sync":
		fallthrough
	default:
		return am.rm.SendAndWaitSync(cmd, data, waitCmd, timeout, postProcessor)
	}
}
