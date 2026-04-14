package radio

// XYZ — 三维坐标，单位米，格式 [3]float64{x, y, z}
type XYZ [3]float64

// RadioCheckOptions — 链路可达性检查选项
type RadioCheckOptions struct {
	FrequencyMHz                           *float64 `json:"frequencyMHz,omitempty"`
	TxPowerDbm                             *float64 `json:"txPowerDbm,omitempty"`
	RxSensitivityDbm                       *float64 `json:"rxSensitivityDbm,omitempty"`
	FresnelZoneRatio                       *float64 `json:"fresnelZoneRatio,omitempty"`
	SkipFresnelZoneCheck                   *bool    `json:"skipFresnelZoneCheck,omitempty"`
	EnableMultipath                        *bool    `json:"enableMultipath,omitempty"`
	MaxReflectionPaths                     *float64 `json:"maxReflectionPaths,omitempty"`
	MaxReflectionPathLengthRatio           *float64 `json:"maxReflectionPathLengthRatio,omitempty"`
	DefaultTxAntennaGain_dBi               *float64 `json:"defaultTxAntennaGain_dBi,omitempty"`
	DefaultRxAntennaGain_dBi               *float64 `json:"defaultRxAntennaGain_dBi,omitempty"`
	EnableAntennaPattern                   *bool    `json:"enableAntennaPattern,omitempty"`
	EnableMutualCoupling                   *bool    `json:"enableMutualCoupling,omitempty"`
	CouplingNegligibleThresholdWavelengths *float64 `json:"couplingNegligibleThresholdWavelengths,omitempty"`
	EnableSINR                             *bool    `json:"enableSINR,omitempty"`
	ReceiverBandwidthHz                    *float64 `json:"receiverBandwidthHz,omitempty"`
	MinSINR_dB                             *float64 `json:"minSINR_dB,omitempty"`
	EnableFrequencyIsolation               *bool    `json:"enableFrequencyIsolation,omitempty"`
	EnableNearFieldCorrection              *bool    `json:"enableNearFieldCorrection,omitempty"`
	EnableNodeBodyOcclusion                *bool    `json:"enableNodeBodyOcclusion,omitempty"`
}

// CheckReachabilityRequest — 链路可达性检查请求消息
type CheckReachabilityRequest struct {
	ATx     XYZ                `json:"aTx"`
	BRx     XYZ                `json:"bRx"`
	Options *RadioCheckOptions `json:"options,omitempty"`
}

// UpdateObjectPosRequest — 更新对象位置的消息
type UpdateObjectPosRequest struct {
	ObjectID string `json:"objectId"`
	Position XYZ    `json:"position"`
}

// UpdateMeshRadioMaterialRequest — 更新对象的电磁属性
type UpdateMeshRadioMaterialRequest struct {
	MeshID     string   `json:"meshId"`
	MaterialID *string  `json:"materialId,omitempty"`
	ThicknessM *float64 `json:"thickness_m,omitempty"`
}

// RadioMaterialProperties — 电磁材料属性定义
type RadioMaterialProperties struct {
	ID                         string  `json:"id"`
	DisplayName                string  `json:"displayName"`
	PenetrationLoss_dBPerMeter float64 `json:"penetrationLoss_dBPerMeter"`
	ReflectionCoefficient      float64 `json:"reflectionCoefficient"`
	DefaultThicknessM          float64 `json:"defaultThickness_m"`
}

// JoyStickInput — 摇杆输入消息
type JoyStickInput struct {
	Vx      float64 `json:"vx"`
	Vy      float64 `json:"vy"`
	Vz      float64 `json:"vz"`
	YawRate float64 `json:"yawRate"`
}
