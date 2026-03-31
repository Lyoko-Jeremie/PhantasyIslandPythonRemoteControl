"""
Python 等价类型定义，对应 TypeScript TypeBox 定义的视图材质指令类型。

原始 TypeScript TypeBox 定义见 TypeDefViewCommand.ts。
"""

from __future__ import annotations

import dataclasses
from typing import Optional, Tuple


# ---------------------------------------------------------------------------
# ViewMaterialChangeCommand — 修改 mesh 可视化材质的指令（完整版）
# ---------------------------------------------------------------------------
@dataclasses.dataclass
class ViewMaterialChangeCommand:
    """
    修改 mesh 的可视化材质的指令。

    通过此指令来按需修改 ThreeJs 的 mesh 的 material，影响物体的可视化效果，
    但不影响其电磁/物理属性。（或者是在修改电磁物理属性后为了可视化而使用此指令。）
    除 meshId 外所有字段均为可选，仅传入需要修改的属性即可实现增量更新。
    """

    # ─── 材质类型切换（可选，不传则保持当前类型，仅修改属性） ───
    materialType: Optional[str] = None
    """目标材质类型：``'standard'``, ``'basic'``, ``'lambert'``, ``'phong'``, ``'physical'``。
    不传则保持当前类型，仅修改属性。切换类型时，已有贴图不会自动迁移"""

    # ─── 基础属性（所有材质类型通用） ───
    color: Optional[str] = None
    """十六进制颜色值，格式 ``#RRGGBB``，默认 ``'#ffffff'``"""

    opacity: Optional[float] = None
    """不透明度，范围 0（完全透明）~1（完全不透明），默认 1"""

    transparent: Optional[bool] = None
    """是否启用透明。设为 True 后 opacity 才生效，默认 False"""

    visible: Optional[bool] = None
    """是否可见，默认 True"""

    wireframe: Optional[bool] = None
    """是否以线框模式渲染，默认 False"""

    side: Optional[int] = None
    """Three.js Side 枚举：0=FrontSide（仅渲染正面），1=BackSide（仅渲染背面），2=DoubleSide（双面渲染），默认 0"""

    depthTest: Optional[bool] = None
    """是否开启深度测试，默认 True"""

    depthWrite: Optional[bool] = None
    """是否写入深度缓冲区，默认 True"""

    alphaTest: Optional[float] = None
    """Alpha 测试阈值，片元 alpha < 此值时被丢弃，范围 0~1，默认 0"""

    blending: Optional[int] = None
    """Three.js Blending 枚举：0=NoBlending, 1=NormalBlending, 2=AdditiveBlending,
    3=SubtractiveBlending, 4=MultiplyBlending, 5=CustomBlending，默认 1"""

    vertexColors: Optional[bool] = None
    """是否使用顶点颜色。启用后顶点颜色会与 color 相乘，默认 False"""

    fog: Optional[bool] = None
    """是否受场景雾效影响，默认 True"""

    # ─── 自发光（Standard / Physical / Lambert / Phong） ───
    emissive: Optional[str] = None
    """自发光颜色（``#RRGGBB``）。自发光不受光照影响，适用于 Standard/Physical/Lambert/Phong，默认 ``'#000000'``"""

    emissiveIntensity: Optional[float] = None
    """自发光强度倍数，默认 1"""

    # ─── PBR 属性（Standard / Physical） ───
    metalness: Optional[float] = None
    """金属度，范围 0（非金属/电介质）~1（纯金属），默认 0"""

    roughness: Optional[float] = None
    """粗糙度，范围 0（镜面反射）~1（完全漫反射），默认 1"""

    envMapIntensity: Optional[float] = None
    """环境贴图影响强度，默认 1"""

    flatShading: Optional[bool] = None
    """是否使用平面着色（每个三角面一个法线），默认 False"""

    # ─── Phong 专属 ───
    shininess: Optional[float] = None
    """Phong 高光指数，值越高高光越集中，默认 30"""

    specular: Optional[str] = None
    """Phong 高光颜色（``#RRGGBB``），默认 ``'#111111'``"""

    # ─── Physical 材质扩展 ───
    clearcoat: Optional[float] = None
    """清漆层强度，范围 0~1。模拟汽车漆面、木地板等涂层效果，默认 0"""

    clearcoatRoughness: Optional[float] = None
    """清漆层粗糙度，范围 0~1，默认 0"""

    transmission: Optional[float] = None
    """透射率，范围 0~1。值为 1 时物体完全透光（如玻璃）。
    与 transparent/opacity 不同，transmission 基于物理模拟，默认 0"""

    ior: Optional[float] = None
    """折射率（Index of Refraction），范围 1~2.333。玻璃≈1.5、水≈1.33、钻石≈2.42，默认 1.5"""

    thickness: Optional[float] = None
    """物体厚度（米），用于 transmission 衰减计算，默认 0"""

    sheen: Optional[float] = None
    """光泽层强度，范围 0~1。模拟织物、天鹅绒等边缘柔光效果，默认 0"""

    sheenRoughness: Optional[float] = None
    """光泽层粗糙度，范围 0~1，默认 1"""

    sheenColor: Optional[str] = None
    """光泽层颜色（``#RRGGBB``），默认 ``'#000000'``"""

    attenuationColor: Optional[str] = None
    """透射衰减颜色（``#RRGGBB``），光线穿过物体时会逐渐变为此颜色（如有色玻璃），默认 ``'#ffffff'``"""

    attenuationDistance: Optional[float] = None
    """透射衰减距离（米），光线传播此距离后衰减到 attenuationColor。``float('inf')`` 表示不衰减，默认 inf"""

    iridescence: Optional[float] = None
    """虹彩效果强度，范围 0~1。模拟肥皂泡、油膜等薄膜干涉效果，默认 0"""

    iridescenceIOR: Optional[float] = None
    """虹彩薄膜层折射率，范围 1~2.333，默认 1.3"""

    iridescenceThicknessRange: Optional[Tuple[float, float]] = None
    """虹彩薄膜厚度范围（纳米） ``(min_nm, max_nm)``，影响干涉色调，默认 ``(100, 400)``"""

    specularIntensity: Optional[float] = None
    """Physical 材质的高光强度，范围 0~1，默认 1"""

    specularColor: Optional[str] = None
    """Physical 材质的高光颜色（``#RRGGBB``），默认 ``'#ffffff'``"""

    reflectivity: Optional[float] = None
    """反射率，范围 0~1。内部会影响 F0（菲涅尔反射率）。仅 Physical，默认 0.5"""

    dispersion: Optional[float] = None
    """色散强度，值越大折射时色散越明显（棱镜/钻石效果）。仅 Physical，默认 0"""

    anisotropy: Optional[float] = None
    """各向异性强度，范围 0~1。模拟拉丝金属、头发等方向性高光，默认 0"""

    anisotropyRotation: Optional[float] = None
    """各向异性旋转角度（弧度），控制高光拉伸方向，默认 0"""

    # ─── 贴图（通过 URL 加载，空字符串表示移除该贴图） ───
    mapUrl: Optional[str] = None
    """漫反射/基础颜色贴图 URL，支持 png/jpg/webp。传空字符串移除贴图"""

    normalMapUrl: Optional[str] = None
    """法线贴图 URL，用于模拟表面凹凸细节。传空字符串移除贴图"""

    roughnessMapUrl: Optional[str] = None
    """粗糙度贴图 URL（灰度图，白=粗糙，黑=光滑）。传空字符串移除贴图"""

    metalnessMapUrl: Optional[str] = None
    """金属度贴图 URL（灰度图，白=金属，黑=非金属）。传空字符串移除贴图"""

    emissiveMapUrl: Optional[str] = None
    """自发光贴图 URL。传空字符串移除贴图"""

    aoMapUrl: Optional[str] = None
    """环境光遮蔽贴图 URL（灰度图）。需要第二套 UV（uv2）。传空字符串移除贴图"""

    alphaMapUrl: Optional[str] = None
    """Alpha 贴图 URL（灰度图，白=不透明，黑=透明）。传空字符串移除贴图"""

    bumpMapUrl: Optional[str] = None
    """凹凸贴图 URL（灰度图），通过亮度模拟高度差。传空字符串移除贴图"""

    displacementMapUrl: Optional[str] = None
    """置换贴图 URL（灰度图），真正改变顶点位置。需要足够的网格细分。传空字符串移除贴图"""

    # ─── 贴图参数 ───
    normalScale: Optional[Tuple[float, float]] = None
    """法线贴图缩放 ``(u, v)``，默认 ``(1, 1)``"""

    bumpScale: Optional[float] = None
    """凹凸贴图影响程度，默认 1"""

    displacementScale: Optional[float] = None
    """置换贴图缩放系数，默认 1"""

    displacementBias: Optional[float] = None
    """置换贴图偏移量，默认 0"""

    aoMapIntensity: Optional[float] = None
    """环境光遮蔽强度，默认 1"""

    # ─── 纹理平铺与偏移（统一应用到所有贴图） ───
    mapRepeat: Optional[Tuple[float, float]] = None
    """贴图平铺次数 ``(u, v)``，默认 ``(1, 1)``"""

    mapOffset: Optional[Tuple[float, float]] = None
    """贴图偏移 ``(u, v)``，默认 ``(1, 1)``"""

    mapRotation: Optional[float] = None
    """贴图旋转角度（弧度），绕 UV 中心旋转，默认 0"""

    # ─── 序列化 / 反序列化辅助 ───

    _TUPLE_FIELDS = frozenset({
        'iridescenceThicknessRange', 'normalScale', 'mapRepeat', 'mapOffset',
    })

    def to_dict(self) -> dict:
        """转换为 dict，自动过滤值为 ``None`` 的字段（与 TypeBox 的 Optional 语义一致）。"""
        result: dict = {}
        for k, v in dataclasses.asdict(self).items():
            if v is not None:
                # Tuple 字段转为 list 以便 JSON 序列化
                if isinstance(v, tuple):
                    v = list(v)
                result[k] = v
        return result


