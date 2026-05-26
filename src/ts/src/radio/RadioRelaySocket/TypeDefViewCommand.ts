import Type from 'typebox';
import {Compile} from 'typebox/compile';

export interface ViewMaterialChangeCommand {
    // cmd: 'updateMeshViewMaterial';

    // ─── 目标标识 ───
    // meshId: string;

    // ─── 材质类型切换（可选，不传则保持当前类型，仅修改属性） ───
    materialType?: 'standard' | 'basic' | 'lambert' | 'phong' | 'physical';

    // ─── 基础属性（所有材质类型通用） ───
    color?: string;
    opacity?: number;
    transparent?: boolean;
    visible?: boolean;
    wireframe?: boolean;
    /** Three.js Side 枚举：0=FrontSide, 1=BackSide, 2=DoubleSide */
    side?: number;
    depthTest?: boolean;
    depthWrite?: boolean;
    alphaTest?: number;
    /** Three.js Blending 枚举：0=NoBlending, 1=NormalBlending, 2=AdditiveBlending, 3=SubtractiveBlending, 4=MultiplyBlending, 5=CustomBlending */
    blending?: number;
    vertexColors?: boolean;
    fog?: boolean;

    // ─── 自发光（Standard / Physical / Lambert / Phong） ───
    emissive?: string;
    emissiveIntensity?: number;

    // ─── PBR 属性（Standard / Physical） ───
    metalness?: number;
    roughness?: number;
    envMapIntensity?: number;
    flatShading?: boolean;

    // ─── Phong 专属 ───
    shininess?: number;
    specular?: string;

    // ─── Physical 材质扩展 ───
    clearcoat?: number;
    clearcoatRoughness?: number;
    transmission?: number;
    ior?: number;
    thickness?: number;
    sheen?: number;
    sheenRoughness?: number;
    sheenColor?: string;
    attenuationColor?: string;
    attenuationDistance?: number;
    iridescence?: number;
    iridescenceIOR?: number;
    iridescenceThicknessRange?: [number, number];
    specularIntensity?: number;
    specularColor?: string;
    reflectivity?: number;
    dispersion?: number;
    anisotropy?: number;
    anisotropyRotation?: number;

    // ─── 贴图（通过 URL 加载，空字符串表示移除该贴图） ───
    mapUrl?: string;
    normalMapUrl?: string;
    roughnessMapUrl?: string;
    metalnessMapUrl?: string;
    emissiveMapUrl?: string;
    aoMapUrl?: string;
    alphaMapUrl?: string;
    bumpMapUrl?: string;
    displacementMapUrl?: string;

    // ─── 贴图参数 ───
    normalScale?: [number, number];
    bumpScale?: number;
    displacementScale?: number;
    displacementBias?: number;
    aoMapIntensity?: number;

    // ─── 纹理平铺与偏移（统一应用到所有贴图） ───
    mapRepeat?: [number, number];
    mapOffset?: [number, number];
    mapRotation?: number;
}

const Type_Color_Hex = Type.String({pattern: '^#[0-9a-fA-F]{6}$', description: '十六进制颜色值，格式 #RRGGBB', default: '#ffffff'});
const Type_UV2 = Type.Tuple([Type.Number(), Type.Number()], {description: '二维向量 [u, v]', default: [1, 1]});

