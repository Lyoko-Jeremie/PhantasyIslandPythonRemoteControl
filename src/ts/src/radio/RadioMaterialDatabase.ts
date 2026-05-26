/**
 * @file RadioMaterialDatabase.ts
 * @description 无线电传播材质属性数据模型
 *
 * 定义用于无线电信号传播计算的材质属性接口和预置材质常量。
 * 材质属性独立于 Three.js 渲染材质，专门用于信号穿透衰减和反射计算。
 *
 * 使用方式：
 * 1. 通过 RadioReachabilityChecker.setMaterialDatabase() 注册材质属性库
 * 2. 在 RadioSceneMeshWrapper 中通过 materialId 关联 Mesh 与材质
 */

/** 无线电传播材质属性 */
export interface RadioMaterialProperties {
    /** 材质唯一标识 */
    id: string;
    /** 显示名称（用于 UI，可选） */
    displayName?: string;
    /** 穿透衰减率 (dB/m)，信号穿过该材质每米所损耗的功率 */
    penetrationLoss_dBPerMeter: number;
    /**
     * 法向入射反射系数 (0~1)，表示信号功率被反射的比例。
     * 0 = 完全吸收（无反射），1 = 完全反射。
     * 简化模型，不考虑入射角依赖（Fresnel 方程留作后续扩展）。
     */
    reflectionCoefficient: number;
    /** 默认厚度 (m)，当射线无法估算穿透厚度时使用（如单面非封闭 Mesh） */
    defaultThickness_m: number;
}

/**
 * 预置材质常量（参考值 @ 2.4 GHz）。
 *
 * 数据来源:
 * - ITU-R P.2040: 建筑材料的电磁特性
 * - 3GPP TR 38.901: 室内传播模型
 * - 工程经验值
 */
export const PRESET_MATERIALS = {
    concrete: {
        id: 'concrete',
        displayName: '混凝土',
        penetrationLoss_dBPerMeter: 40,
        reflectionCoefficient: 0.5,
        defaultThickness_m: 0.3,
    },
    glass: {
        id: 'glass',
        displayName: '玻璃',
        penetrationLoss_dBPerMeter: 10,
        reflectionCoefficient: 0.25,
        defaultThickness_m: 0.01,
    },
    wood: {
        id: 'wood',
        displayName: '木材',
        penetrationLoss_dBPerMeter: 15,
        reflectionCoefficient: 0.15,
        defaultThickness_m: 0.1,
    },
    brick: {
        id: 'brick',
        displayName: '砖块',
        penetrationLoss_dBPerMeter: 25,
        reflectionCoefficient: 0.4,
        defaultThickness_m: 0.2,
    },
    metal: {
        id: 'metal',
        displayName: '金属',
        penetrationLoss_dBPerMeter: 100,
        reflectionCoefficient: 0.9,
        defaultThickness_m: 0.005,
    },
    drywall: {
        id: 'drywall',
        displayName: '石膏板',
        penetrationLoss_dBPerMeter: 8,
        reflectionCoefficient: 0.1,
        defaultThickness_m: 0.015,
    },
    ground: {
        id: 'ground',
        displayName: '地面',
        penetrationLoss_dBPerMeter: 50,
        reflectionCoefficient: 0.3,
        defaultThickness_m: 1.0,
    },
} as const satisfies Record<string, RadioMaterialProperties>;
