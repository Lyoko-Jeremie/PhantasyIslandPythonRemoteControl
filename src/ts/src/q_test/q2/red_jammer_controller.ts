// ===== q2 红方干扰机控制器（捉迷藏追逐策略） =====
//
// 红方 C（red_jammer）行为流程：
//
//   1. 【等待阶段】 游戏开始后 5 秒内原地等待（给蓝方时间起飞并展开）。
//
//   2. 【追逐阶段】 持续读取 gameState.currentTarget，飞向目标飞机
//      当前位置（由裁判每帧更新）。每 CHASE_UPDATE_MS 重新下发 goto
//      指令，持续追踪移动中的目标。
//
//   3. 【干扰切换】 当 C 进入目标 EFFECTIVE_JAM_RANGE_CM 时，裁判模块
//      自动更新 gameState.currentTarget，C 在下次循环中即切换追踪对象。
//
//   4. 【高度层隔离】 C 固定在 HEIGHT_C=350 cm 飞行，高于蓝方 A/B，
//      确保无碰撞风险。
//
//   5. 【边界保护】 goto 目标坐标受边界限制，C 不会飞出 [0~1000] cm 范围。

import {socket} from './client';
import {FlyCmdEnum} from '../../radio/RadioRelaySocket/TypeDefFlyCmd';
import {ensureAirborne, clampBoundary, getX, getY} from './tool';
import {gameState} from './game_state';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── 飞行参数 ─────────────────────────────────────────────────────────────────

/** 红方 C 飞行高度层（cm），高于蓝方 A=150 和 B=250 */
const HEIGHT_C = 350;

/** 追逐速度（cm/s），略高于蓝方巡航速度使追逐有趣 */
const CHASE_SPEED = 35;

/** 每隔此时间（ms）重新更新追逐目标坐标（快速响应目标移动） */
const CHASE_UPDATE_MS = 400;

/** 游戏开始后 C 等待的时间（ms），给蓝方先行展开 */
const ACTIVATION_DELAY_MS = 5000;

/** 场地边界安全边距（cm） */
const BOUNDARY_MARGIN = 60;

// ── 主控制循环 ───────────────────────────────────────────────────────────────

export async function redJammerLoop(stopSignal: { stopped: boolean }): Promise<void> {
    console.log('[RED] 红方干扰机控制启动');

    // ── 起飞 ──────────────────────────────────────────────────────────────────
    await ensureAirborne('red_jammer', HEIGHT_C);
    await sleep(3000); // 等待起飞稳定

    // 飞到指定高度层
    await socket.api.fly.flyCmd('red_jammer', {
        cmd: FlyCmdEnum.high,
        h: HEIGHT_C,
        speed: CHASE_SPEED,
    }).promise;
    await sleep(1500);

    // ── 等待激活（游戏开始后 5 秒）───────────────────────────────────────────
    const activateAt = gameState.startTime + ACTIVATION_DELAY_MS;
    const waitMs = activateAt - Date.now();
    if (waitMs > 0) {
        console.log(`[RED] 等待激活，${(waitMs / 1000).toFixed(1)}s 后开始追逐...`);
        await sleep(waitMs);
    }
    console.log('[RED] 干扰机激活！开始追逐蓝方飞机');

    // ── 追逐循环 ─────────────────────────────────────────────────────────────
    while (!stopSignal.stopped && !gameState.gameOver) {
        const target = gameState.currentTarget;

        // 取目标当前位置
        const targetPos = target === 'A' ? gameState.posA : gameState.posB;

        if (targetPos === null) {
            // 目标位置尚未由裁判获取，稍等
            await sleep(CHASE_UPDATE_MS);
            continue;
        }

        const tX = getX(targetPos);
        const tY = getY(targetPos);

        // 将目标坐标限制在场地边界内（防止飞越边界）
        const clamped = clampBoundary(tX, tY, BOUNDARY_MARGIN);

        // 下发追逐 goto 指令（保持 C 在自己的高度层）
        const gotoResp = await socket.api.fly.flyCmd('red_jammer', {
            cmd: FlyCmdEnum.goto,
            x: clamped.x,
            y: clamped.y,
            h: HEIGHT_C,
            speed: CHASE_SPEED,
        }).promise;

        if (gotoResp.error) {
            console.error(`[RED] flyCmd(goto → ${target}) 失败: ${gotoResp.error}`);
            await sleep(500);
            continue;
        }

        console.log(
            `[RED] 追逐 ${target} → (${clamped.x.toFixed(0)},${clamped.y.toFixed(0)}) h=${HEIGHT_C}`,
        );

        // 等待一段时间再更新目标（目标飞机一直在移动）
        await sleep(CHASE_UPDATE_MS);

        // 若目标已被干扰（裁判将 currentTarget 切换到另一架），
        // 下次循环自动使用新的 currentTarget，无需额外处理
    }

    console.log('[RED] 干扰机控制循环退出');
}



