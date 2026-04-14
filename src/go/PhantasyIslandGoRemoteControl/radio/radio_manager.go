package radio

import (
	"context"
	"fmt"
	"math"
	"sync"
	"time"

	socketio "github.com/googollee/go-socket.io"
)

// WaiterRef 模拟弱引用。在 Go 中没有直接的弱引用，
// 我们通过在 Token 完成或超时后手动从 map 中移除来模拟。
type WaiterRef struct {
	token *WaitToken
}

type RadioManager struct {
	client      *socketio.Client // 这里假设使用某个 go-socket.io 客户端库
	Namespace   string
	SceneIsInit bool

	// Sub-API 模块
	DebugApi *DebugApi
	SceneApi *SceneApi
	FlyApi   *FlyApi
	RadioApi *RadioApi

	pendingWaiters map[string][]*WaitToken
	waitersLock    sync.Mutex
}

func NewRadioManager() *RadioManager {
	rm := &RadioManager{
		Namespace:      "/UserSide",
		SceneIsInit:    false,
		pendingWaiters: make(map[string][]*WaitToken),
	}
	rm.DebugApi = NewDebugApi(rm)
	rm.SceneApi = NewSceneApi(rm)
	rm.FlyApi = NewFlyApi(rm)
	rm.RadioApi = NewRadioApi(rm)
	return rm
}

func (rm *RadioManager) CreateMsgTimestampID() int64 {
	return int64(math.Floor(float64(time.Now().UnixNano()) / 1e4))
}

func (rm *RadioManager) Connect(url string, namespace string) error {
	// 实际连接逻辑取决于所选的 socket.io 库
	rm.Namespace = namespace
	rm.initListener()
	fmt.Printf("[RadioManager] Connecting to %s%s\n", url, namespace)
	return nil
}

func (rm *RadioManager) initListener() {
	// 注册各种事件回调
}

func (rm *RadioManager) Ping() interface{} {
	return rm.SendAndWaitSync("ping", nil, "pong", 3*time.Second, nil)
}

func (rm *RadioManager) Send(cmd string, data map[string]interface{}) {
	msg := make(map[string]interface{})
	msg["cmd"] = cmd
	for k, v := range data {
		msg[k] = v
	}
	// 执行发送逻辑
}

func (rm *RadioManager) SendWithToken(cmd string, data map[string]interface{}, waitCmd string, postProcessor func(map[string]interface{}) interface{}) *WaitToken {
	if waitCmd == "" {
		waitCmd = cmd
	}

	timeBaseID := rm.CreateMsgTimestampID()
	token := NewWaitToken(waitCmd, timeBaseID)

	if postProcessor != nil {
		token.SetPostProcessor(postProcessor)
	}

	rm.waitersLock.Lock()
	rm.pendingWaiters[waitCmd] = append(rm.pendingWaiters[waitCmd], token)
	rm.waitersLock.Unlock()

	msg := make(map[string]interface{})
	msg["timestampIdPython"] = timeBaseID
	for k, v := range data {
		if v != nil {
			msg[k] = v
		}
	}

	rm.Send(cmd, msg)
	return token
}

func (rm *RadioManager) SendAndWaitSync(cmd string, data map[string]interface{}, waitCmd string, timeout time.Duration, postProcessor func(map[string]interface{}) interface{}) interface{} {
	token := rm.SendWithToken(cmd, data, waitCmd, postProcessor)
	return token.Wait(timeout)
}

func (rm *RadioManager) SendAndWaitAsync(ctx context.Context, cmd string, data map[string]interface{}, waitCmd string, postProcessor func(map[string]interface{}) interface{}) (interface{}, error) {
	token := rm.SendWithToken(cmd, data, waitCmd, postProcessor)
	return token.WaitAsync(ctx)
}

func (rm *RadioManager) NotifyWaiters(cmd string, data map[string]interface{}) bool {
	timestampIDRaw, ok := data["timestampIdPython"]
	if !ok {
		return false
	}
	timestampID := int64(timestampIDRaw.(float64))

	rm.waitersLock.Lock()
	defer rm.waitersLock.Unlock()

	waiters := rm.pendingWaiters[cmd]
	if len(waiters) == 0 {
		return false
	}

	var surviving []*WaitToken
	matched := false
	for _, token := range waiters {
		if !matched && token.TimeBaseID == timestampID {
			token.Complete(data)
			matched = true
		} else {
			surviving = append(surviving, token)
		}
	}

	if len(surviving) > 0 {
		rm.pendingWaiters[cmd] = surviving
	} else {
		delete(rm.pendingWaiters, cmd)
	}

	return matched
}

func (rm *RadioManager) MsgDispatch(data map[string]interface{}) {
	cmd, _ := data["cmd"].(string)
	if rm.NotifyWaiters(cmd, data) {
		return
	}

	switch cmd {
	case "pong":
	case "sceneReset", "sceneNotInit":
		rm.onSceneReset(data)
	case "sceneInit", "sceneIsInit":
		rm.onSceneInit(data)
	default:
		fmt.Printf("[RadioManager] unknown cmd: %s, data: %v\n", cmd, data)
	}
}

func (rm *RadioManager) onSceneReset(data map[string]interface{}) {
	rm.SceneIsInit = false
}

func (rm *RadioManager) onSceneInit(data map[string]interface{}) {
	rm.SceneIsInit = true
}
