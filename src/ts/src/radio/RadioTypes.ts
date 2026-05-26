/**
 * 障碍物类型枚举。
 *
 * 设计上将障碍物分为两类，因为它们对信号的影响机制不同：
 * - LOS_BLOCKING: 直接遮挡视线（中心射线命中），造成刀锋衍射损耗
 * - FRESNEL_ZONE_INTRUSION: 未遮挡视线但侵入菲涅尔区，造成信号衰减
 */
export enum ObstacleType {
    /** 遮挡视线（Line of Sight）——中心射线命中该障碍物 */
    LOS_BLOCKING = 'los_blocking',
    /** 侵入菲涅尔区但未遮挡视线 */
    FRESNEL_ZONE_INTRUSION = 'fresnel_zone_intrusion',
}

/** 单个障碍物的详细信息 */
export interface ObstacleInfo {
    /** 所属 Mesh 的 ID */
    meshId: string;
    /** Mesh 名称（可选，仅用于调试） */
    meshName?: string;
    /** 所属 Object3D 的名称（可选，仅用于调试） */
    objName?: string;
    /** 障碍物类型 */
    type: ObstacleType;
    /**
     * 关键点坐标（世界空间）。
     * - LOS_BLOCKING: 射线与三角面的交点
     * - FRESNEL_ZONE_INTRUSION: 三角面到 LOS 线段的最近点
     */
    point: [number, number, number];
    /** 该点沿 A→B 方向到发射端 A 的投影距离（米） */
    distanceFromTx: number;
    /** 该投影位置处第一菲涅尔区半径（米） */
    fresnelRadius: number;
    /**
     * 到 LOS 线段的垂直距离（米）。
     * LOS_BLOCKING 时为 0，FRESNEL_ZONE_INTRUSION 时为正值。
     */
    distanceToLos: number;
    /**
     * 菲涅尔区侵入深度比。
     * = 1 - distanceToLos / fresnelRadius
     * - 1.0: 在 LOS 线上（最大侵入）
     * - 0.0: 刚好在菲涅尔区边缘
     * - 负值: 在菲涅尔区外（不应出现在结果中）
     */
    fresnelClearanceRatio: number;
    /**
     * Fresnel-Kirchhoff 衍射参数 ν。
     * 正值表示遮挡 LOS，负值表示在 LOS 下方（菲涅尔区侵入）。
     * 公式: ν = h · √(2d / (λ · d₁ · d₂))
     */
    fresnelParameter: number;
    /** 该单个障碍物造成的衍射损耗（dB） */
    diffractionLoss_dB: number;
}

/** 查询选项 */
export interface RadioCheckOptions {
    /** 信号频率（MHz），默认 2400（2.4GHz，无人机常用频段） */
    frequencyMHz?: number;
    /** 发射功率（dBm），默认 20 */
    txPowerDbm?: number;
    /** 接收灵敏度（dBm），默认 -90。接收功率低于此值视为不可达 */
    rxSensitivityDbm?: number;
    /**
     * 菲涅尔区清晰度阈值（0~1），默认 0.6。
     * 工程经验：第一菲涅尔区 60% 以上无遮挡时，信号衰减可忽略不计。
     * 当障碍物的 fresnelClearanceRatio > (1 - fresnelZoneRatio) 时才计入损耗。
     */
    fresnelZoneRatio?: number;
    /**
     * 是否跳过菲涅尔区体积检测（默认 false）。
     * 设为 true 时仅做中心射线 LOS 检测 + 衍射计算，显著提升性能。
     * 适用于障碍物众多或地形多边形密集时的性能优化场景。
     */
    skipFresnelZoneCheck?: boolean;
    /**
     * 是否启用多径反射计算（默认 false）。
     * 启用后会搜索场景中的候选反射面，计算单反射路径的信号贡献，
     * 与直射路径做非相干功率叠加，可能产生正的多径增益。
     * 计算开销约为当前查询的 2~4 倍。
     */
    enableMultipath?: boolean;
    /** 最大反射路径数（默认 8），仅保留最强的 N 条。用于控制多径计算开销。 */
    maxReflectionPaths?: number;
    /**
     * 反射路径最大长度与直射距离的比值（默认 2.0）。
     * 反射路径总长度超过此比值乘以直射距离的将被忽略。
     */
    maxReflectionPathLengthRatio?: number;

