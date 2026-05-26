/**
 * TypeScript 类型定义。
 */

// ---------------------------------------------------------------------------
// XYZ — 三维坐标，单位米，格式 [x, y, z]
// ---------------------------------------------------------------------------
export type XYZ = [number, number, number];

/** 链路可达性检查的可选参数。所有字段均为可选，服务端会使用各自的默认值。 */
export interface RadioCheckOptions {
    /** 信号频率（MHz），默认 2400（2.4GHz，无人机常用频段） */
    frequencyMHz?: number;
    /** 发射功率（dBm），默认 20 */
    txPowerDbm?: number;
    /** 接收灵敏度（dBm），默认 -90。接收功率低于此值视为不可达 */
    rxSensitivityDbm?: number;
    /** 菲涅尔区清晰度阈值（0~1），默认 0.6。第一菲涅尔区 60% 以上无遮挡时，信号衰减可忽略不计 */
    fresnelZoneRatio?: number;
    /** 是否跳过菲涅尔区体积检测（默认 false）。设为 True 时仅做中心射线 LOS 检测，显著提升性能 */
    skipFresnelZoneCheck?: boolean;
    /** 是否启用多径反射计算（默认 false）。计算开销约为当前查询的 2~4 倍 */
    enableMultipath?: boolean;
    /** 最大反射路径数（默认 8），仅保留最强的 N 条。用于控制多径计算开销 */
    maxReflectionPaths?: number;
    /** 反射路径最大长度与直射距离的比值（默认 2.0） */
    maxReflectionPathLengthRatio?: number;
    /** 发射端默认天线增益（dBi），默认 0（各向同性天线）。在非多节点网络扩展模式下应用于链路预算计算 */
    defaultTxAntennaGain_dBi?: number;
    /** 接收端默认天线增益（dBi），默认 0（各向同性天线）。在非多节点网络扩展模式下应用于链路预算计算 */
    defaultRxAntennaGain_dBi?: number;
    /** 是否启用天线方向图增益修正（默认 false）。启用后根据天线指向方向查询增益，替代默认的各向同性假设 */
    enableAntennaPattern?: boolean;
    /** 是否启用多天线互耦合修正（默认 false）。当天线间距小于阈值时，天线之间的感应电流会导致额外的发射功率损耗 */
    enableMutualCoupling?: boolean;
    /** 互耦合可忽略的天线间距阈值（单位：波长数），默认 10。当两天线间距 d / λ ≥ 此阈值时，互耦合损耗视为 0 */
    couplingNegligibleThresholdWavelengths?: number;
    /** 是否启用同频 SINR（信噪干扰比）计算（默认 false）。计算复杂度为 O(N²) */
    enableSINR?: boolean;
    /** 接收机噪声带宽（Hz），默认 20e6（20 MHz，802.11n 标准信道）。用于计算热噪声底 */
    receiverBandwidthHz?: number;
    /** SINR 最低阈值（dB），默认 10。SINR > minSINR_dB 时链路质量合格 */
    minSINR_dB?: number;
    /** 是否启用频段隔离计算（默认 false）。可大幅减少多频段部署时的干扰矩阵计算量 */
    enableFrequencyIsolation?: boolean;
    /** 是否启用近场修正（默认 false）。当两点距离 < 5λ 时启用，防止 FSPL 模型出现负值 */
    enableNearFieldCorrection?: boolean;
    /** 保留字段，暂未使用。用于检测节点物理体之间的相互遮挡 */
    enableNodeBodyOcclusion?: boolean;
}

/** 链路可达性检查请求消息。 */
export interface CheckReachabilityRequest {
    /** 发射端的三维坐标 */
    aTx: XYZ;
    /** 接收端的三维坐标 */
    bRx: XYZ;
    /** 可选的链路检查参数 */
    options?: RadioCheckOptions;
}

/** 更新对象位置的消息。 */
export interface UpdateObjectPosRequest {
    /** 对象的唯一标识 */
    objectId: string;
    /** 新的坐标 */
    position: XYZ;
}

/** 更新对象的电磁属性。 */
export interface UpdateMeshRadioMaterialRequest {
    /** 网格的唯一标识 */
    meshId: string;
    /** 材料类型 Id，如 "concrete", "wood", "metal" 等。见 getAllRadioMaterial 接口返回值 */
    materialId?: string;
    /** 单面物体情况下的物体默认厚度，单位米 */
    thickness_m?: number;
}

/** 电磁材料属性定义。 */
export interface RadioMaterialProperties {
    /** 材料的唯一标识，如 "concrete", "wood", "metal" 等 */
    id: string;
    /** 材料的显示名称 */
    displayName: string;
    /** 每米的穿透损耗，单位 dB/m */
    penetrationLoss_dBPerMeter: number;
    /** 反射系数，范围 0~1，表示入射信号被反射回去的比例 */
    reflectionCoefficient: number;
    /** 默认厚度，单位米。对于单面物体（如墙壁）来说，这个值用于估算穿透损耗；对于双面物体（如地面）来说，这个值可以忽略 */
    defaultThickness_m: number;
}

/** 摇杆输入消息。 */
export interface JoyStickInput {
    /** 前后速度输入，范围 -1~1，正值表示向前 */
    vx: number;
    /** 左右速度输入，范围 -1~1，正值表示向右 */
    vy: number;
    /** 上下速度输入，范围 -1~1，正值表示向上 */
    vz: number;
    /** 偏航角速度输入，范围 -1~1，正值表示顺时针旋转 */
    yawRate: number;
}
