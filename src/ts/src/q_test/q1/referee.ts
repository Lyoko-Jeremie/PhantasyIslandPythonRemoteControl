// ===== 裁判模块示例 =====

import {socket} from './client';
import {posXYH2arrayXYZ, txPowerW2Dbm, xyz2area} from './tool';
import {RadioCheckOptions} from '../../radio/RadioTypes';

const SNR_THRESHOLD_DB = 10;   // 干扰信号强度高于有效信号强度 10 dB 视为被有效干扰
const COMMS_FREQ_MHZ = 2400;
const COMMS_POWER_DBM = txPowerW2Dbm(1);
const JAMMER_POWER_DBM = txPowerW2Dbm(3);

const OptionsCheckReachability = {
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
    defaultTxAntennaGain_dBi: 5,
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
    defaultRxAntennaGain_dBi: 5,
    enableMultipath: true,
    maxReflectionPaths: 200,
} satisfies RadioCheckOptions;
/** 蓝方接收机，接收灵敏度（dBm）。接收功率低于此值视为不可达 */
const rxSensitivityDbm = -105;

export interface RadioEvent {
    timestamp: number;
    timestampString: string;
    type: 'comm_blocked' | 'jammed' | 'entered_restricted' | 'killed';
    droneKey: string;
    position: [number, number, number];
    detail: string;
}

export interface JudgeRoundResult {
    posA: [number, number, number];
    posB: [number, number, number];
    posJ: [number, number, number];
    /** 蓝方 A↔B 链路综合状态，供可视化连线着色 */
    linkStatus: 'ok' | 'jammed' | 'blocked';
}

