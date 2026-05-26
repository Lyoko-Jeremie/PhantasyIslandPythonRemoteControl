// ===== 蓝方无人机控制示例（固定航点直线往返） =====
//
// 两架蓝方无人机各自沿固定折线轨迹飞行，不依赖实时通信/限制区状态，
// 仅验证 flyCmd goto 基本功能是否正常。
//
// goto 指令参数单位为 cm，x/y 为水平坐标，h 为高度。
// 航点到达判断：以 getFlyObjectInfo 返回的 XYH（单位 m）
// 换算后与目标比较，距离 < WAYPOINT_REACH_CM 时切换下一航点。

import {socket} from './client';
import {FlyCmdEnum} from '../../radio/RadioRelaySocket/TypeDefFlyCmd';
import {ensureAirborne, posXYH2arrayXYZ} from './tool';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const WAYPOINT_REACH_CM = 40;
const POLL_INTERVAL_MS  = 200;

// ── 蓝方无人机 1 航点（沿 x 轴往返，单位 cm） ────────────────────────────────
const DRONE1_WAYPOINTS: Array<{ x: number; y: number; h: number }> = [
    {x:    0, y: -200, h: 120},
    {x:  300, y: -200, h: 120},
    {x:  600, y: -200, h: 120},
    {x:  300, y: -200, h: 120},
];

// ── 蓝方无人机 2 航点（平行于 drone_1，偏移 y，单位 cm） ──────────────────────
const DRONE2_WAYPOINTS: Array<{ x: number; y: number; h: number }> = [
    {x:    0, y:  200, h: 120},
    {x:  300, y:  200, h: 180},
    {x:  600, y:  200, h: 120},
    {x:  300, y:  200, h: 180},
];

function dist2D(ax: number, ay: number, bx: number, by: number): number {
    return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

async function runWaypointLoop(
    keyName: string,
    waypoints: Array<{ x: number; y: number; h: number }>,
    takeoffH: number,
    stopSignal: { stopped: boolean },
): Promise<void> {
    console.log(`[BLUE] ${keyName} 固定航点飞行启动`);

    await ensureAirborne(keyName, takeoffH);
    await sleep(3000); // 等待起飞稳定

    let wpIdx = 0;

    while (!stopSignal.stopped) {
        const wp = waypoints[wpIdx]!;

        const gotoResp = await socket.api.fly.flyCmd(keyName, {
            cmd: FlyCmdEnum.goto,
            x: wp.x,
            y: wp.y,
            h: wp.h,
            speed: 20,
        }).promise;

        if (gotoResp.error) {
            console.error(`[BLUE] ${keyName} flyCmd(goto) wp${wpIdx} 失败: ${gotoResp.error}`);
            await sleep(500);
            continue;
        }

        console.log(`[BLUE] ${keyName} 飞往航点 ${wpIdx}: (${wp.x}, ${wp.y}, h=${wp.h}) cm`);

        // 等待到达航点
        while (!stopSignal.stopped) {
            await sleep(POLL_INTERVAL_MS);

            const infoResp = await socket.api.fly.getFlyObjectInfo(keyName).promise;
            if (infoResp.error) {
                console.warn(`[BLUE] ${keyName} getFlyObjectInfo 失败: ${infoResp.error}`);
                continue;
            }

            const [x, h, y] = posXYH2arrayXYZ(infoResp.flyObjectInfo.XYH);
            const curXcm = x;
            const curYcm = y;

            const d = dist2D(curXcm, curYcm, wp.x, wp.y);
            if (d <= WAYPOINT_REACH_CM) {
                console.log(`[BLUE] ${keyName} 到达航点 ${wpIdx}，切换至下一航点`);
                break;
            }
        }

        wpIdx = (wpIdx + 1) % waypoints.length;
    }
}

export async function blueDroneLoop(stopSignal: { stopped: boolean }) {
    // 两架无人机并行飞行，互不等待
    runWaypointLoop('blue_drone_1', DRONE1_WAYPOINTS, 120, stopSignal)
        .catch(e => console.error('[BLUE] blue_drone_1 异常:', e));

    runWaypointLoop('blue_drone_2', DRONE2_WAYPOINTS, 120, stopSignal)
        .catch(e => console.error('[BLUE] blue_drone_2 异常:', e));
}
