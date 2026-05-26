import Type from 'typebox';
import {Compile} from 'typebox/compile';
import {CheckReachabilityShowConfigExtend, RadioCheckOptions} from '../RadioTypes';
import type {ControlInput} from '../FlyContinueDef';
import {assert, Equals} from 'tsafe';
import {RadioReachabilityShowConfig} from '../RadioReachabilityShow';

export const XYZ = Type.Tuple([
    Type.Number(),
    Type.Number(),
    Type.Number(),
], {description: '三维坐标，单位米，格式 [x, y, z]', default: [0, 0, 0]});

export const Type_RadioCheckOptions = Type.Object({
    frequencyMHz: Type.Optional(Type.Number({description: '信号频率（MHz），默认 2400（2.4GHz，无人机常用频段）'})),
    txPowerDbm: Type.Optional(Type.Number({description: '发射功率（dBm），默认 20'})),
    rxSensitivityDbm: Type.Optional(Type.Number({description: '接收灵敏度（dBm），默认 -90。接收功率低于此值视为不可达'})),
    fresnelZoneRatio: Type.Optional(Type.Number({description: '菲涅尔区清晰度阈值（0~1），默认 0.6。第一菲涅尔区 60% 以上无遮挡时，信号衰减可忽略不计'})),
    skipFresnelZoneCheck: Type.Optional(Type.Boolean({description: '是否跳过菲涅尔区体积检测（默认 false）。设为 true 时仅做中心射线 LOS 检测，显著提升性能'})),
    enableMultipath: Type.Optional(Type.Boolean({description: '是否启用多径反射计算（默认 false）。计算开销约为当前查询的 2~4 倍'})),
    maxReflectionPaths: Type.Optional(Type.Number({description: '最大反射路径数（默认 8），仅保留最强的 N 条。用于控制多径计算开销'})),
    maxReflectionPathLengthRatio: Type.Optional(Type.Number({description: '反射路径最大长度与直射距离的比值（默认 2.0）'})),
    defaultTxAntennaGain_dBi: Type.Optional(Type.Number({description: '发射端默认天线增益（dBi），默认 0（各向同性天线）。在非多节点网络扩展模式下应用于链路预算计算'})),
    defaultRxAntennaGain_dBi: Type.Optional(Type.Number({description: '接收端默认天线增益（dBi），默认 0（各向同性天线）。在非多节点网络扩展模式下应用于链路预算计算'})),
    enableAntennaPattern: Type.Optional(Type.Boolean({description: '是否启用天线方向图增益修正（默认 false）。启用后根据天线指向方向查询增益，替代默认的各向同性假设'})),
    enableMutualCoupling: Type.Optional(Type.Boolean({description: '是否启用多天线互耦合修正（默认 false）。当天线间距小于阈值时，天线之间的感应电流会导致额外的发射功率损耗'})),
    couplingNegligibleThresholdWavelengths: Type.Optional(Type.Number({description: '互耦合可忽略的天线间距阈值（单位：波长数），默认 10。当两天线间距 d / λ ≥ 此阈值时，互耦合损耗视为 0'})),
    enableSINR: Type.Optional(Type.Boolean({description: '是否启用同频 SINR（信噪干扰比）计算（默认 false）。计算复杂度为 O(N²)'})),
    receiverBandwidthHz: Type.Optional(Type.Number({description: '接收机噪声带宽（Hz），默认 20e6（20 MHz，802.11n 标准信道）。用于计算热噪声底'})),
    minSINR_dB: Type.Optional(Type.Number({description: 'SINR 最低阈值（dB），默认 10。SINR > minSINR_dB 时链路质量合格'})),
    enableFrequencyIsolation: Type.Optional(Type.Boolean({description: '是否启用频段隔离计算（默认 false）。可大幅减少多频段部署时的干扰矩阵计算量'})),
    enableNearFieldCorrection: Type.Optional(Type.Boolean({description: '是否启用近场修正（默认 false）。当两点距离 < 5λ 时启用，防止 FSPL 模型出现负值'})),
    enableNodeBodyOcclusion: Type.Optional(Type.Boolean({description: '保留字段，暂未使用。用于检测节点物理体之间的相互遮挡'})),
} satisfies Record<keyof RadioCheckOptions, Type.TSchema>);

export const Type_RadioReachabilityShowConfig = Type.Object({
    fresnelZoneColor1: Type.Optional(Type.String({description: '第一菲涅尔区颜色，CSS 颜色字符串，默认 "rgba(0, 255, 0, 0.5)"（半透明绿色）'})),
    fresnelZoneColor2: Type.Optional(Type.String({description: '第二菲涅尔区颜色，CSS 颜色字符串，默认 "rgba(255, 255, 0, 0.5)"（半透明黄色）'})),
} satisfies Record<keyof RadioReachabilityShowConfig, Type.TSchema>);