export const eventLog: RadioEvent[] = [];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function judgeRound(): Promise<JudgeRoundResult | null> {
    // -- 获取各方位置 --
    // fly.getFlyObjectInfo(keyName) — 直接传字符串，.promise 取响应
    const blueA = await socket.api.fly.getFlyObjectInfo('blue_drone_1').promise;
    if (blueA.error) {
        console.error(`[REFEREE] getFlyObjectInfo(blue_drone_1) 失败: ${blueA.error}`);
        return null;
    }
    const blueB = await socket.api.fly.getFlyObjectInfo('blue_drone_2').promise;
    if (blueB.error) {
        console.error(`[REFEREE] getFlyObjectInfo(blue_drone_2) 失败: ${blueB.error}`);
        return null;
    }
    const jammer = await socket.api.fly.getFlyObjectInfo('red_jammer').promise;
    if (jammer.error) {
        console.error(`[REFEREE] getFlyObjectInfo(red_jammer) 失败: ${jammer.error}`);
        return null;
    }
    // console.log('blueA', blueA);
    // console.log('blueB', blueB);
    // console.log('jammer', jammer);
    const posA = posXYH2arrayXYZ(blueA.flyObjectInfo.XYH);
    const posB = posXYH2arrayXYZ(blueB.flyObjectInfo.XYH);
    const posJ = posXYH2arrayXYZ(jammer.flyObjectInfo.XYH);

    // 用于记录综合链路状态，供 return 后的可视化使用
    let isBlocked = false;
    let hasJammed = false;

    // ① 蓝方 A↔B 通信可达性（radio.checkReachability(aTx, bRx, options?)）
    const linkAB = await socket.api.radio.checkReachability(
        xyz2area(posA),
        xyz2area(posB),
        {frequencyMHz: COMMS_FREQ_MHZ, txPowerDbm: COMMS_POWER_DBM, ...OptionsCheckReachability, rxSensitivityDbm: rxSensitivityDbm,},
    ).promise;
    if (linkAB.error) {
        console.error(`[REFEREE] checkReachability(A↔B) 失败: ${linkAB.error}`);
    } else if (!linkAB.result.reachable) {
        isBlocked = true;
        recordEvent('comm_blocked', 'blue_drone_1', xyz2area(posA),
            `A↔B 通信不可达，障碍物数: ${linkAB.result.obstacles.length}`,
            linkAB.timestamp, linkAB.timestampString);
        console.log('A↔B', linkAB.result.estimatedRxPower_dBm, +linkAB.result.distance.toFixed(2),
            xyz2area(posA).map(T => +T.toFixed(2)), xyz2area(posB).map(T => +T.toFixed(2)));
    }

    // ② 干扰 SNR 计算（radio.checkReachability(aTx, bRx, options?)）
    for (const [droneKey, dronePos, partnerPos] of [
        ['blue_drone_1', posA, posB],
        ['blue_drone_2', posB, posA],
    ] as const) {
        // 无人机间通信信号强度（伙伴→本机）
        const commLink = await socket.api.radio.checkReachability(
            xyz2area(partnerPos),
            xyz2area(dronePos),
            {frequencyMHz: COMMS_FREQ_MHZ, txPowerDbm: COMMS_POWER_DBM, ...OptionsCheckReachability,},
        ).promise;
        if (commLink.error) {
            console.error(`[REFEREE] checkReachability(partner→${droneKey}) 失败: ${commLink.error}`);
            continue;
        }
        const signalPower = commLink.result.estimatedRxPower_dBm;

        // 干扰机→本机干扰信号强度
        const jamLink = await socket.api.radio.checkReachability(
            xyz2area(posJ),
            xyz2area(dronePos),
            {frequencyMHz: COMMS_FREQ_MHZ, txPowerDbm: JAMMER_POWER_DBM, ...OptionsCheckReachability,},
        ).promise;
        if (jamLink.error) {
            console.error(`[REFEREE] checkReachability(jammer→${droneKey}) 失败: ${jamLink.error}`);
            continue;
        }
        const jammerPower = jamLink.result.estimatedRxPower_dBm;


        // SNR = 信号功率 - 干扰功率 (dB 域直接相减)
        const snr = signalPower - jammerPower;
        if (signalPower < jammerPower && Math.abs(snr) > SNR_THRESHOLD_DB) {
            recordEvent('jammed', droneKey, xyz2area(dronePos),
                `{${signalPower.toFixed(1)}/${jammerPower.toFixed(1)}}dB SNR=${snr.toFixed(1)} dB < 阈值 ${SNR_THRESHOLD_DB} dB，通信受到有效干扰`,
                jamLink.timestamp, jamLink.timestampString);
            hasJammed = true;
        }
    }

    // ③ 限制区判定（restrictedArea.pointInAnyArea(pos)）— 直接传坐标数组
    for (const [droneKey, dronePos] of [
        ['blue_drone_1', posA],
        ['blue_drone_2', posB],
    ] as const) {
        const areaCheck = await socket.api.restrictedArea.pointInAnyArea(xyz2area(dronePos)).promise;
        if (areaCheck.error) {
            console.error(`[REFEREE] pointInAnyArea(${droneKey}) 失败: ${areaCheck.error}`);
            continue;
        }
        for (const area of areaCheck.result) {
            const evtType = area.name === 'KillZone' ? 'killed' : 'entered_restricted';
            recordEvent(evtType, droneKey, xyz2area(dronePos),
                `进入区域 "${area.name}"（type=${area.type}）`,
                areaCheck.timestamp, areaCheck.timestampString);
        }
    }

    // 综合链路状态：blocked > jammed > ok
    const linkStatus: JudgeRoundResult['linkStatus'] =
        isBlocked ? 'blocked' : hasJammed ? 'jammed' : 'ok';

    return {posA, posB, posJ, linkStatus};
}

function recordEvent(
    type: RadioEvent['type'], droneKey: string,
    position: [number, number, number], detail: string,
    timestamp: number, timestampString: string,
) {
    const evt: RadioEvent = {timestamp, timestampString, type, droneKey, position, detail};
    eventLog.push(evt);
    console.log(`[REFEREE][${timestampString}] ${type.toUpperCase()} | ${droneKey} @ [${position}] | ${detail}`);
}

// 由 main.ts 统一驱动；此处保留独立运行入口供单独调试使用
async function refereeLoop() {
    while (true) {
        try {
            await judgeRound();
        } catch (e) {
            console.error('[REFEREE] 本轮裁判出错，跳过本轮:', e);
        }
        await sleep(200); // 5 Hz 裁判刷新率
    }
}

// 由 main.ts 统一驱动；此处保留独立运行入口供单独调试使用
// console.log('Referee loop started');
// refereeLoop().catch(E => console.error('Referee loop error:', E));