export const Type_ViewMaterialChangeCommand = Type.Object({
    // ─── 目标标识 ───
    // meshId: Type.String({description: '目标 mesh 的唯一标识（uuid）', default: 'mesh_001'}),

    // ─── 材质类型切换 ───
    materialType: Type.Optional(Type.Union([
        Type.Literal('standard'),
        Type.Literal('basic'),
        Type.Literal('lambert'),
        Type.Literal('phong'),
        Type.Literal('physical'),
    ], {description: '目标材质类型。不传则保持当前类型，仅修改属性。切换类型时，已有贴图不会自动迁移', default: 'standard'})),

    // ─── 基础属性（所有材质类型通用） ───
    color: Type.Optional(Type_Color_Hex),
    opacity: Type.Optional(Type.Number({description: '不透明度，范围 0（完全透明）~1（完全不透明）', default: 1, minimum: 0, maximum: 1})),
    transparent: Type.Optional(Type.Boolean({description: '是否启用透明。设为 true 后 opacity 才生效', default: false})),
    visible: Type.Optional(Type.Boolean({description: '是否可见', default: true})),
    wireframe: Type.Optional(Type.Boolean({description: '是否以线框模式渲染', default: false})),
    side: Type.Optional(Type.Union([
        Type.Literal(0, {description: 'FrontSide — 仅渲染正面'}),
        Type.Literal(1, {description: 'BackSide — 仅渲染背面'}),
        Type.Literal(2, {description: 'DoubleSide — 双面渲染'}),
    ], {description: 'Three.js Side 枚举', default: 0})),
    depthTest: Type.Optional(Type.Boolean({description: '是否开启深度测试', default: true})),
    depthWrite: Type.Optional(Type.Boolean({description: '是否写入深度缓冲区', default: true})),
    alphaTest: Type.Optional(Type.Number({
        description: 'Alpha 测试阈值，片元 alpha < 此值时被丢弃，范围 0~1',
        default: 0,
        minimum: 0,
        maximum: 1
    })),
    blending: Type.Optional(Type.Union([
        Type.Literal(0, {description: 'NoBlending — 无混合'}),
        Type.Literal(1, {description: 'NormalBlending — 标准 alpha 混合'}),
        Type.Literal(2, {description: 'AdditiveBlending — 叠加混合（发光效果）'}),
        Type.Literal(3, {description: 'SubtractiveBlending — 减去混合'}),
        Type.Literal(4, {description: 'MultiplyBlending — 正片叠底'}),
        Type.Literal(5, {description: 'CustomBlending — 自定义混合'}),
    ], {description: 'Three.js Blending 枚举', default: 1})),
    vertexColors: Type.Optional(Type.Boolean({description: '是否使用顶点颜色。启用后顶点颜色会与 color 相乘', default: false})),
    fog: Type.Optional(Type.Boolean({description: '是否受场景雾效影响', default: true})),

    // ─── 自发光 ───
    emissive: Type.Optional(Type.String({
        pattern: '^#[0-9a-fA-F]{6}$',
        description: '自发光颜色（#RRGGBB）。自发光不受光照影响，适用于 Standard/Physical/Lambert/Phong',
        default: '#000000'
    })),
    emissiveIntensity: Type.Optional(Type.Number({description: '自发光强度倍数', default: 1, minimum: 0})),

    // ─── PBR 属性（Standard / Physical） ───
    metalness: Type.Optional(Type.Number({description: '金属度，范围 0（非金属/电介质）~1（纯金属）', default: 0, minimum: 0, maximum: 1})),
    roughness: Type.Optional(Type.Number({description: '粗糙度，范围 0（镜面反射）~1（完全漫反射）', default: 1, minimum: 0, maximum: 1})),
    envMapIntensity: Type.Optional(Type.Number({description: '环境贴图影响强度', default: 1, minimum: 0})),
    flatShading: Type.Optional(Type.Boolean({description: '是否使用平面着色（每个三角面一个法线）', default: false})),

    // ─── Phong 专属 ───
    shininess: Type.Optional(Type.Number({description: 'Phong 高光指数，值越高高光越集中', default: 30, minimum: 0})),
    specular: Type.Optional(Type.String({pattern: '^#[0-9a-fA-F]{6}$', description: 'Phong 高光颜色（#RRGGBB）', default: '#111111'})),

    // ─── Physical 材质扩展 ───
    clearcoat: Type.Optional(Type.Number({
        description: '清漆层强度，范围 0~1。模拟汽车漆面、木地板等涂层效果',
        default: 0,
        minimum: 0,
        maximum: 1
    })),
    clearcoatRoughness: Type.Optional(Type.Number({description: '清漆层粗糙度，范围 0~1', default: 0, minimum: 0, maximum: 1})),
    transmission: Type.Optional(Type.Number({
        description: '透射率，范围 0~1。值为 1 时物体完全透光（如玻璃）。与 transparent/opacity 不同，transmission 基于物理模拟',
        default: 0,
        minimum: 0,
        maximum: 1
    })),
    ior: Type.Optional(Type.Number({
        description: '折射率（Index of Refraction），范围 1~2.333。玻璃≈1.5、水≈1.33、钻石≈2.42',
        default: 1.5,
        minimum: 1,
        maximum: 2.333
    })),
    thickness: Type.Optional(Type.Number({description: '物体厚度（米），用于 transmission 衰减计算', default: 0, minimum: 0})),
    sheen: Type.Optional(Type.Number({
        description: '光泽层强度，范围 0~1。模拟织物、天鹅绒等边缘柔光效果',
        default: 0,
        minimum: 0,
        maximum: 1
    })),
    sheenRoughness: Type.Optional(Type.Number({description: '光泽层粗糙度，范围 0~1', default: 1, minimum: 0, maximum: 1})),
    sheenColor: Type.Optional(Type.String({pattern: '^#[0-9a-fA-F]{6}$', description: '光泽层颜色（#RRGGBB）', default: '#000000'})),
    attenuationColor: Type.Optional(Type.String({
        pattern: '^#[0-9a-fA-F]{6}$',
        description: '透射衰减颜色（#RRGGBB），光线穿过物体时会逐渐变为此颜色（如有色玻璃）',
        default: '#ffffff'
    })),
    attenuationDistance: Type.Optional(Type.Number({
        description: '透射衰减距离（米），光线传播此距离后衰减到 attenuationColor。Infinity 表示不衰减',
        default: Infinity,
        minimum: 0
    })),
    iridescence: Type.Optional(Type.Number({
        description: '虹彩效果强度，范围 0~1。模拟肥皂泡、油膜等薄膜干涉效果',
        default: 0,
        minimum: 0,
        maximum: 1
    })),
    iridescenceIOR: Type.Optional(Type.Number({description: '虹彩薄膜层折射率，范围 1~2.333', default: 1.3, minimum: 1, maximum: 2.333})),
    iridescenceThicknessRange: Type.Optional(Type.Tuple([
        Type.Number({description: '薄膜最小厚度（nm）'}),
        Type.Number({description: '薄膜最大厚度（nm）'}),
    ], {description: '虹彩薄膜厚度范围（纳米），影响干涉色调', default: [100, 400]})),
    specularIntensity: Type.Optional(Type.Number({description: 'Physical 材质的高光强度，范围 0~1', default: 1, minimum: 0, maximum: 1})),
    specularColor: Type.Optional(Type.String({
        pattern: '^#[0-9a-fA-F]{6}$',
        description: 'Physical 材质的高光颜色（#RRGGBB）',
        default: '#ffffff'
    })),
    reflectivity: Type.Optional(Type.Number({
        description: '反射率，范围 0~1。内部会影响 F0（菲涅尔反射率）。仅 Physical',
        default: 0.5,
        minimum: 0,
        maximum: 1
    })),
    dispersion: Type.Optional(Type.Number({
        description: '色散强度，值越大折射时色散越明显（棱镜/钻石效果）。仅 Physical',
        default: 0,
        minimum: 0
    })),
    anisotropy: Type.Optional(Type.Number({
        description: '各向异性强度，范围 0~1。模拟拉丝金属、头发等方向性高光',
        default: 0,
        minimum: 0,
        maximum: 1
    })),
    anisotropyRotation: Type.Optional(Type.Number({description: '各向异性旋转角度（弧度），控制高光拉伸方向', default: 0})),

    // ─── 贴图（通过 URL 加载，空字符串 "" 表示移除该贴图） ───
    mapUrl: Type.Optional(Type.String({description: '漫反射/基础颜色贴图 URL，支持 png/jpg/webp。传空字符串移除贴图'})),
    normalMapUrl: Type.Optional(Type.String({description: '法线贴图 URL，用于模拟表面凹凸细节。传空字符串移除贴图'})),
    roughnessMapUrl: Type.Optional(Type.String({description: '粗糙度贴图 URL（灰度图，白=粗糙，黑=光滑）。传空字符串移除贴图'})),
    metalnessMapUrl: Type.Optional(Type.String({description: '金属度贴图 URL（灰度图，白=金属，黑=非金属）。传空字符串移除贴图'})),
    emissiveMapUrl: Type.Optional(Type.String({description: '自发光贴图 URL。传空字符串移除贴图'})),
    aoMapUrl: Type.Optional(Type.String({description: '环境光遮蔽贴图 URL（灰度图）。需要第二套 UV（uv2）。传空字符串移除贴图'})),
    alphaMapUrl: Type.Optional(Type.String({description: 'Alpha 贴图 URL（灰度图，白=不透明，黑=透明）。传空字符串移除贴图'})),
    bumpMapUrl: Type.Optional(Type.String({description: '凹凸贴图 URL（灰度图），通过亮度模拟高度差。传空字符串移除贴图'})),
    displacementMapUrl: Type.Optional(Type.String({description: '置换贴图 URL（灰度图），真正改变顶点位置。需要足够的网格细分。传空字符串移除贴图'})),

    // ─── 贴图参数 ───
    normalScale: Type.Optional(Type_UV2),
    bumpScale: Type.Optional(Type.Number({description: '凹凸贴图影响程度', default: 1})),
    displacementScale: Type.Optional(Type.Number({description: '置换贴图缩放系数', default: 1})),
    displacementBias: Type.Optional(Type.Number({description: '置换贴图偏移量', default: 0})),
    aoMapIntensity: Type.Optional(Type.Number({description: '环境光遮蔽强度', default: 1, minimum: 0})),

    // ─── 纹理平铺与偏移（统一应用到所有贴图） ───
    mapRepeat: Type.Optional(Type_UV2),
    mapOffset: Type.Optional(Type_UV2),
    mapRotation: Type.Optional(Type.Number({description: '贴图旋转角度（弧度），绕 UV 中心旋转', default: 0})),
} satisfies Record<keyof ViewMaterialChangeCommand, Type.TSchema>, {
    description: '修改mesh的可视化材质的指令。通过此指令来按需修改ThreeJs的mesh的material，影响物体的可视化效果，但不影响其电磁/物理属性。（或者是在修改电磁物理属性后为了可视化而使用此指令。）除 meshId 外所有字段均为可选，仅传入需要修改的属性即可实现增量更新。',
});

