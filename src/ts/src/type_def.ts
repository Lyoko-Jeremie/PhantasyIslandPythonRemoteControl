/**
 * 三维坐标，单位米，格式 [x, y, z]
 */
export type XYZ = [number, number, number];

/**
 * 链路可达性检查的可选参数。
 */
export interface RadioCheckOptions {
    /** 信号频率（MHz），默认 2400 */
    frequencyMHz?: number;
    /** 发射功率（dBm），默认 20 */
    txPowerDbm?: number;
    /** 接收灵敏度（dBm），默认 -90 */
    rxSensitivityDbm?: number;
    /** 菲涅尔区清晰度阈值（0~1），默认 0.6 */
    fresnelZoneRatio?: number;
    /** 是否跳过菲涅尔区体积检测（默认 false） */
    skipFresnelZoneCheck?: boolean;
    /** 是否启用多径反射计算（默认 false） */
    enableMultipath?: boolean;
    /** 最大反射路径数（默认 8） */
    maxReflectionPaths?: number;
    /** 反射路径最大长度与直射距离的比值（默认 2.0） */
    maxReflectionPathLengthRatio?: number;
    /** 发射端默认天线增益（dBi），默认 0 */
    defaultTxAntennaGain_dBi?: number;
    /** 接收端默认天线增益（dBi），默认 0 */
    defaultRxAntennaGain_dBi?: number;
    /** 是否启用天线方向图增益修正（默认 false） */
    enableAntennaPattern?: boolean;
    /** 是否启用多天线互耦合修正（默认 false） */
    enableMutualCoupling?: boolean;
    /** 互耦合可忽略的天线间距阈值（单位：波长数），默认 10 */
    couplingNegligibleThresholdWavelengths?: number;
    /** 是否启用同频 SINR（信噪干扰比）计算（默认 false） */
    enableSINR?: number;
    /** 接收机噪声带宽（Hz），默认 20e6 */
    receiverBandwidthHz?: number;
    /** SINR 最低阈值（dB），默认 10 */
    minSINR_dB?: number;
    /** 是否启用频段隔离计算（默认 false） */
    enableFrequencyIsolation?: boolean;
    /** 是否启用近场修正（默认 false） */
    enableNearFieldCorrection?: boolean;
    /** 保留字段，暂未使用 */
    enableNodeBodyOcclusion?: boolean;
}

/**
 * 链路可达性检查请求消息
 */
export interface CheckReachabilityRequest {
    aTx: XYZ;
    bRx: XYZ;
    options?: RadioCheckOptions;
}

/**
 * 更新对象位置的消息
 */
export interface UpdateObjectPosRequest {
    objectId: string;
    position: XYZ;
}

/**
 * 更新对象的电磁属性
 */
export interface UpdateMeshRadioMaterialRequest {
    meshId: string;
    materialId?: string;
    thickness_m?: number;
}

/**
 * 电磁材料属性定义
 */
export interface RadioMaterialProperties {
    id: string;
    displayName: string;
    penetrationLoss_dBPerMeter: number;
    reflectionCoefficient: number;
    defaultThickness_m: number;
}

/**
 * 摇杆输入消息
 */
export interface JoyStickInput {
    vx?: number;
    vy?: number;
    vz?: number;
    yawRate?: number;
}