    /**
     * 发射端默认天线增益（dBi），默认 0（各向同性天线）。
     *
     * 在非多节点网络扩展模式（即 enableAntennaPattern = false）下，
     * 作为简易天线增益应用于链路预算计算：
     *   rxPower = txPower + txAntennaGain + rxAntennaGain - pathLoss
     *
     * 常见参考值：
     * - 0 dBi: 理想各向同性天线（默认）
     * - 2.15 dBi: 标准半波偶极子天线
     * - 5 dBi: 典型全向鞭状天线
     * - 8~12 dBi: 定向平板天线
     *
     * 当 enableAntennaPattern = true 时，此字段被忽略，
     * 天线增益由 AntennaPlacement 的方向图查询决定。
     */
    defaultTxAntennaGain_dBi?: number;

    /**
     * 接收端默认天线增益（dBi），默认 0（各向同性天线）。
     *
     * 在非多节点网络扩展模式（即 enableAntennaPattern = false）下，
     * 作为简易天线增益应用于链路预算计算：
     *   rxPower = txPower + txAntennaGain + rxAntennaGain - pathLoss
     *
     * 常见参考值：
     * - 0 dBi: 理想各向同性天线（默认）
     * - 2.15 dBi: 标准半波偶极子天线
     * - 5 dBi: 典型全向鞭状天线
     * - 8~12 dBi: 定向平板天线
     *
     * 当 enableAntennaPattern = true 时，此字段被忽略，
     * 天线增益由 AntennaPlacement 的方向图查询决定。
     */
    defaultRxAntennaGain_dBi?: number;

    // ══════════════════════════════════════════════════════════════════════
    // 以下为多节点网络扩展选项，默认全部关闭，
    // 不影响现有单点对单点查询逻辑。
    // ══════════════════════════════════════════════════════════════════════

    /**
     * 是否启用天线方向图增益修正（默认 false）。
     * 启用后，RadioLinkBudget.computeExtendedBudget() 会根据天线指向方向查询增益，
     * 替代默认的各向同性（isotropic）假设。
     * 需在 RadioNetworkAnalyzer 或 RadioLinkBudget 调用时传入 AntennaPlacement 参数。
     */
    enableAntennaPattern?: boolean;

    /**
     * 是否启用多天线互耦合修正（默认 false）。
     * 当某节点有多根天线且天线间距小于 couplingNegligibleThresholdWavelengths 个波长时，
     * 天线之间的感应电流会导致额外的发射功率损耗。
     * 在 RadioNetworkAnalyzer 中对所有作为发射端的多天线节点生效。
     */
    enableMutualCoupling?: boolean;

    /**
     * 互耦合可忽略的天线间距阈值（单位：波长数），默认 10。
     * 当两天线间距 d / λ ≥ 此阈值时，互耦合损耗视为 0，按分布式独立天线处理。
     * 经验值：d = 10λ 时耦合损耗约 -46 dB，可忽略。
     */
    couplingNegligibleThresholdWavelengths?: number;

    /**
     * 是否启用同频 SINR（信噪干扰比）计算（默认 false）。
     * 启用后，RadioNetworkAnalyzer 会计算每条链路的 SINR，
     * 并将结果写入 RadioLinkResult.sinr_dB。
     * 计算复杂度为 O(N²)，N=128 时约 2ms（纯 JS），N>512 时建议开启频段隔离分组。
     */
    enableSINR?: boolean;

    /**
     * 接收机噪声带宽（Hz），默认 20e6（20 MHz，802.11n 标准信道）。
     * 用于计算热噪声底：N_thermal = kTB（玻尔兹曼常数 × 标准温度 290K × 带宽）。
     */
    receiverBandwidthHz?: number;

    /**
     * SINR 最低阈值（dB），默认 10。
     * SINR > minSINR_dB → 链路质量合格。
     * 参考：BPSK≈5dB，QPSK≈8dB，16-QAM≈14dB，64-QAM≈20dB。
     */
    minSINR_dB?: number;

    /**
     * 是否启用频段隔离计算（默认 false）。
     * 启用后，SINR 矩阵中频率不重叠的链路对的干扰因子设为 0，
     * 可大幅减少多频段部署时的干扰矩阵计算量。
     * 需在 RadioNode.frequencyBand 或 RadioLink.frequencyBand 中设置频段信息。
     */
    enableFrequencyIsolation?: boolean;