export const Type_ViewMaterialChangeCommand_Compiled = Compile(Type_ViewMaterialChangeCommand);


export interface ViewMaterialChangeCommandSimple {
    // cmd: 'updateMeshViewMaterialSimple';

    // ─── 基础属性（所有材质类型通用） ───
    color?: string;
    opacity?: number;
    transparent?: boolean;
    visible?: boolean;
    wireframe?: boolean;
    /** Three.js Side 枚举：0=FrontSide, 1=BackSide, 2=DoubleSide */
    side?: number;

    fog?: boolean;

    // ─── 自发光（Standard / Physical / Lambert / Phong） ───
    emissive?: string;
    emissiveIntensity?: number;

}

export const Type_ViewMaterialChangeCommandSimple = Type.Object({
    // ─── 基础属性（所有材质类型通用） ───
    color: Type.Optional(Type_Color_Hex),
    opacity: Type.Optional(Type.Number({description: '不透明度，范围 0（完全透明）~1（完全不透明）', default: 1, minimum: 0, maximum: 1})),
    transparent: Type.Optional(Type.Boolean({description: '是否启用透明。设为 true 后 opacity 才生效', default: false})),
    visible: Type.Optional(Type.Boolean({description: '是否可见', default: true})),
    wireframe: Type.Optional(Type.Boolean({description: '是否以线框模式渲染', default: false})),
    side: Type.Optional(Type.Union([
        Type.Literal(0, {description: 'FrontSide — 仅渲染正面'}),
        Type.Literal(1, {description: 'BackSide — 仅渲染背面'}),
        Type.Literal(2, {description: 'DoubleSide — 双面渲染'}),
    ], {description: 'Three.js Side 枚举', default: 0})),
    fog: Type.Optional(Type.Boolean({description: '是否受场景雾效影响', default: true})),

    // ─── 自发光 ───
    emissive: Type.Optional(Type.String({
        pattern: '^#[0-9a-fA-F]{6}$',
        description: '自发光颜色（#RRGGBB）。自发光不受光照影响，适用于 Standard/Physical/Lambert/Phong',
        default: '#000000'
    })),
    emissiveIntensity: Type.Optional(Type.Number({description: '自发光强度倍数', default: 1, minimum: 0})),
} satisfies Record<keyof ViewMaterialChangeCommandSimple, Type.TSchema>, {
    description: '修改mesh的可视化材质的指令（简化版）。仅包含部分基础属性，适用于不需要复杂材质效果的场景。通过此指令来按需修改ThreeJs的mesh的material，影响物体的可视化效果，但不影响其电磁/物理属性。（或者是在修改电磁物理属性后为了可视化而使用此指令。）除 meshId 外所有字段均为可选，仅传入需要修改的属性即可实现增量更新。',
});

export const Type_ViewMaterialChangeCommandSimple_Compiled = Compile(Type_ViewMaterialChangeCommandSimple);

