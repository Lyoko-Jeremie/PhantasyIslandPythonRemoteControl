// ===== q2 蓝方无人机控制器（捉迷藏逃跑策略） =====
//
// 蓝方 A（blue_drone_1）与 B（blue_drone_2）两架飞机执行逃跑行为：
//
//   1. 【被干扰状态】 当 gameState.jammedXUntil > Date.now() 时，
//      持续发送 hover 指令，原地悬停直到干扰时间结束。
//
//   2. 【逃跑策略】 当红方 C 进入 FLEE_TRIGGER_RANGE_CM 半径内时，
//      向远离 C 的方向快速逃离，优先确保最大间距。
//
//   3. 【随机游走】 平时在 [0~1000, 0~1000] cm 范围内随机选取下一目标点，
//      避免在角落/边界聚集，保持持续移动。
//
//   4. 【高度隔离】 A 固定在 HEIGHT_A=150 cm，B 固定在 HEIGHT_B=250 cm，
//      与红方 C（HEIGHT_C=350 cm）形成三个不同高度层，完全避免碰撞。
//
//   5. 【边界保护】 所有目标坐标均被限制在 [BOUNDARY_MARGIN, 1000-BOUNDARY_MARGIN]
//      的安全矩形内，确保飞机不飞出场地。

import {socket} from './client';
import {FlyCmdEnum} from '../../radio/RadioRelaySocket/TypeDefFlyCmd';
import {ensureAirborne, posXYH2arrayXYZ, distHorizontal, clampBoundary, getX, getY} from './tool';
import {gameState} from './game_state';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── 飞行参数 ─────────────────────────────────────────────────────────────────

/** 蓝方 A 飞行高度层（cm） */
const HEIGHT_A = 150;

/** 蓝方 B 飞行高度层（cm） */
const HEIGHT_B = 250;

/** 蓝方巡航速度（cm/s） */
const CRUISE_SPEED = 25;

/** 逃跑速度（cm/s）*/
const FLEE_SPEED = 30;

/** 距离 C 小于此值（cm）时触发逃跑模式 */
const FLEE_TRIGGER_RANGE_CM = 400;

/** 逃跑步长（cm），每次逃跑飞行的目标距离 */
const FLEE_STEP_CM = 350;

/** 随机游走步长范围（cm） */
const WANDER_MIN_CM = 150;
const WANDER_MAX_CM = 400;

/** 到达航点的判定半径（cm） */
const WAYPOINT_REACH_CM = 40;

/** 轮询间隔（ms） */
const POLL_INTERVAL_MS = 200;

/** 单次 goto 的最长等待时间（ms）；超时后重新规划 */
const MAX_GOTO_WAIT_MS = 3000;

/** 场地边界安全边距（cm） */
const BOUNDARY_MARGIN = 60;

/** AB 两机之间需保持的最小水平距离（cm） */
const MIN_AB_DISTANCE_CM = 150;

/** 航点候选重试次数上限（找不到满足间距的随机点时的最大尝试次数） */
const MAX_WANDER_ATTEMPTS = 20;

// ── 工具函数 ─────────────────────────────────────────────────────────────────

/**
 * 若候选点与伙伴飞机的水平距离 < MIN_AB_DISTANCE_CM，
 * 将候选点从伙伴方向推出至最小距离（+20 cm 余量），再做边界裁剪。
 */
function avoidPartner(
    candX: number, candY: number,
    partnerPos: [number, number, number] | null,
): { x: number; y: number } {
    if (partnerPos === null) return {x: candX, y: candY};
    const px = getX(partnerPos);
    const py = getY(partnerPos);
    const dx = candX - px;
    const dy = candY - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist >= MIN_AB_DISTANCE_CM) return {x: candX, y: candY};
    // 候选点过近：沿 候选→伙伴 方向向外推至最小距离 + 余量
    const len = dist || 1;
    const pushed = clampBoundary(
        px + (dx / len) * (MIN_AB_DISTANCE_CM + 20),
        py + (dy / len) * (MIN_AB_DISTANCE_CM + 20),
        BOUNDARY_MARGIN,
    );
    return pushed;
}

