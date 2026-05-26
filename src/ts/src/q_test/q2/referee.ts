// ===== q2 裁判模块 =====
//
// 职责：
//   1. 每轮从仿真引擎获取三架飞机的最新位置，写入 gameState。
//   2. 使用 radio.checkReachability 计算 C→A/B 的干扰 SNR：
//      干扰信号（C→drone）功率 - 通信信号（partner→drone）功率 > SNR_THRESHOLD_DB
//      视为该飞机被有效干扰，触发 10 秒悬停计时器。
//   3. 干扰到期后显式归零，并设置保护期防止立即重干扰。
//   4. 每帧动态更新 currentTarget（始终指向当前自由飞机）。
//   5. 检测游戏结束条件：AB 同时被干扰持续 ≥ BOTH_JAMMED_WIN_MS（5 秒）。

import {socket} from './client';
import {posXYH2arrayXYZ, xyz2area, txPowerW2Dbm, distHorizontal} from './tool';
import {gameState} from './game_state';
import {RadioCheckOptions} from '../../radio/RadioTypes';

// ── 无线电参数 ───────────────────────────────────────────────────────────────

const COMMS_FREQ_MHZ   = 2400;
/** 蓝方 AB 互联通信发射功率 */
const COMMS_POWER_DBM  = txPowerW2Dbm(1);   // ≈ 30 dBm
/** 红方 C 干扰机发射功率（高于通信功率，确保近距离可干扰） */
const JAMMER_POWER_DBM = txPowerW2Dbm(1);   // ≈ 37 dBm
/** 干扰信号超过通信信号此值（dB）时，视为有效干扰 */
const SNR_THRESHOLD_DB = 10;
/** 蓝方接收机灵敏度（dBm） */
const RX_SENSITIVITY_DBM = -105;

const RADIO_OPTIONS = {
    defaultTxAntennaGain_dBi: 5,
    defaultRxAntennaGain_dBi: 5,
    // 修复：maxReflectionPaths 从 200 降至 20。
    // 200 路径计算量极大，会导致 Promise.all 中 4 个并行 checkReachability
    // 长时间挂起，进而阻塞主裁判循环，使可视化和干扰状态归零全部停止。
    enableMultipath: true,
    maxReflectionPaths: 20,
} satisfies RadioCheckOptions;

/** 为单个 radio API Promise 添加超时保护，防止阻塞整个 judgeRound */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
    ]);
}

// ── 游戏参数 ─────────────────────────────────────────────────────────────────

/** 被干扰飞机悬停时长（ms） */
export const JAM_HOVER_DURATION_MS = 3_000;

/**
 * AB 同时被干扰后，需持续保持此时长（ms）才判定游戏结束。
 * 若在此期间任意一架脱离干扰，计时器归零重新计时。
 */
export const BOTH_JAMMED_WIN_MS = 5_000;

/**
 * 飞机从干扰中恢复后的保护期（ms）。
 * 保护期内即使 SNR 仍满足条件也不重新触发干扰，
 * 避免 C 在 A/B 悬停位置附近时到期瞬间立刻重干扰。
 */
const JAM_RECOVERY_MS = 4_000;

// ── AB 同时被干扰的持续计时（模块级，由 judgeRound 维护） ──────────────────
/** AB 同时进入干扰状态的起始时刻；0 表示当前并非同时被干扰 */
let bothJammedSince = 0;

// ── 事件日志 ────────────────────────────────────────────────────────────────

export interface GameEvent {
    timestamp: number;
    timestampString: string;
    type: 'jammed_A' | 'jammed_B' | 'game_over';
    position: [number, number, number];
    detail: string;
}

export const eventLog: GameEvent[] = [];

function recordEvent(
    type: GameEvent['type'],
    position: [number, number, number],
    detail: string,
): GameEvent {
    const ts = Date.now();
    const tsStr = new Date(ts).toISOString();
    const evt: GameEvent = {timestamp: ts, timestampString: tsStr, type, position, detail};
    eventLog.push(evt);
    console.log(`[REFEREE][${tsStr}] ${type.toUpperCase()} @ ` +
        `[${position.map(v => +v.toFixed(0))}] | ${detail}`);
    return evt;
}

// ── 裁判判定结果 ─────────────────────────────────────────────────────────────

export interface JudgeRoundResult {
    posA: [number, number, number];
    posB: [number, number, number];
    posC: [number, number, number];
    /** 本轮是否发生新的干扰事件 */
    newEvent: GameEvent | null;
}

