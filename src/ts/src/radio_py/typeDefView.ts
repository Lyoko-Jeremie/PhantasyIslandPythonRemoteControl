/**
 * TypeScript 类型定义。
 */

/** 修改 mesh 的可视化材质的指令。 */
export interface ViewMaterialChangeCommand {
    /** 目标材质类型 */
    materialType?: 'standard' | 'basic' | 'lambert' | 'phong' | 'physical';
    /** 十六进制颜色值，格式 #RRGGBB */
    color?: string;
    /** 不透明度，范围 0~1 */
    opacity?: number;
    /** 是否启用透明 */
    transparent?: boolean;
    /** 是否可见 */
    visible?: boolean;
    /** 是否以线框模式渲染 */
    wireframe?: boolean;
    /** Three.js Side 枚举：0=FrontSide, 1=BackSide, 2=DoubleSide */
    side?: 0 | 1 | 2;
    /** 是否开启深度测试 */
    depthTest?: boolean;
    /** 是否写入深度缓冲区 */
    depthWrite?: boolean;
    /** Alpha 测试阈值 */
    alphaTest?: number;
    /** Three.js Blending 枚举 */
    blending?: 0 | 1 | 2 | 3 | 4 | 5;
    /** 是否使用顶点颜色 */
    vertexColors?: boolean;
    /** 是否受场景雾效影响 */
    fog?: boolean;
    /** 自发光颜色 */
    emissive?: string;
    /** 自发光强度倍数 */
    emissiveIntensity?: number;
    /** 金属度 */
    metalness?: number;
    /** 粗糙度 */
    roughness?: number;
    /** 环境贴图影响强度 */
    envMapIntensity?: number;
    /** 是否使用平面着色 */
    flatShading?: boolean;
    /** Phong 高光指数 */
    shininess?: number;
    /** Phong 高光颜色 */
    specular?: string;
    /** 清漆层强度 */
    clearcoat?: number;
    /** 清漆层粗糙度 */
    clearcoatRoughness?: number;
    /** 透射率 */
    transmission?: number;
    /** 折射率 */
    ior?: number;
    /** 物体厚度（米） */
    thickness?: number;
    /** 光泽层强度 */
    sheen?: number;
    /** 光泽层粗糙度 */
    sheenRoughness?: number;
    /** 光泽层颜色 */
    sheenColor?: string;
    /** 透射衰减颜色 */
    attenuationColor?: string;
    /** 透射衰减距离 */
    attenuationDistance?: number;
    /** 虹彩效果强度 */
    iridescence?: number;
    /** 虹彩薄膜层折射率 */
    iridescenceIOR?: number;
    /** 虹彩薄膜厚度范围（纳米） [min_nm, max_nm] */
    iridescenceThicknessRange?: [number, number];
    /** Physical 材质的高光强度 */
    specularIntensity?: number;
    /** Physical 材质的高光颜色 */
    specularColor?: string;
    /** 反射率 */
    reflectivity?: number;
    /** 色散强度 */
    dispersion?: number;
    /** 各向异性强度 */
    anisotropy?: number;
    /** 各向异性旋转角度（弧度） */
    anisotropyRotation?: number;
    /** 漫反射/基础颜色贴图 URL */
    mapUrl?: string;
    /** 法线贴图 URL */
    normalMapUrl?: string;
    /** 粗糙度贴图 URL */
    roughnessMapUrl?: string;
    /** 金属度贴图 URL */
    metalnessMapUrl?: string;
    /** 自发光贴图 URL */
    emissiveMapUrl?: string;
    /** 环境光遮蔽贴图 URL */
    aoMapUrl?: string;
    /** Alpha 贴图 URL */
    alphaMapUrl?: string;
    /** 凹凸贴图 URL */
    bumpMapUrl?: string;
    /** 置换贴图 URL */
    displacementMapUrl?: string;
    /** 法线贴图缩放 [u, v] */
    normalScale?: [number, number];
    /** 凹凸贴图影响程度 */
    bumpScale?: number;
    /** 置换贴图缩放系数 */
    displacementScale?: number;
    /** 置换贴图偏移量 */
    displacementBias?: number;
    /** 环境光遮蔽强度 */
    aoMapIntensity?: number;
    /** 贴图平铺次数 [u, v] */
    mapRepeat?: [number, number];
    /** 贴图偏移 [u, v] */
    mapOffset?: [number, number];
    /** 贴图旋转角度（弧度） */
    mapRotation?: number;
}

/** 修改 mesh 的可视化材质的指令（简化版）。 */
export interface ViewMaterialChangeCommandSimple {
    /** 十六进制颜色值 */
    color?: string;
    /** 不透明度 */
    opacity?: number;
    /** 是否启用透明 */
    transparent?: boolean;
    /** 是否可见 */
    visible?: boolean;
    /** 是否以线框模式渲染 */
    wireframe?: boolean;
    /** Three.js Side 枚举 */
    side?: 0 | 1 | 2;
    /** 是否受场景雾效影响 */
    fog?: boolean;
    /** 自发光颜色 */
    emissive?: string;
    /** 自发光强度倍数 */
    emissiveIntensity?: number;
}