    /**
     * 是否启用近场修正（默认 false）。
     * 当两点距离 < 5λ 时，自由空间路径损耗（FSPL）模型不再适用
     *（FSPL 可能出现负值，物理上无意义）。
     * 启用后，将 FSPL 的下限截断到距离 = 5λ 处的值，并在结果中设置 nearFieldWarning=true。
     * 2.4GHz 对应近场边界约 0.625m，5.8GHz 约 0.258m，433MHz 约 3.46m。
     */
    enableNearFieldCorrection?: boolean;

    /**
     * 保留字段，暂未使用。
     * 若需检测节点物理体之间的相互遮挡，可将节点体网格通过
     * RadioManager.addMesh() / addObject3D() 作为普通障碍物加入 BVH 场景，
     * 射线检测器会自动将其纳入 LOS / 菲涅尔区遮挡计算。
     */
    enableNodeBodyOcclusion?: boolean;
}

/**
 * 单条多径反射路径的详细信息
 */
export interface MultipathPathReflectionInfo {
    /**
     * 反射面所属网格的 ID
     */
    meshId: string;
    /**
     * 反射点世界坐标 [x, y, z]
     */
    reflectionPoint: [number, number, number];
    /**
     * TX→R + R→RX 总路径长（米）
     */
    totalPathLength: number;
    /**
     * 反射系数（0~1）
     */
    reflectionCoefficient: number;
    /**
     * 该反射路径的接收功率（mW，线性单位）
     */
    powerMw: number;
    /**
     * 该反射路径的接收功率（dBm，常用单位）
     */
    powerDbm: number;
}

/** 完整的无线电可达性检查结果 */
export interface RadioCheckResult {
    /** 信号是否可达（estimatedRxPower_dBm >= rxSensitivityDbm） */
    reachable: boolean;
    /** 中心射线是否完全无遮挡（true = 直接视线通畅） */
    lineOfSight: boolean;
    /** 菲涅尔区是否清晰（true = 无 LOS 遮挡且无菲涅尔区侵入） */
    fresnelZoneClear: boolean;
    /** A-B 两点间直线距离（米） */
    distance: number;
    /** 自由空间路径损耗（dB） */
    freeSpacePathLoss_dB: number;
    /** 衍射损耗（dB），由 LOS 遮挡障碍物引起 */
    diffractionLoss_dB: number;
    /** 菲涅尔区侵入损耗（dB），由未遮挡 LOS 但侵入菲涅尔区的障碍物引起 */
    fresnelIntrusionLoss_dB: number;
    /**
     * 总路径损耗（dB）。
     * = freeSpacePathLoss + diffractionLoss + fresnelIntrusionLoss
     *   + materialLoss - multipathGain - txAntennaGain - rxAntennaGain
     */
    totalPathLoss_dB: number;
    /** 估算的接收功率（dBm）= txPowerDbm - totalPathLoss_dB */
    estimatedRxPower_dBm: number;
    /** 所有检测到的障碍物列表 */
    obstacles: ObstacleInfo[];
    /** 材质穿透衰减（dB），由 LOS 遮挡障碍物的材质属性决定。无材质关联的 Mesh 贡献 0。 */
    materialLoss_dB: number;
    /** 多径反射增益（dB），>=0。需启用 enableMultipath 选项。0 表示无有效反射路径。 */
    multipathGain_dB: number;
    /**
     * 发射端天线增益（dB）。
     * 在非多节点网络扩展模式下 = defaultTxAntennaGain_dBi。
     * 默认为 0（各向同性天线）。
     */
    txAntennaGain_dB: number;
    /**
     * 接收端天线增益（dB）。
     * 在非多节点网络扩展模式下 = defaultRxAntennaGain_dBi。
     * 默认为 0（各向同性天线）。
     */
    rxAntennaGain_dB: number;
    /**
     * 多径反射路径列表，包含每条有效反射路径的详细信息。
     * 仅在 enableMultipath = true 时返回，且数量不超过 maxReflectionPaths。
     * 反射路径的贡献通过非相干功率叠加方式与直射路径合成总接收功率。
     */
    reflectionPaths?: MultipathPathReflectionInfo[];
}

export interface CheckReachabilityShowConfigExtend {
    color2LowRxPowerDbm?: number;
}
