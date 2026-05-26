import {socket} from './client';
import {FlyCmdEnum} from '../../radio/RadioRelaySocket/TypeDefFlyCmd';

export function posXYH2arrayXYZ(pos: { x: number, y: number, h: number }): [number, number, number] {
    return [pos.x, pos.h, pos.y];
}

export function xyz2area(pos: [number, number, number], s = 10): [number, number, number] {
    return [pos[0] / s, pos[1] / s, -pos[2] / s];
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * 确保无人机处于飞行状态，否则先执行起飞指令再等待。
 *
 * - isStop（在地面停止）→ 执行 takeoff
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
 * @param txPowerW
 */
export function txPowerW2Dbm(txPowerW: number) {
    return 10 * Math.log10(txPowerW * 1000);
}
