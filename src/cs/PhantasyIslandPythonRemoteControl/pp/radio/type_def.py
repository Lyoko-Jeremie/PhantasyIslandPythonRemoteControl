"""
Python 等价类型定义，对应 TypeScript TypeBox 定义的类型。

原始 TypeScript TypeBox 定义见本文件底部的注释块。
"""

from __future__ import annotations

import dataclasses
from typing import Optional, Tuple


# ---------------------------------------------------------------------------
# XYZ — 三维坐标，单位米，格式 (x, y, z)
# ---------------------------------------------------------------------------
XYZ = Tuple[float, float, float]
"""三维坐标，单位米，格式 ``(x, y, z)``，默认 ``(0, 0, 0)``。"""


# ---------------------------------------------------------------------------
# RadioCheckOptions — 链路可达性检查选项
# ---------------------------------------------------------------------------
@dataclasses.dataclass
class RadioCheckOptions:
    """链路可达性检查的可选参数。所有字段均为可选，服务端会使用各自的默认值。"""

    frequencyMHz: Optional[float] = None
    """信号频率（MHz），默认 2400（2.4GHz，无人机常用频段）"""

    txPowerDbm: Optional[float] = None
    """发射功率（dBm），默认 20"""

    rxSensitivityDbm: Optional[float] = None
    """接收灵敏度（dBm），默认 -90。接收功率低于此值视为不可达"""

    fresnelZoneRatio: Optional[float] = None
    """菲涅尔区清晰度阈值（0~1），默认 0.6。第一菲涅尔区 60% 以上无遮挡时，信号衰减可忽略不计"""

    skipFresnelZoneCheck: Optional[bool] = None
    """是否跳过菲涅尔区体积检测（默认 false）。设为 True 时仅做中心射线 LOS 检测，显著提升性能"""

    enableMultipath: Optional[bool] = None
    """是否启用多径反射计算（默认 false）。计算开销约为当前查询的 2~4 倍"""

    maxReflectionPaths: Optional[float] = None
    """最大反射路径数（默认 8），仅保留最强的 N 条。用于控制多径计算开销"""

    maxReflectionPathLengthRatio: Optional[float] = None
    """反射路径最大长度与直射距离的比值（默认 2.0）"""

    defaultTxAntennaGain_dBi: Optional[float] = None
    """发射端默认天线增益（dBi），默认 0（各向同性天线）。在非多节点网络扩展模式下应用于链路预算计算"""

    defaultRxAntennaGain_dBi: Optional[float] = None
    """接收端默认天线增益（dBi），默认 0（各向同性天线）。在非多节点网络扩展模式下应用于链路预算计算"""

    enableAntennaPattern: Optional[bool] = None
    """是否启用天线方向图增益修正（默认 false）。启用后根据天线指向方向查询增益，替代默认的各向同性假设"""

    enableMutualCoupling: Optional[bool] = None
    """是否启用多天线互耦合修正（默认 false）。当天线间距小于阈值时，天线之间的感应电流会导致额外的发射功率损耗"""

    couplingNegligibleThresholdWavelengths: Optional[float] = None
    """互耦合可忽略的天线间距阈值（单位：波长数），默认 10。当两天线间距 d / λ ≥ 此阈值时，互耦合损耗视为 0"""

    enableSINR: Optional[bool] = None
    """是否启用同频 SINR（信噪干扰比）计算（默认 false）。计算复杂度为 O(N²)"""

    receiverBandwidthHz: Optional[float] = None
    """接收机噪声带宽（Hz），默认 20e6（20 MHz，802.11n 标准信道）。用于计算热噪声底"""

    minSINR_dB: Optional[float] = None
    """SINR 最低阈值（dB），默认 10。SINR > minSINR_dB 时链路质量合格"""

    enableFrequencyIsolation: Optional[bool] = None
    """是否启用频段隔离计算（默认 false）。可大幅减少多频段部署时的干扰矩阵计算量"""

    enableNearFieldCorrection: Optional[bool] = None
    """是否启用近场修正（默认 false）。当两点距离 < 5λ 时启用，防止 FSPL 模型出现负值"""

    enableNodeBodyOcclusion: Optional[bool] = None
    """保留字段，暂未使用。用于检测节点物理体之间的相互遮挡"""

    def to_dict(self) -> dict:
        """转换为 dict，自动过滤值为 ``None`` 的字段（与 TypeBox 的 Optional 语义一致）。"""
        return {k: v for k, v in dataclasses.asdict(self).items() if v is not None}


# ---------------------------------------------------------------------------
# CheckReachabilityRequest — 链路可达性检查请求消息
# ---------------------------------------------------------------------------
@dataclasses.dataclass
class CheckReachabilityRequest:
    """
    链路可达性检查请求消息。

    :param aTx: 发射端坐标 ``(x, y, z)``
    :param bRx: 接收端坐标 ``(x, y, z)``
    :param options: 可选的检查选项
    """

    aTx: XYZ
    """发射端的三维坐标"""

    bRx: XYZ
    """接收端的三维坐标"""

    options: Optional[RadioCheckOptions] = None
    """可选的链路检查参数"""

    def to_dict(self) -> dict:
        """转换为可直接通过 socketio 发送的 dict。"""
        d: dict = {
            'aTx': list(self.aTx),
            'bRx': list(self.bRx),
        }
        if self.options is not None:
            d['options'] = self.options.to_dict()
        return d


