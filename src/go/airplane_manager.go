package PhantasyIslandGoRemoteControl

import (
	"time"
)

// AirplaneManager 管理并更新所有飞机状态的管理器
type AirplaneManager struct {
	AirplanesTable map[string]*AirplaneController
}

func NewAirplaneManager() *AirplaneManager {
	return &AirplaneManager{
		AirplanesTable: make(map[string]*AirplaneController),
	}
}

func (am *AirplaneManager) Ping() interface{} {
	return Ping()
}

func (am *AirplaneManager) PingVolatile() interface{} {
	return PingVolatile()
}

func (am *AirplaneManager) Start() interface{} {
	return Start()
}

func (am *AirplaneManager) StartVolatile() interface{} {
	return StartVolatile()
}

func (am *AirplaneManager) GetAirplane(id string) *AirplaneController {
	return am.AirplanesTable[id]
}

func (am *AirplaneManager) Sleep(duration time.Duration) {
	time.Sleep(duration)
}

func (am *AirplaneManager) Flush() error {
	statusRaw, err := GetAllAirplaneStatus()
	if err != nil {
		return err
	}

	airplaneStatus := ProcessAirplane(statusRaw)
	if airplaneStatus != nil {
		for k, status := range airplaneStatus {
			flyStatus := MakeAirplaneFlyStatus(status["status"].(map[string]interface{}))
			updateTimestamp := int64(status["updateTimestamp"].(float64))

			if am.AirplanesTable[k] == nil {
				core := NewAirplaneCore(
					status["keyName"].(string),
					status["typeName"].(string),
					updateTimestamp,
					flyStatus,
					status["cameraFront"].(string),
					status["cameraDown"].(string),
				)
				am.AirplanesTable[k] = NewAirplaneController(core)
			} else {
				a := am.AirplanesTable[k]
				a.KeyName = status["keyName"].(string)
				a.TypeName = status["typeName"].(string)
				a.UpdateTimestamp = updateTimestamp
				a.Status = flyStatus
				a.CameraFront = status["cameraFront"].(string)
				a.CameraDown = status["cameraDown"].(string)
			}
		}
	}
	return nil
}

var airplaneManagerSingleton = NewAirplaneManager()

// GetAirplaneManager 获取 AirplaneManager 单例对象
func GetAirplaneManager() *AirplaneManager {
	return airplaneManagerSingleton
}
