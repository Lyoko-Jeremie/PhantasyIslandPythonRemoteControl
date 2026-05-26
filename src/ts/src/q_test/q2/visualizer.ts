// ===== q2 可视化模块 =====
//
// 可视化对象说明：
//   group_blue_labels  — 蓝方 A/B 状态标记（被干扰时变红色方块）
//   group_jammer_area  — 红方 C 干扰范围球体（半透明红色）
//   group_chase_lines  — C 到当前追踪目标的连线
//   group_events       — 干扰事件发生时的临时标记方块

import {socket} from './client';
import {xyz2area} from './tool';
import {GameEvent} from './referee';

// ── 初始化可视化分组 ─────────────────────────────────────────────────────────

export async function initVisualization(): Promise<void> {
    // 1. 蓝方 A 状态标记（绿色方块，被干扰时通过 updateObject 变红）
    await socket.api.visionDraw.createGroup(
        'group_blue_labels',
        [
            {
                type: 'cube', name: 'marker_A', id: 'marker_A',
                size: [3, 3, 3],
                position: [0, 15, 0],
                color: '#00aaff', opacity: 0.9,
            },
            {
                type: 'cube', name: 'marker_B', id: 'marker_B',
                size: [3, 3, 3],
                position: [10, 25, 0],
                color: '#00aaff', opacity: 0.9,
            },
        ],
    ).promise;

    // 2. 红方 C 干扰范围球体（半透明红色，radius = EFFECTIVE_JAM_RANGE_CM / 10 scene units）
    // await socket.api.visionDraw.createGroup(
    //     'group_jammer_area',
    //     [
    //         {
    //             type: 'sphere', name: 'jammer_sphere', id: 'jammer_sphere',
    //             radius: EFFECTIVE_JAM_RANGE_CM / 10, // cm → scene units
    //             position: [50, 35, -50],
    //             color: '#ff2200', opacity: 0.12,
    //         },
    //     ],
    // ).promise;

    // 3. C 到当前目标的追逐连线
    await socket.api.visionDraw.createGroup(
        'group_chase_lines',
        [
            {
                type: 'line', name: 'chase_line', id: 'chase_line',
                lineVec: [1, 0, 0],
                lineRadius: 0.15,
                position: [50, 35, -50],
                color: '#ff4400', opacity: 0.7,
            },
        ],
    ).promise;
}

// ── 每帧更新可视化 ───────────────────────────────────────────────────────────

export async function updateVisualization(
    posA: [number, number, number],
    posB: [number, number, number],
    posC: [number, number, number],
    aJammed: boolean,
    bJammed: boolean,
    currentTarget: 'A' | 'B',
): Promise<void> {
    const sceneA = xyz2area(posA);
    const sceneB = xyz2area(posB);
    const sceneC = xyz2area(posC);

    // 注意：jammer_sphere 在 initVisualization 中已注释掉未创建，
    // 此处移除对它的 setObjectPosition 调用，避免每帧报错。
    // await socket.api.visionDraw.setObjectPosition('jammer_sphere', sceneC).promise;

    // 更新 A 标记位置及颜色（被干扰 → 红色，正常 → 蓝色）
    await socket.api.visionDraw.updateObject('marker_A', {
        position: [sceneA[0], sceneA[1] + 0.5, sceneA[2]],
        color: aJammed ? '#ff2200' : '#00aaff',
    }).promise;

    // 更新 B 标记位置及颜色
    await socket.api.visionDraw.updateObject('marker_B', {
        position: [sceneB[0], sceneB[1] + 0.5, sceneB[2]],
        color: bJammed ? '#ff2200' : '#00aaff',
    }).promise;

    // 更新追逐连线（C → 当前目标）
    const targetScene = currentTarget === 'A' ? sceneA : sceneB;
    await socket.api.visionDraw.updateObject('chase_line', {
        position: sceneC,
        lineVec: [
            targetScene[0] - sceneC[0],
            targetScene[1] - sceneC[1],
            targetScene[2] - sceneC[2],
        ],
        color: '#ff4400',
    }).promise;
}

// ── 事件标记 ─────────────────────────────────────────────────────────────────

export async function markEvent(
    eventId: string,
    position: [number, number, number],
    type: GameEvent['type'],
): Promise<void> {
    const color =
        type === 'jammed_A' ? '#ffaa00' :
            type === 'jammed_B' ? '#ff6600' :
                '#ff0000'; // game_over

    await socket.api.visionDraw.createObject({
        type: 'cube', name: eventId, id: eventId,
        groupId: 'group_events',
        size: [5, 5, 5],
        position: xyz2area(position),
        color,
        opacity: 0.15,
        enable: true,
        showTimeout: 8000,
    }).promise;
}