export const Type_CheckReachabilityShowConfigExtend = Type.Object({
    color2LowRxPowerDbm: Type.Optional(Type.Number({description: '接收功率较低时的颜色，CSS 颜色字符串，默认 "rgba(255, 0, 0, 0.5)"（半透明红色）'})),
} satisfies Record<keyof CheckReachabilityShowConfigExtend, Type.TSchema>);

export const Type_checkReachability = Type.Object({
    // cmd: Type.Literal('checkReachability', {default: 'checkReachability'}),
    aTx: XYZ,
    bRx: XYZ,
    options: Type.Optional(Type_RadioCheckOptions),
    configRadioReachabilityShow: Type.Optional(Type.Intersect([
        Type_RadioReachabilityShowConfig,
        Type_CheckReachabilityShowConfigExtend,
    ], { description: '链路可达性检查的显示配置，可选' })),
}, {
    description: '链路可达性检查请求消息. aTx 和 bRx 分别是发射端和接收端的坐标，options 是可选的检查选项',
});

export const Type_checkReachability_Compiled = Compile(Type_checkReachability);

export const Type_updateObjectPos = Type.Object({
    // cmd: Type.Literal('updateObjectPos', {default: 'updateObjectPos'}),
    objectId: Type.String({description: '对象的唯一标识', default: 'object_001'}),
    position: XYZ,
}, {
    description: '更新对象位置的消息. objectId 是对象的唯一标识，position 是新的坐标',
});

export const Type_updateObjectPos_Compiled = Compile(Type_updateObjectPos);

export const Type_updateMeshRadioMaterial = Type.Object({
    // cmd: Type.Literal('updateMeshRadioMaterial', {default: 'updateMeshRadioMaterial'}),
    meshId: Type.String({description: '网格的唯一标识', default: 'mesh_001'}),
    materialId: Type.Optional(Type.String({description: '材料类型Id，如 "concrete", "wood", "metal" 等。见 getAllRadioMaterial 接口返回值'})),
    thickness_m: Type.Optional(Type.Number({description: '单面物体情况下的物体默认厚度，单位米。单面物体情况下的物体默认厚度'})),
}, {
    description: '更新对象的电磁属性',
});

export const Type_updateMeshRadioMaterial_Compiled = Compile(Type_updateMeshRadioMaterial);

export const Type_RadioMaterialProperties = Type.Object({
    // cmd: Type.Literal('addRadioMaterial', {default: 'addRadioMaterial'}),
    id: Type.String({description: '材料的唯一标识，如 "concrete", "wood", "metal" 等', default: 'concrete'}),
    displayName: Type.String({description: '材料的显示名称', default: '混凝土'}),
    penetrationLoss_dBPerMeter: Type.Number({description: '每米的穿透损耗，单位 dB/m', default: 40}),
    reflectionCoefficient: Type.Number({description: '反射系数，范围 0~1，表示入射信号被反射回去的比例', default: 0.5}),
    defaultThickness_m: Type.Number({
        description: '默认厚度，单位米。对于单面物体（如墙壁）来说，这个值用于估算穿透损耗；对于双面物体（如地面）来说，这个值可以忽略',
        default: 0.3,
    }),
}, {
    description: '电磁材料属性定义',
});

export const Type_RadioMaterialProperties_Compiled = Compile(Type_RadioMaterialProperties);

export interface JoyStickInput {
    // cmd: 'setJoyStickInput';
    vx: number; // 前后速度输入，范围 -1~1，正值表示向前
    vy: number; // 左右速度输入，范围 -1~1，正值表示向右
    vz: number; // 上下速度输入，范围 -1~1，正值表示向上
    yawRate: number; // 偏航角速度输入，范围 -1~1，正值表示顺时针旋转
}

// JoyStickInput 应该 适配于 ControlInput
assert<Equals<ControlInput, Omit<JoyStickInput, 'cmd'>>>();

export const Type_JoyStickInput = Type.Object({
    // cmd: Type.Literal('setJoyStickInput', {default: 'setJoyStickInput'}),
    vx: Type.Number({description: '前后速度输入，范围 -1~1，正值表示向前', default: 0}),
    vy: Type.Number({description: '左右速度输入，范围 -1~1，正值表示向右', default: 0}),
    vz: Type.Number({description: '上下速度输入，范围 -1~1，正值表示向上', default: 0}),
    yawRate: Type.Number({description: '偏航角速度输入，范围 -1~1，正值表示顺时针旋转', default: 0}),
} satisfies Record<keyof JoyStickInput, Type.TSchema>, {
    description: '摇杆输入消息. vx, vy, vz 分别是前后、左右、上下的速度输入，yawRate 是偏航角速度输入',
});

export const Type_JoyStickInput_Compiled = Compile(Type_JoyStickInput);
