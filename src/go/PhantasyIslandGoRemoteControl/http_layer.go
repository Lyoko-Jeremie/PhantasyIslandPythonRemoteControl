package PhantasyIslandGoRemoteControl

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// Ping 发送 ping 命令
func Ping() map[string]interface{} {
	return SendCmd("ping")
}

// PingVolatile 发送 ping 命令 (volatile)
func PingVolatile() map[string]interface{} {
	return SendCmdVolatile("ping")
}

// Start 发送 start 命令
func Start() map[string]interface{} {
	return SendCmd("start")
}

// StartVolatile 发送 start 命令 (volatile)
func StartVolatile() map[string]interface{} {
	return SendCmdVolatile("start")
}

// SendCmd 发送字符串命令
func SendCmd(s string) map[string]interface{} {
	client := http.Client{
		Timeout: 10 * time.Second,
	}
	url := fmt.Sprintf("http://%s/ECU_HTTP/sendStringCmd?c=%s", RemoteLocation, s)
	resp, err := client.Get(url)
	if err != nil {
		fmt.Printf("send_cmd %s Error Command Timeout or Connection Error: %v\n", s, err)
		return map[string]interface{}{"ok": false, "r": err.Error()}
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var j map[string]interface{}
	json.Unmarshal(body, &j)
	return j
}

// SendCmdVolatile 发送挥发性字符串命令
func SendCmdVolatile(s string) map[string]interface{} {
	client := http.Client{
		Timeout: 10 * time.Second,
	}
	url := fmt.Sprintf("http://%s/ECU_HTTP/sendStringCmd?cc=%s", RemoteLocation, s)
	resp, err := client.Get(url)
	if err != nil {
		fmt.Printf("send_cmd_volatile %s Error Command Timeout or Connection Error: %v\n", s, err)
		return map[string]interface{}{"ok": false, "r": err.Error()}
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var j map[string]interface{}
	json.Unmarshal(body, &j)
	return j
}

// GetAllAirplaneStatus 获取所有飞机状态
func GetAllAirplaneStatus() (map[string]interface{}, error) {
	client := http.Client{
		Timeout: 5 * time.Second,
	}
	url := fmt.Sprintf("http://%s/ECU_HTTP/requestPullAllAirplaneState", RemoteLocation)
	resp, err := client.Get(url)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ConnectionError Cannot Connect to PhantasyIsland: %v\n", err)
		return nil, fmt.Errorf("ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded")
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var j map[string]interface{}
	json.Unmarshal(body, &j)
	return j, nil
}

// GetAirplaneCameraImage 获取指定无人机的摄像头图像
func GetAirplaneCameraImage(port string, camera string) *string {
	client := http.Client{
		Timeout: 5 * time.Second,
	}
	url := fmt.Sprintf("http://%s/ECU_HTTP/requestPullImage?flyPort=%s&imageType=%s", RemoteLocation, port, camera)
	resp, err := client.Get(url)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ConnectionError Cannot Connect to PhantasyIsland: %v\n", err)
		return nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var j map[string]interface{}
	json.Unmarshal(body, &j)

	if ok, exists := j["ok"].(bool); exists && ok {
		if imgData, ok := j["imgDataString"].(string); ok {
			return &imgData
		}
	}
	return nil
}

// ProcessAirplane 处理飞机状态数据
func ProcessAirplane(j map[string]interface{}) map[string]map[string]interface{} {
	if ok, exists := j["ok"].(bool); exists && ok {
		airplanesRaw, exists := j["airplanes"].([]interface{})
		if !exists {
			return nil
		}

		airplaneStatus := make(map[string]map[string]interface{})
		for _, airRaw := range airplanesRaw {
			air := airRaw.(map[string]interface{})
			status := make(map[string]interface{})

			keyName := air["keyName"].(string)
			status["keyName"] = keyName
			status["typeName"] = air["typeName"]
			status["updateTimestamp"] = air["updateTimestamp"]
			status["status"] = air["status"]

			if cameraFront, ok := air["cameraFront"].(map[string]interface{}); ok {
				status["cameraFront"] = cameraFront["imgDataString"]
			}
			if cameraDown, ok := air["cameraDown"].(map[string]interface{}); ok {
				status["cameraDown"] = cameraDown["imgDataString"]
			}

			airplaneStatus[keyName] = status
		}
		return airplaneStatus
	}
	return nil
}