# ---------------------------------------------------------------------------
# 辅助：从 dict 构造（反序列化）
# ---------------------------------------------------------------------------

def xyz_from_list(data) -> XYZ:
    """将 ``[x, y, z]`` 列表转为 XYZ 元组。"""
    return (float(data[0]), float(data[1]), float(data[2]))


def radio_check_options_from_dict(data: dict) -> RadioCheckOptions:
    """从 dict 构造 RadioCheckOptions，忽略未知字段。"""
    known_fields = {f.name for f in dataclasses.fields(RadioCheckOptions)}
    return RadioCheckOptions(**{k: v for k, v in data.items() if k in known_fields})


def check_reachability_request_from_dict(data: dict) -> CheckReachabilityRequest:
    """从 dict 构造 CheckReachabilityRequest。"""
    opts = None
    if 'options' in data and data['options'] is not None:
        opts = radio_check_options_from_dict(data['options'])
    return CheckReachabilityRequest(
        aTx=xyz_from_list(data['aTx']),
        bRx=xyz_from_list(data['bRx']),
        options=opts,
    )


# ---------------------------------------------------------------------------
# UpdateObjectPosRequest — 更新对象位置的消息
# ---------------------------------------------------------------------------
@dataclasses.dataclass
class UpdateObjectPosRequest:
    """
    更新对象位置的消息。

    :param objectId: 对象的唯一标识
    :param position: 新的三维坐标 ``(x, y, z)``
    """

    objectId: str
    """对象的唯一标识"""

    position: XYZ
    """新的坐标"""

    def to_dict(self) -> dict:
        """转换为可直接通过 socketio 发送的 dict。"""
        return {
            'objectId': self.objectId,
            'position': list(self.position),
        }


def update_object_pos_request_from_dict(data: dict) -> UpdateObjectPosRequest:
    """从 dict 构造 UpdateObjectPosRequest。"""
    return UpdateObjectPosRequest(
        objectId=str(data['objectId']),
        position=xyz_from_list(data['position']),
    )


# ---------------------------------------------------------------------------
# UpdateMeshRadioMaterialRequest — 更新对象的电磁属性
# ---------------------------------------------------------------------------
@dataclasses.dataclass
class UpdateMeshRadioMaterialRequest:
    """
    更新对象的电磁属性。

    :param meshId: 网格的唯一标识
    :param materialId: 材料类型 Id，如 ``"concrete"``, ``"wood"``, ``"metal"`` 等。见 ``getAllRadioMaterial`` 接口返回值
    :param thickness_m: 单面物体情况下的物体默认厚度，单位米
    """

    meshId: str
    """网格的唯一标识"""

    materialId: Optional[str] = None
    """材料类型 Id，如 ``"concrete"``, ``"wood"``, ``"metal"`` 等。见 ``getAllRadioMaterial`` 接口返回值"""

    thickness_m: Optional[float] = None
    """单面物体情况下的物体默认厚度，单位米"""

    def to_dict(self) -> dict:
        """转换为 dict，自动过滤值为 ``None`` 的可选字段。"""
        d: dict = {'meshId': self.meshId}
        if self.materialId is not None:
            d['materialId'] = self.materialId
        if self.thickness_m is not None:
            d['thickness_m'] = self.thickness_m
        return d


def update_mesh_radio_material_request_from_dict(data: dict) -> UpdateMeshRadioMaterialRequest:
    """从 dict 构造 UpdateMeshRadioMaterialRequest。"""
    return UpdateMeshRadioMaterialRequest(
        meshId=str(data['meshId']),
        materialId=data.get('materialId'),
        thickness_m=float(data['thickness_m']) if 'thickness_m' in data and data['thickness_m'] is not None else None,
    )


# ---------------------------------------------------------------------------
# RadioMaterialProperties — 电磁材料属性定义
# ---------------------------------------------------------------------------
@dataclasses.dataclass
class RadioMaterialProperties:
    """
    电磁材料属性定义。

    :param id: 材料的唯一标识，如 ``"concrete"``, ``"wood"``, ``"metal"`` 等
    :param displayName: 材料的显示名称
    :param penetrationLoss_dBPerMeter: 每米的穿透损耗，单位 dB/m
    :param reflectionCoefficient: 反射系数，范围 0~1，表示入射信号被反射回去的比例
    :param defaultThickness_m: 默认厚度，单位米
    """

    id: str
    """材料的唯一标识，如 ``"concrete"``, ``"wood"``, ``"metal"`` 等"""

    displayName: str
    """材料的显示名称"""

    penetrationLoss_dBPerMeter: float
    """每米的穿透损耗，单位 dB/m"""

    reflectionCoefficient: float
    """反射系数，范围 0~1，表示入射信号被反射回去的比例"""

    defaultThickness_m: float
    """默认厚度，单位米。对于单面物体（如墙壁）来说，这个值用于估算穿透损耗；对于双面物体（如地面）来说，这个值可以忽略"""

    def to_dict(self) -> dict:
        """转换为 dict。"""
        return dataclasses.asdict(self)


