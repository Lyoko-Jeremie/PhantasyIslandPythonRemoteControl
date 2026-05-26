// ===== 红方干扰机控制示例（固定航点巡逻） =====
//
// 红方干扰机沿固定正方形轨迹巡逻，不动态追踪蓝方位置，
// 避免坐标换算错误导致跑飞。
//
// goto 指令参数单位为 cm，x/y 为水平坐标，h 为高度。
// 航点到达判断：以 getFlyObjectInfo 返回的 XYH（单位 m）
// 换算后与目标比较，距离 < WAYPOINT_REACH_CM 时切换下一航点。

import {socket} from './client';
import {FlyCmdEnum} from '../../radio/RadioRelaySocket/TypeDefFlyCmd';
import {ensureAirborne, posXYH2arrayXYZ} from './tool';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── 巡逻航点（单位 cm，绝对坐标） ────────────────────────────────────────────
// 正方形轨迹，边长 500 cm，高度固定 200 cm
const PATROL_WAYPOINTS: Array<{ x: number; y: number; h: number }> = [
    {x: 0, y: 0, h: 250},
    {x: 500, y: 0, h: 250},
    {x: 500, y: 500, h: 250},
    {x: 0, y: 500, h: 250},
];

const WAYPOINT_REACH_CM = 40;  // 距目标航点 ≤ 此值（cm）时视为到达
const POLL_INTERVAL_MS = 200; // 位置轮询间隔

/** cm 单位下两点水平距离 */
function dist2D(
    ax: number, ay: number,
    bx: number, by: number,
): number {
    return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

export async function redJammerLoop(stopSignal: { stopped: boolean }) {
    console.log('[RED] 固定航点巡逻启动');

    // ── 起飞 ──────────────────────────────────────────────────────────────────
    await ensureAirborne('red_jammer', PATROL_WAYPOINTS[0]!.h);
    await sleep(3000); // 等待起飞稳定

    let wpIdx = 0;

    while (!stopSignal.stopped) {
        const wp = PATROL_WAYPOINTS[wpIdx]!;

        // 下发 goto 指令飞向当前航点
        const gotoResp = await socket.api.fly.flyCmd('red_jammer', {
            cmd: FlyCmdEnum.goto,
            x: wp.x,
            y: wp.y,
            h: wp.h,
            speed: 20,
        }).promise;

        if (gotoResp.error) {
            console.error(`[RED] flyCmd(goto) wp${wpIdx} 失败: ${gotoResp.error}`);
            await sleep(500);
            continue;
        }

        console.log(`[RED] 飞往航点 ${wpIdx}: (${wp.x}, ${wp.y}, h=${wp.h}) cm`);

        // 轮询位置，等待到达航点
        while (!stopSignal.stopped) {
            await sleep(POLL_INTERVAL_MS);

            const infoResp = await socket.api.fly.getFlyObjectInfo('red_jammer').promise;
            if (infoResp.error) {
                console.warn(`[RED] getFlyObjectInfo 失败: ${infoResp.error}`);
                continue;
            }

            const [x, h, y] = posXYH2arrayXYZ(infoResp.flyObjectInfo.XYH);
            const curXcm = x;
            const curYcm = y;

            const d = dist2D(curXcm, curYcm, wp.x, wp.y);
            if (d <= WAYPOINT_REACH_CM) {
                console.log(`[RED] 到达航点 ${wpIdx}，切换至下一航点`);
                break;
            }
        }

        // 切换下一航点（循环）
        wpIdx = (wpIdx + 1) % PATROL_WAYPOINTS.length;
    }
}

