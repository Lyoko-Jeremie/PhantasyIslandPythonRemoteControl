import {socket} from './client';
import {FlyCmdEnum} from '../../radio/RadioRelaySocket/TypeDefFlyCmd';

/** 将 getFlyObjectInfo 返回的 XYH 结构转换为数组 [x, h, y]（单位 cm）
 *
 * 返回值说明：
 *  [0] = pos.x  — 水平 X 坐标 (cm)
 *  [1] = pos.h  — 飞行高度   (cm)
 *  [2] = pos.y  — 水平 Y 坐标 (cm)
 */
export function posXYH2arrayXYZ(pos: { x: number, y: number, h: number }): [number, number, number] {
    return [pos.x, pos.h, pos.y];
}

/** 将游戏坐标（cm，XHY 布局）转换为 Three.js 场景坐标（÷10，Y 轴取反）*/
export function xyz2area(pos: [number, number, number], s = 10): [number, number, number] {
    return [pos[0] / s, pos[1] / s, -pos[2] / s];
}

/**
 * 从 posXYH2arrayXYZ 结果中提取水平 X 坐标（cm）
 */
export function getX(pos: [number, number, number]): number {
    return pos[0];
}

/**
 * 从 posXYH2arrayXYZ 结果中提取水平 Y 坐标（cm）
 */
export function getY(pos: [number, number, number]): number {
    return pos[2];
}

/**
 * 水平距离（忽略高度层，适合不同高度层飞机的 XY 平面距离）
 */
export function distHorizontal(
    a: [number, number, number],
    b: [number, number, number],
): number {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[2] - b[2]) ** 2);
}

/**
 * 将坐标限制在飞行矩形边界内（默认带 50 cm 边距）
 */
export function clampBoundary(
    x: number, y: number,
    margin = 50, maxXY = 1000,
): { x: number; y: number } {
    return {
        x: Math.max(margin, Math.min(maxXY - margin, x)),
        y: Math.max(margin, Math.min(maxXY - margin, y)),
    };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * 确保无人机处于飞行状态，否则先执行起飞指令再等待。
 *
 * - isStop（在地面停止）  → 执行 takeoff
 * - isLanding（正在降落）→ 中断降落并重新起飞
 *
 * @param keyName  无人机 keyName
 * @param takeoffH 起飞目标高度（cm，默认 150 cm）
 * @returns 起飞指令是否被触发（true = 发送了 takeoff，调用方应额外等待无人机就位）
 */
export async function ensureAirborne(keyName: string, takeoffH = 150): Promise<boolean> {
    const infoResp = await socket.api.fly.getFlyObjectInfo(keyName).promise;
    if (infoResp.error) {
        console.warn(`[ensureAirborne] getFlyObjectInfo(${keyName}) 失败: ${infoResp.error}`);
        return false;
    }

    const {isStop, isLanding, isTakingOff} = infoResp.flyObjectInfo;

    if (isStop || isLanding) {
        const reason = isLanding ? '正在降落' : '停止在地面';
        console.log(`[ensureAirborne] ${keyName} 当前状态：${reason}，先执行起飞 (h=${takeoffH} cm)...`);
        const takeoffResp = await socket.api.fly.flyCmd(keyName, {
            cmd: FlyCmdEnum.takeoff,
            h: takeoffH,
        }).promise;
        if (takeoffResp.error) {
            console.error(`[ensureAirborne] ${keyName} takeoff 失败: ${takeoffResp.error}`);
            return false;
        }
        // 等待起飞动作有足够的初始高度再继续后续指令
        await sleep(2000);
        return true;
    }

    // 若正在起飞，稍等待确保姿态稳定后再下发指令
    if (isTakingOff) {
        console.log(`[ensureAirborne] ${keyName} 正在起飞中，稍等稳定...`);
        await sleep(1000);
    }

    return false;
}

/**
 * 将发射功率从瓦特转换为 dBm。
 */
export function txPowerW2Dbm(txPowerW: number) {
    return 10 * Math.log10(txPowerW * 1000);
}