def view_material_change_command_from_dict(data: dict) -> ViewMaterialChangeCommand:
    """从 dict 构造 ViewMaterialChangeCommand，忽略未知字段。"""
    known_fields = {f.name for f in dataclasses.fields(ViewMaterialChangeCommand)}
    kwargs: dict = {}
    for k, v in data.items():
        if k not in known_fields:
            continue
        if v is None:
            continue
        # 将 list 转为 tuple（对应 Tuple 类型字段）
        if k in ViewMaterialChangeCommand._TUPLE_FIELDS and isinstance(v, list):
            v = (float(v[0]), float(v[1]))
        kwargs[k] = v
    return ViewMaterialChangeCommand(**kwargs)


# ---------------------------------------------------------------------------
# ViewMaterialChangeCommandSimple — 修改 mesh 可视化材质的指令（简化版）
# ---------------------------------------------------------------------------
@dataclasses.dataclass
class ViewMaterialChangeCommandSimple:
    """
    修改 mesh 的可视化材质的指令（简化版）。

    仅包含部分基础属性，适用于不需要复杂材质效果的场景。
    通过此指令来按需修改 ThreeJs 的 mesh 的 material，影响物体的可视化效果，
    但不影响其电磁/物理属性。（或者是在修改电磁物理属性后为了可视化而使用此指令。）
    除 meshId 外所有字段均为可选，仅传入需要修改的属性即可实现增量更新。
    """

    # ─── 基础属性（所有材质类型通用） ───
    color: Optional[str] = None
    """十六进制颜色值，格式 ``#RRGGBB``，默认 ``'#ffffff'``"""

    opacity: Optional[float] = None
    """不透明度，范围 0（完全透明）~1（完全不透明），默认 1"""

    transparent: Optional[bool] = None
    """是否启用透明。设为 True 后 opacity 才生效，默认 False"""

    visible: Optional[bool] = None
    """是否可见，默认 True"""

    wireframe: Optional[bool] = None
    """是否以线框模式渲染，默认 False"""

    side: Optional[int] = None
    """Three.js Side 枚举：0=FrontSide（仅渲染正面），1=BackSide（仅渲染背面），2=DoubleSide（双面渲染），默认 0"""

    fog: Optional[bool] = None
    """是否受场景雾效影响，默认 True"""

    # ─── 自发光（Standard / Physical / Lambert / Phong） ───
    emissive: Optional[str] = None
    """自发光颜色（``#RRGGBB``）。自发光不受光照影响，适用于 Standard/Physical/Lambert/Phong，默认 ``'#000000'``"""

    emissiveIntensity: Optional[float] = None
    """自发光强度倍数，默认 1"""

    def to_dict(self) -> dict:
        """转换为 dict，自动过滤值为 ``None`` 的字段（与 TypeBox 的 Optional 语义一致）。"""
        return {k: v for k, v in dataclasses.asdict(self).items() if v is not None}