/** 选取随机游走目标点，保证与伙伴水平距离 ≥ MIN_AB_DISTANCE_CM */
function randomWanderTarget(
    curX: number, curY: number, h: number,
    partnerPos: [number, number, number] | null,
): { x: number; y: number; h: number } {
    for (let i = 0; i < MAX_WANDER_ATTEMPTS; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const dist = WANDER_MIN_CM + Math.random() * (WANDER_MAX_CM - WANDER_MIN_CM);
        const raw = clampBoundary(
            curX + Math.cos(angle) * dist,
            curY + Math.sin(angle) * dist,
            BOUNDARY_MARGIN,
        );
        // 满足与伙伴的最小间距则直接采用
        if (partnerPos === null) return {x: raw.x, y: raw.y, h};
        const px = getX(partnerPos);
        const py = getY(partnerPos);
        const d = Math.sqrt((raw.x - px) ** 2 + (raw.y - py) ** 2);
        if (d >= MIN_AB_DISTANCE_CM) return {x: raw.x, y: raw.y, h};
    }
    // 重试耗尽：强制推离伙伴
    const fallback = avoidPartner(curX, curY, partnerPos);
    return {x: fallback.x, y: fallback.y, h};
}

/** 选取逃离 C 的目标点（向远离 C 的方向移动 FLEE_STEP_CM），同时保证与伙伴间距 */
function fleeTarget(
    curX: number, curY: number,
    cX: number, cY: number, h: number,
    partnerPos: [number, number, number] | null,
): { x: number; y: number; h: number } {
    const dx = curX - cX;
    const dy = curY - cY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const raw = clampBoundary(
        curX + (dx / len) * FLEE_STEP_CM,
        curY + (dy / len) * FLEE_STEP_CM,
        BOUNDARY_MARGIN,
    );
    // 逃跑目标同样需要避免与伙伴过近
    const adjusted = avoidPartner(raw.x, raw.y, partnerPos);
    return {x: adjusted.x, y: adjusted.y, h};
}

// ── 单架飞机控制循环 ─────────────────────────────────────────────────────────

