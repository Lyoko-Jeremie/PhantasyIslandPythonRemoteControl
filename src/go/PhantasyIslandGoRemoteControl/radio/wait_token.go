package radio

import (
	"context"
	"sync"
	"time"
)

// WaitToken 一次请求对应的小状态机。
type WaitToken struct {
	WaitCmd           string
	TimeBaseID        int64
	Response          map[string]interface{}
	ProcessedResponse interface{}
	doneChan          chan struct{}
	mu                sync.Mutex
	postProcessor     func(map[string]interface{}) interface{}
}

func NewWaitToken(waitCmd string, timeBaseID int64) *WaitToken {
	return &WaitToken{
		WaitCmd:    waitCmd,
		TimeBaseID: timeBaseID,
		doneChan:   make(chan struct{}),
	}
}

// Done 令牌是否已收到响应。
func (wt *WaitToken) Done() bool {
	select {
	case <-wt.doneChan:
		return true
	default:
		return false
	}
}

// SetPostProcessor 注册后处理回调。
func (wt *WaitToken) SetPostProcessor(processor func(map[string]interface{}) interface{}) *WaitToken {
	wt.mu.Lock()
	defer wt.mu.Unlock()
	wt.postProcessor = processor
	return wt
}

func (wt *WaitToken) applyPostProcessor(data map[string]interface{}) interface{} {
	wt.mu.Lock()
	defer wt.mu.Unlock()
	if wt.postProcessor != nil {
		wt.ProcessedResponse = wt.postProcessor(data)
	} else {
		wt.ProcessedResponse = data
	}
	return wt.ProcessedResponse
}

// Complete 填充响应并唤醒等待者。
func (wt *WaitToken) Complete(data map[string]interface{}) {
	wt.mu.Lock()
	if wt.Done() {
		wt.mu.Unlock()
		return
	}
	wt.Response = data
	wt.mu.Unlock()

	wt.applyPostProcessor(data)

	close(wt.doneChan)
}

// Wait 阻塞当前线程直到收到响应或超时。
func (wt *WaitToken) Wait(timeout time.Duration) interface{} {
	select {
	case <-wt.doneChan:
		wt.mu.Lock()
		defer wt.mu.Unlock()
		return wt.ProcessedResponse
	case <-time.After(timeout):
		return nil
	}
}

// WaitAsync 异步等待（支持 context）。
func (wt *WaitToken) WaitAsync(ctx context.Context) (interface{}, error) {
	select {
	case <-wt.doneChan:
		wt.mu.Lock()
		defer wt.mu.Unlock()
		return wt.ProcessedResponse, nil
	case <-ctx.Done():
		return nil, ctx.Err()
	}
}