// ── 主判定函数 ───────────────────────────────────────────────────────────────

export async function judgeRound(): Promise<JudgeRoundResult | null> {
    // ── 1. 获取三架飞机当前位置 ───────────────────────────────────────────────
    const [blueAResp, blueBResp, redCResp] = await Promise.all([
        socket.api.fly.getFlyObjectInfo('blue_drone_1').promise,
        socket.api.fly.getFlyObjectInfo('blue_drone_2').promise,
        socket.api.fly.getFlyObjectInfo('red_jammer').promise,
    ]);

    if (blueAResp.error) {
        console.error(`[REFEREE] getFlyObjectInfo(blue_drone_1) 失败: ${blueAResp.error}`);
        return null;
    }
    if (blueBResp.error) {
        console.error(`[REFEREE] getFlyObjectInfo(blue_drone_2) 失败: ${blueBResp.error}`);
        return null;
    }
    if (redCResp.error) {
        console.error(`[REFEREE] getFlyObjectInfo(red_jammer) 失败: ${redCResp.error}`);
        return null;
    }

    const posA = posXYH2arrayXYZ(blueAResp.flyObjectInfo.XYH);
    const posB = posXYH2arrayXYZ(blueBResp.flyObjectInfo.XYH);
    const posC = posXYH2arrayXYZ(redCResp.flyObjectInfo.XYH);

    // ── 2. 写入共享位置 ───────────────────────────────────────────────────────
    gameState.posA = posA;
    gameState.posB = posB;
    gameState.posC = posC;

    const now = Date.now();
    let newEvent: GameEvent | null = null;

    // ── 3. 干扰到期检测：显式归零 + 设置恢复保护期 ──────────────────────────
    if (gameState.jammedAUntil > 0 && gameState.jammedAUntil <= now) {
        console.log(`[REFEREE] ✅ A 干扰到期，恢复自由飞行（保护期 ${JAM_RECOVERY_MS / 1000}s）`);
        gameState.jammedAUntil = 0;
        gameState.jamRecoveryAUntil = now + JAM_RECOVERY_MS;
    }
    if (gameState.jammedBUntil > 0 && gameState.jammedBUntil <= now) {
        console.log(`[REFEREE] ✅ B 干扰到期，恢复自由飞行（保护期 ${JAM_RECOVERY_MS / 1000}s）`);
        gameState.jammedBUntil = 0;
        gameState.jamRecoveryBUntil = now + JAM_RECOVERY_MS;
    }

    // ── 4. 无线电 SNR 干扰检测 ───────────────────────────────────────────────
    //
    // 模型：AB 之间保持双向通信链路（模拟控制信道）。
    // C 对每架飞机的干扰强度 = C→drone 接收功率 - partner→drone 接收功率。
    // 若干扰功率超过通信功率 SNR_THRESHOLD_DB 以上，视为该飞机被有效干扰。
    //
    // 场景坐标（除以 10，Z 轴取反）由 xyz2area() 转换，供 radio API 使用。

    const sceneA = xyz2area(posA);
    const sceneB = xyz2area(posB);
    const sceneC = xyz2area(posC);

    // 并行请求 A 的通信+干扰链路，以及 B 的通信+干扰链路
    // 修复：每个 checkReachability 用 withTimeout 包装（2s 超时），
    // 防止单个 radio 请求挂起导致整个 judgeRound 永久阻塞。
    const RADIO_TIMEOUT_MS = 2000;
    const radioError = {error: 'timeout', result: null as any};

    const [jamCA, jamCB] = await Promise.all([
        // A 侧：C→A 干扰功率
        withTimeout(socket.api.radio.checkReachability(sceneC, sceneA, {
            frequencyMHz: COMMS_FREQ_MHZ,
            txPowerDbm: JAMMER_POWER_DBM,
            rxSensitivityDbm: RX_SENSITIVITY_DBM,
            ...RADIO_OPTIONS,
        }).promise, RADIO_TIMEOUT_MS, radioError as any),
        // B 侧：C→B 干扰功率
        withTimeout(socket.api.radio.checkReachability(sceneC, sceneB, {
            frequencyMHz: COMMS_FREQ_MHZ,
            txPowerDbm: JAMMER_POWER_DBM,
            rxSensitivityDbm: RX_SENSITIVITY_DBM,
            ...RADIO_OPTIONS,
        }).promise, RADIO_TIMEOUT_MS, radioError as any),
    ]);

    const [commBA, commAB] = await Promise.all([
        // A 侧：B→A 通信功率
        withTimeout(socket.api.radio.checkReachability(sceneB, sceneA, {
            frequencyMHz: COMMS_FREQ_MHZ,
            txPowerDbm: COMMS_POWER_DBM,
            rxSensitivityDbm: RX_SENSITIVITY_DBM,
            ...RADIO_OPTIONS,
        }, {color2LowRxPowerDbm: jamCB.estimatedRxPower_dBm, fresnelZoneColor2: '#FF00FF'}).promise, RADIO_TIMEOUT_MS, radioError as any),
        // B 侧：A→B 通信功率
        withTimeout(socket.api.radio.checkReachability(sceneA, sceneB, {
            frequencyMHz: COMMS_FREQ_MHZ,
            txPowerDbm: COMMS_POWER_DBM,
            rxSensitivityDbm: RX_SENSITIVITY_DBM,
            ...RADIO_OPTIONS,
        }, {color2LowRxPowerDbm: jamCA.estimatedRxPower_dBm, fresnelZoneColor2: '#FF00FF'}).promise, RADIO_TIMEOUT_MS, radioError as any),
    ]);

    // 检查 API 错误
    if (commBA.error) console.warn(`[REFEREE] radio B→A 失败: ${commBA.error}`);
    if (jamCA.error)  console.warn(`[REFEREE] radio C→A 失败: ${jamCA.error}`);
    if (commAB.error) console.warn(`[REFEREE] radio A→B 失败: ${commAB.error}`);
    if (jamCB.error)  console.warn(`[REFEREE] radio C→B 失败: ${jamCB.error}`);

    // 计算 SNR（干扰功率 - 通信功率，dB；正值越大干扰越强）
    const snrA = (!commBA.error && !jamCA.error)
        ? jamCA.result.estimatedRxPower_dBm - commBA.result.estimatedRxPower_dBm
        : -Infinity;
    const snrB = (!commAB.error && !jamCB.error)
        ? jamCB.result.estimatedRxPower_dBm - commAB.result.estimatedRxPower_dBm
        : -Infinity;

    // 干扰触发条件：
    //   ① SNR > SNR_THRESHOLD_DB（干扰信号明显强于通信信号）
    //   ② 飞机当前未被干扰（jammedXUntil === 0）
    //   ③ 不在恢复保护期内
    const aCanBeJammed = gameState.jammedAUntil === 0 && gameState.jamRecoveryAUntil <= now;
    const bCanBeJammed = gameState.jammedBUntil === 0 && gameState.jamRecoveryBUntil <= now;

    if (snrA > SNR_THRESHOLD_DB && aCanBeJammed) {
        gameState.jammedAUntil = now + JAM_HOVER_DURATION_MS;
        gameState.jamRecoveryAUntil = 0;
        gameState.jamCountA++;
        const detail =
            `C 干扰 A（SNR=${snrA.toFixed(1)} dB > ${SNR_THRESHOLD_DB} dB，` +
            `干扰功率=${jamCA.result.estimatedRxPower_dBm.toFixed(1)} dBm，` +
            `通信功率=${commBA.result.estimatedRxPower_dBm.toFixed(1)} dBm），` +
            `A 悬停 ${JAM_HOVER_DURATION_MS / 1000}s。（A 总干扰次数=${gameState.jamCountA}）`;
        newEvent = recordEvent('jammed_A', posA, detail);
    } else if (snrB > SNR_THRESHOLD_DB && bCanBeJammed) {
        gameState.jammedBUntil = now + JAM_HOVER_DURATION_MS;
        gameState.jamRecoveryBUntil = 0;
        gameState.jamCountB++;
        const detail =
            `C 干扰 B（SNR=${snrB.toFixed(1)} dB > ${SNR_THRESHOLD_DB} dB，` +
            `干扰功率=${jamCB.result.estimatedRxPower_dBm.toFixed(1)} dBm，` +
            `通信功率=${commAB.result.estimatedRxPower_dBm.toFixed(1)} dBm），` +
            `B 悬停 ${JAM_HOVER_DURATION_MS / 1000}s。（B 总干扰次数=${gameState.jamCountB}）`;
        newEvent = recordEvent('jammed_B', posB, detail);
    }

    // ── 5. 动态追踪目标更新 ──────────────────────────────────────────────────
    // 每帧根据干扰状态决定 C 追谁：
    //   - 只有 A 自由  → 追 A
    //   - 只有 B 自由  → 追 B
    //   - 两者均自由   → 追距离 C 更近的一架（贪心）
    //   - 两者均被干扰 → 维持当前目标（等待胜利判定）
    const aJammed = gameState.jammedAUntil > 0;
    const bJammed = gameState.jammedBUntil > 0;
    const distCA = distHorizontal(posC, posA);
    const distCB = distHorizontal(posC, posB);

    if (!aJammed && bJammed) {
        gameState.currentTarget = 'A';
    } else if (aJammed && !bJammed) {
        gameState.currentTarget = 'B';
    } else if (!aJammed && !bJammed) {
        gameState.currentTarget = distCA <= distCB ? 'A' : 'B';
    }

    // ── 6. 游戏结束检测：AB 同时被干扰且持续 ≥ BOTH_JAMMED_WIN_MS ────────────
    if (aJammed && bJammed) {
        if (bothJammedSince === 0) {
            bothJammedSince = now;
            console.log('[REFEREE] ⚠️ AB 同时被干扰，开始计时（需持续 ' +
                `${BOTH_JAMMED_WIN_MS / 1000}s 判定胜利）`);
        }

        const bothJammedDuration = now - bothJammedSince;
        const remainSec = Math.max(0, (BOTH_JAMMED_WIN_MS - bothJammedDuration) / 1000);

        if (Math.floor(bothJammedDuration / 1000) !== Math.floor((bothJammedDuration - 200) / 1000)) {
            console.log(`[REFEREE] ⏱ AB 同时被干扰已持续 ` +
                `${(bothJammedDuration / 1000).toFixed(1)}s，还需 ${remainSec.toFixed(1)}s 判定胜利`);
        }

        if (bothJammedDuration >= BOTH_JAMMED_WIN_MS && !gameState.gameOver) {
            gameState.gameOver = true;
            const elapsedSec = ((now - gameState.startTime) / 1000).toFixed(1);
            const detail =
                `AB 同时被干扰持续 ${(bothJammedDuration / 1000).toFixed(1)}s ≥ ${BOTH_JAMMED_WIN_MS / 1000}s！红方胜利！` +
                `总耗时 ${elapsedSec}s，A 干扰次数=${gameState.jamCountA}，B 干扰次数=${gameState.jamCountB}`;
            newEvent = recordEvent('game_over', posC, detail);
            console.log('\n🎉 [REFEREE] ===== 游戏结束！红方 C 成功同时干扰 AB 双机超过 5 秒！=====\n');
        }
    } else {
        if (bothJammedSince !== 0) {
            const interrupted = ((now - bothJammedSince) / 1000).toFixed(1);
            console.log(`[REFEREE] AB 同时干扰中断（已持续 ${interrupted}s），计时归零。` +
                `（A=${aJammed ? '干扰中' : '自由'} B=${bJammed ? '干扰中' : '自由'}）`);
            bothJammedSince = 0;
        }
    }

    // ── 7. 周期性状态日志（每 5 秒输出一次） ─────────────────────────────────
    const elapsed = now - gameState.startTime;
    if (Math.floor(elapsed / 5000) !== Math.floor((elapsed - 200) / 5000)) {
        const aRemain = gameState.jammedAUntil > 0
            ? ((gameState.jammedAUntil - now) / 1000).toFixed(1) + 's' : '自由';
        const bRemain = gameState.jammedBUntil > 0
            ? ((gameState.jammedBUntil - now) / 1000).toFixed(1) + 's' : '自由';
        const aRecov = gameState.jamRecoveryAUntil > now
            ? `(保护${((gameState.jamRecoveryAUntil - now) / 1000).toFixed(1)}s)` : '';
        const bRecov = gameState.jamRecoveryBUntil > now
            ? `(保护${((gameState.jamRecoveryBUntil - now) / 1000).toFixed(1)}s)` : '';
        console.log(
            `[REFEREE] [${(elapsed / 1000).toFixed(0)}s] ` +
            `A=(${posA[0].toFixed(0)},${posA[2].toFixed(0)}) ${aRemain}${aRecov} snrA=${snrA.toFixed(1)}dB | ` +
            `B=(${posB[0].toFixed(0)},${posB[2].toFixed(0)}) ${bRemain}${bRecov} snrB=${snrB.toFixed(1)}dB | ` +
            `C=(${posC[0].toFixed(0)},${posC[2].toFixed(0)}) 追=${gameState.currentTarget}`,
        );
    }

    return {posA, posB, posC, newEvent};
}