async function runBlueLoop(
    keyName: string,
    height: number,
    isJammedFn: () => boolean,
    getPartnerPos: () => [number, number, number] | null,   // 伙伴位置获取函数
    stopSignal: { stopped: boolean },
): Promise<void> {
    console.log(`[BLUE] ${keyName} 逃跑控制启动（高度层 ${height} cm）`);

    await ensureAirborne(keyName, height);
    await sleep(3000); // 等待起飞稳定

    // 起飞后先飞到对应高度层
    await socket.api.fly.flyCmd(keyName, {
        cmd: FlyCmdEnum.high,
        h: height,
        speed: CRUISE_SPEED,
    }).promise;
    await sleep(1500);

    while (!stopSignal.stopped && !gameState.gameOver) {
        // ── 被干扰状态：悬停等待 ──────────────────────────────────────────────
        if (isJammedFn()) {
            const remainMs = Math.max(
                0,
                (keyName === 'blue_drone_1' ? gameState.jammedAUntil : gameState.jammedBUntil)
                - Date.now(),
            );
            console.log(`[BLUE] ${keyName} 被干扰，悬停 ${(remainMs / 1000).toFixed(1)}s`);

            // 发送 hover 指令
            await socket.api.fly.flyCmd(keyName, {cmd: FlyCmdEnum.hover}).promise;
            await sleep(POLL_INTERVAL_MS);
            continue;
        }

        // ── 获取自身当前位置 ────────────────────────────────────────────────
        const selfResp = await socket.api.fly.getFlyObjectInfo(keyName).promise;
        if (selfResp.error) {
            console.warn(`[BLUE] ${keyName} getFlyObjectInfo 失败: ${selfResp.error}`);
            await sleep(POLL_INTERVAL_MS);
            continue;
        }
        const selfPos = posXYH2arrayXYZ(selfResp.flyObjectInfo.XYH);
        const curX = getX(selfPos);
        const curY = getY(selfPos);

        // ── 获取伙伴当前位置（用于间距约束） ────────────────────────────────
        const partnerPos = getPartnerPos();

        // ── 根据 C 的位置决定飞行策略 ───────────────────────────────────────
        const posC = gameState.posC;
        let target: { x: number; y: number; h: number };
        let speed: number;

        if (posC !== null) {
            const distToC = distHorizontal(selfPos, posC);
            if (distToC < FLEE_TRIGGER_RANGE_CM) {
                // 逃跑模式：向远离 C 的方向飞行，同时满足与伙伴的最小间距
                const cX = getX(posC);
                const cY = getY(posC);
                target = fleeTarget(curX, curY, cX, cY, height, partnerPos);
                speed = FLEE_SPEED;
                console.log(`[BLUE] ${keyName} 逃跑！C 距离 ${distToC.toFixed(0)} cm → 逃往 (${target.x.toFixed(0)},${target.y.toFixed(0)})`);
            } else {
                // 随机游走，满足与伙伴的最小间距
                target = randomWanderTarget(curX, curY, height, partnerPos);
                speed = CRUISE_SPEED;
            }
        } else {
            // C 位置未知，随机游走
            target = randomWanderTarget(curX, curY, height, partnerPos);
            speed = CRUISE_SPEED;
        }

        // ── 下发 goto 指令 ───────────────────────────────────────────────────
        const gotoResp = await socket.api.fly.flyCmd(keyName, {
            cmd: FlyCmdEnum.goto,
            x: target.x,
            y: target.y,
            h: height,
            speed,
        }).promise;

        if (gotoResp.error) {
            console.error(`[BLUE] ${keyName} flyCmd(goto) 失败: ${gotoResp.error}`);
            await sleep(500);
            continue;
        }

        // ── 等待到达目标（超时/干扰/C 接近/与伙伴过近时提前终止重规划）────
        const gotoStart = Date.now();
        while (!stopSignal.stopped && !gameState.gameOver) {
            // 被干扰 → 打断当前 goto，切换到悬停逻辑
            if (isJammedFn()) break;

            // 超过单次 goto 最长等待时间 → 重新规划
            if (Date.now() - gotoStart > MAX_GOTO_WAIT_MS) break;

            await sleep(POLL_INTERVAL_MS);

            const pollResp = await socket.api.fly.getFlyObjectInfo(keyName).promise;
            if (pollResp.error) continue;

            const pollPos = posXYH2arrayXYZ(pollResp.flyObjectInfo.XYH);
            const d = distHorizontal(pollPos, [target.x, height, target.y]);
            if (d <= WAYPOINT_REACH_CM) break; // 已到达

            // C 进入逃跑触发范围 → 提前重规划
            if (gameState.posC !== null) {
                const dToC = distHorizontal(pollPos, gameState.posC);
                if (dToC < FLEE_TRIGGER_RANGE_CM) break;
            }

            // 与伙伴水平距离过近 → 提前重规划，选新的目标点
            const latestPartner = getPartnerPos();
            if (latestPartner !== null) {
                const dToPartner = distHorizontal(pollPos, latestPartner);
                if (dToPartner < MIN_AB_DISTANCE_CM) {
                    console.log(`[BLUE] ${keyName} 与伙伴距离 ${dToPartner.toFixed(0)} cm < ${MIN_AB_DISTANCE_CM} cm，重新规划`);
                    break;
                }
            }
        }
    }

    console.log(`[BLUE] ${keyName} 控制循环退出`);
}

// ── 对外接口 ─────────────────────────────────────────────────────────────────

export async function blueDroneLoop(stopSignal: { stopped: boolean }): Promise<void> {
    // A 和 B 并行飞行，互不等待；各自读取对方的 gameState 位置作为伙伴参照
    runBlueLoop(
        'blue_drone_1', HEIGHT_A,
        // 修复：直接比对当前时间，不依赖裁判归零。
        // jammedAUntil !== 0 的旧写法在裁判挂起时会永久悬停。
        () => gameState.jammedAUntil > Date.now(),
        () => gameState.posB,   // A 的伙伴是 B
        stopSignal,
    ).catch(e => console.error('[BLUE] blue_drone_1 异常:', e));

    runBlueLoop(
        'blue_drone_2', HEIGHT_B,
        () => gameState.jammedBUntil > Date.now(),
        () => gameState.posA,   // B 的伙伴是 A
        stopSignal,
    ).catch(e => console.error('[BLUE] blue_drone_2 异常:', e));
}