def radio_material_properties_from_dict(data: dict) -> RadioMaterialProperties:
    """从 dict 构造 RadioMaterialProperties。"""
    return RadioMaterialProperties(
        id=str(data['id']),
        displayName=str(data['displayName']),
        penetrationLoss_dBPerMeter=float(data['penetrationLoss_dBPerMeter']),
        reflectionCoefficient=float(data['reflectionCoefficient']),
        defaultThickness_m=float(data['defaultThickness_m']),
    )


# ---------------------------------------------------------------------------
# JoyStickInput — 摇杆输入消息
# ---------------------------------------------------------------------------
@dataclasses.dataclass
class JoyStickInput:
    """
    摇杆输入消息。

    :param vx: 前后速度输入，范围 -1~1，正值表示向前
    :param vy: 左右速度输入，范围 -1~1，正值表示向右
    :param vz: 上下速度输入，范围 -1~1，正值表示向上
    :param yawRate: 偏航角速度输入，范围 -1~1，正值表示顺时针旋转
    """

    vx: float = 0.0
    """前后速度输入，范围 -1~1，正值表示向前"""

    vy: float = 0.0
    """左右速度输入，范围 -1~1，正值表示向右"""

    vz: float = 0.0
    """上下速度输入，范围 -1~1，正值表示向上"""

    yawRate: float = 0.0
    """偏航角速度输入，范围 -1~1，正值表示顺时针旋转"""

    def to_dict(self) -> dict:
        """转换为 dict。"""
        return dataclasses.asdict(self)


def joystick_input_from_dict(data: dict) -> JoyStickInput:
    """从 dict 构造 JoyStickInput。"""
    return JoyStickInput(
        vx=float(data.get('vx', 0)),
        vy=float(data.get('vy', 0)),
        vz=float(data.get('vz', 0)),
        yawRate=float(data.get('yawRate', 0)),
    )


# ========================= 原始 TypeScript TypeBox 定义 =========================
#
# export const XYZ = Type.Tuple([
#     Type.Number(),
#     Type.Number(),
#     Type.Number(),
# ], {description: '三维坐标，单位米，格式 [x, y, z]', default: [0, 0, 0]});
#
# export const Type_RadioCheckOptions = Type.Object({
#     frequencyMHz: Type.Optional(Type.Number({description: '信号频率（MHz），默认 2400'})),
#     txPowerDbm: Type.Optional(Type.Number({description: '发射功率（dBm），默认 20'})),
#     ...
# } satisfies Record<keyof RadioCheckOptions, Type.TSchema>);
#
# export const Type_checkReachability = Type.Object({
#     aTx: XYZ,
#     bRx: XYZ,
#     options: Type.Optional(Type_RadioCheckOptions),
# }, {
#     description: '链路可达性检查请求消息',
# });
#
# export const Type_updateObjectPos = Type.Object({
#     objectId: Type.String({description: '对象的唯一标识', default: 'object_001'}),
#     position: XYZ,
# }, {
#     description: '更新对象位置的消息',
# });
#
# export const Type_updateMeshRadioMaterial = Type.Object({
#     meshId: Type.String({description: '网格的唯一标识', default: 'mesh_001'}),
#     materialId: Type.Optional(Type.String({description: '材料类型Id'})),
#     thickness_m: Type.Optional(Type.Number({description: '单面物体情况下的物体默认厚度，单位米'})),
# }, {
#     description: '更新对象的电磁属性',
# });
#
# export const Type_RadioMaterialProperties = Type.Object({
#     id: Type.String({description: '材料的唯一标识', default: 'concrete'}),
#     displayName: Type.String({description: '材料的显示名称', default: '混凝土'}),
#     penetrationLoss_dBPerMeter: Type.Number({description: '每米的穿透损耗，单位 dB/m', default: 40}),
#     reflectionCoefficient: Type.Number({description: '反射系数，范围 0~1', default: 0.5}),
#     defaultThickness_m: Type.Number({description: '默认厚度，单位米', default: 0.3}),
# }, {
#     description: '电磁材料属性定义',
# });
#
# export const Type_JoyStickInput = Type.Object({
#     vx: Type.Number({description: '前后速度输入，范围 -1~1，正值表示向前', default: 0}),
#     vy: Type.Number({description: '左右速度输入，范围 -1~1，正值表示向右', default: 0}),
#     vz: Type.Number({description: '上下速度输入，范围 -1~1，正值表示向上', default: 0}),
#     yawRate: Type.Number({description: '偏航角速度输入，范围 -1~1，正值表示顺时针旋转', default: 0}),
# }, {
#     description: '摇杆输入消息',
# });
