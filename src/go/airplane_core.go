package PhantasyIslandGoRemoteControl

import (
	"sync"
	"time"
)

// AirplaneFlyStatus 每个飞机的飞行状态
type AirplaneFlyStatus struct {
	Landing bool    `json:"landing"`
	IsStop  bool    `json:"isStop"`
	X       float64 `json:"x"`
	Y       float64 `json:"y"`
	H       float64 `json:"h"`
	RX      float64 `json:"rX"`
	RY      float64 `json:"rY"`
	RZ      float64 `json:"rZ"`
}

// MakeAirplaneFlyStatus 从 map 创建 AirplaneFlyStatus
func MakeAirplaneFlyStatus(flyStatus map[string]interface{}) AirplaneFlyStatus {
	return AirplaneFlyStatus{
		Landing: flyStatus["landing"].(bool),
		IsStop:  flyStatus["isStop"].(bool),
		X:       flyStatus["x"].(float64),
		Y:       flyStatus["y"].(float64),
		H:       flyStatus["h"].(float64),
		RX:      flyStatus["rX"].(float64),
		RY:      flyStatus["rY"].(float64),
		RZ:      flyStatus["rZ"].(float64),
	}
}

// ImageInfo 模拟图像传输信息
type ImageInfo struct {
	Img           []byte
	ID            int
	TotalCount    int
	ProgressCount int
	OK            bool
}

// ImageReceiver 模拟图像接收器
type ImageReceiver struct {
	airplane             *AirplaneCore
	imageInstance        *ImageInfo
	cmdIDCounter         int
	nowLoadingID         int
	lock                 sync.RWMutex
	userReceiveCallback  func([]byte)
	userProgressCallback func(int, int)
	mookTime             int
}

func NewImageReceiver(airplane *AirplaneCore) *ImageReceiver {
	return &ImageReceiver{
		airplane: airplane,
		mookTime: 3,
	}
}

func (ir *ImageReceiver) SendCapImage(receiveCallback func([]byte), progressCallback func(int, int)) {
	ir.userReceiveCallback = receiveCallback
	ir.userProgressCallback = progressCallback

	go func() {
		ir.lock.Lock()
		ir.cmdIDCounter++
		ir.nowLoadingID = ir.cmdIDCounter
		id := ir.cmdIDCounter
		img := ir.airplane.GetCameraDownImg()
		total := ir.mookTime * 100
		ir.imageInstance = &ImageInfo{
			Img:        img,
			ID:         id,
			TotalCount: total,
		}
		ir.lock.Unlock()

		for {
			time.Sleep(10 * time.Millisecond)
			ir.lock.Lock()
			if ir.imageInstance.ID != ir.nowLoadingID {
				ir.lock.Unlock()
				break
			}
			ir.imageInstance.ProgressCount++
			progress := ir.imageInstance.ProgressCount
			totalCount := ir.imageInstance.TotalCount
			ir.lock.Unlock()

			if ir.userProgressCallback != nil {
				ir.userProgressCallback(progress, totalCount)
			}

			if progress >= totalCount {
				ir.lock.Lock()
				if ir.imageInstance.ID == ir.nowLoadingID {
					ir.imageInstance.OK = true
				}
				ir.lock.Unlock()
				if ir.userReceiveCallback != nil {
					ir.userReceiveCallback(img)
				}
				break
			}
		}
	}()
}

func (ir *ImageReceiver) GetLatestImage() []byte {
	ir.lock.RLock()
	defer ir.lock.RUnlock()
	if ir.imageInstance == nil || !ir.imageInstance.OK {
		return nil
	}
	return ir.imageInstance.Img
}

func (ir *ImageReceiver) GetTransferProgress() int {
	ir.lock.RLock()
	defer ir.lock.RUnlock()
	if ir.imageInstance == nil {
		return 0
	}
	return ir.imageInstance.ProgressCount
}

func (ir *ImageReceiver) IsTransferInProgress() bool {
	ir.lock.RLock()
	defer ir.lock.RUnlock()
	if ir.imageInstance == nil {
		return false
	}
	return !ir.imageInstance.OK
}

// AirplaneCore 每个飞机的基本信息
type AirplaneCore struct {
	KeyName         string
	TypeName        string
	UpdateTimestamp int64
	Status          AirplaneFlyStatus
	CameraFront     string
	CameraDown      string
	ImageReceiver   *ImageReceiver
}

func NewAirplaneCore(keyName string, typeName string, updateTimestamp int64, status AirplaneFlyStatus, cameraFront string, cameraDown string) *AirplaneCore {
	ac := &AirplaneCore{
		KeyName:         keyName,
		TypeName:        typeName,
		UpdateTimestamp: updateTimestamp,
		Status:          status,
		CameraFront:     cameraFront,
		CameraDown:      cameraDown,
	}
	ac.ImageReceiver = NewImageReceiver(ac)
	return ac
}

func (ac *AirplaneCore) CapImage(receiveCallback func([]byte), progressCallback func(int, int)) {
	ac.ImageReceiver.SendCapImage(receiveCallback, progressCallback)
}

func (ac *AirplaneCore) GetImageTransferProgress() int {
	return ac.ImageReceiver.GetTransferProgress()
}

func (ac *AirplaneCore) IsImageTransferInProgress() bool {
	return ac.ImageReceiver.IsTransferInProgress()
}

func (ac *AirplaneCore) GetLatestImage() []byte {
	return ac.ImageReceiver.GetLatestImage()
}

func (ac *AirplaneCore) GetCameraFrontImg() []byte {
	return ReadB64Img(GetAirplaneCameraImage(ac.KeyName, "front"))
}

func (ac *AirplaneCore) GetCameraDownImg() []byte {
	return ReadB64Img(GetAirplaneCameraImage(ac.KeyName, "down"))
}