def view_material_change_command_simple_from_dict(data: dict) -> ViewMaterialChangeCommandSimple:
    """从 dict 构造 ViewMaterialChangeCommandSimple，忽略未知字段。"""
    known_fields = {f.name for f in dataclasses.fields(ViewMaterialChangeCommandSimple)}
    return ViewMaterialChangeCommandSimple(**{k: v for k, v in data.items() if k in known_fields and v is not None})


# ========================= 原始 TypeScript TypeBox 定义 =========================
#
# export const Type_ViewMaterialChangeCommand = Type.Object({
#     materialType: Type.Optional(Type.Union([
#         Type.Literal('standard'), Type.Literal('basic'), Type.Literal('lambert'),
#         Type.Literal('phong'), Type.Literal('physical'),
#     ])),
#     color: Type.Optional(Type.String({pattern: '^#[0-9a-fA-F]{6}$'})),
#     opacity: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     transparent: Type.Optional(Type.Boolean()),
#     visible: Type.Optional(Type.Boolean()),
#     wireframe: Type.Optional(Type.Boolean()),
#     side: Type.Optional(Type.Union([Type.Literal(0), Type.Literal(1), Type.Literal(2)])),
#     depthTest: Type.Optional(Type.Boolean()),
#     depthWrite: Type.Optional(Type.Boolean()),
#     alphaTest: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     blending: Type.Optional(Type.Union([
#         Type.Literal(0), Type.Literal(1), Type.Literal(2),
#         Type.Literal(3), Type.Literal(4), Type.Literal(5),
#     ])),
#     vertexColors: Type.Optional(Type.Boolean()),
#     fog: Type.Optional(Type.Boolean()),
#     emissive: Type.Optional(Type.String({pattern: '^#[0-9a-fA-F]{6}$'})),
#     emissiveIntensity: Type.Optional(Type.Number({minimum: 0})),
#     metalness: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     roughness: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     envMapIntensity: Type.Optional(Type.Number({minimum: 0})),
#     flatShading: Type.Optional(Type.Boolean()),
#     shininess: Type.Optional(Type.Number({minimum: 0})),
#     specular: Type.Optional(Type.String({pattern: '^#[0-9a-fA-F]{6}$'})),
#     clearcoat: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     clearcoatRoughness: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     transmission: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     ior: Type.Optional(Type.Number({minimum: 1, maximum: 2.333})),
#     thickness: Type.Optional(Type.Number({minimum: 0})),
#     sheen: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     sheenRoughness: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     sheenColor: Type.Optional(Type.String({pattern: '^#[0-9a-fA-F]{6}$'})),
#     attenuationColor: Type.Optional(Type.String({pattern: '^#[0-9a-fA-F]{6}$'})),
#     attenuationDistance: Type.Optional(Type.Number({minimum: 0})),
#     iridescence: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     iridescenceIOR: Type.Optional(Type.Number({minimum: 1, maximum: 2.333})),
#     iridescenceThicknessRange: Type.Optional(Type.Tuple([Type.Number(), Type.Number()])),
#     specularIntensity: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     specularColor: Type.Optional(Type.String({pattern: '^#[0-9a-fA-F]{6}$'})),
#     reflectivity: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     dispersion: Type.Optional(Type.Number({minimum: 0})),
#     anisotropy: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     anisotropyRotation: Type.Optional(Type.Number()),
#     mapUrl: Type.Optional(Type.String()),
#     normalMapUrl: Type.Optional(Type.String()),
#     roughnessMapUrl: Type.Optional(Type.String()),
#     metalnessMapUrl: Type.Optional(Type.String()),
#     emissiveMapUrl: Type.Optional(Type.String()),
#     aoMapUrl: Type.Optional(Type.String()),
#     alphaMapUrl: Type.Optional(Type.String()),
#     bumpMapUrl: Type.Optional(Type.String()),
#     displacementMapUrl: Type.Optional(Type.String()),
#     normalScale: Type.Optional(Type.Tuple([Type.Number(), Type.Number()])),
#     bumpScale: Type.Optional(Type.Number()),
#     displacementScale: Type.Optional(Type.Number()),
#     displacementBias: Type.Optional(Type.Number()),
#     aoMapIntensity: Type.Optional(Type.Number({minimum: 0})),
#     mapRepeat: Type.Optional(Type.Tuple([Type.Number(), Type.Number()])),
#     mapOffset: Type.Optional(Type.Tuple([Type.Number(), Type.Number()])),
#     mapRotation: Type.Optional(Type.Number()),
# });
#
# export const Type_ViewMaterialChangeCommandSimple = Type.Object({
#     color: Type.Optional(Type.String({pattern: '^#[0-9a-fA-F]{6}$'})),
#     opacity: Type.Optional(Type.Number({minimum: 0, maximum: 1})),
#     transparent: Type.Optional(Type.Boolean()),
#     visible: Type.Optional(Type.Boolean()),
#     wireframe: Type.Optional(Type.Boolean()),
#     side: Type.Optional(Type.Union([Type.Literal(0), Type.Literal(1), Type.Literal(2)])),
#     fog: Type.Optional(Type.Boolean()),
#     emissive: Type.Optional(Type.String({pattern: '^#[0-9a-fA-F]{6}$'})),
#     emissiveIntensity: Type.Optional(Type.Number({minimum: 0})),
# });

