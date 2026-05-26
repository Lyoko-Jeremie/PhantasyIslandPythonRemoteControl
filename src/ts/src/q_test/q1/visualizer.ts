// ===== 可视化模块示例 =====

// 初始化：创建可视化对象
import {socket} from './client';
import {RadioEvent} from './referee';
import {xyz2area} from './tool';

export async function initVisualization() {
    // visionDraw.createGroup(groupId, paramsList) — 两个位置参数，.promise 取响应

    // 1. 蓝方 A↔B 通信链路连线
    await socket.api.visionDraw.createGroup(
        'group_blue_links',
        [
            {
                type: 'line', name: 'link_AB', id: 'link_AB',
                lineVec: [0, 0, 20], // 初始方向占位，后续 updateObject 实时更新
                lineRadius: 0.1,
                position: [0, 0, 0],
                color: '#00ff00', opacity: 0.8,
            },
        ],
    ).promise;

    // 2. 干扰区球体（半透明红色，radius 与 JammerArea 半径 15m 一致）
    await socket.api.visionDraw.createGroup(
        'group_jammer_area',
        [
            {
                type: 'sphere', name: 'jammer_sphere', id: 'jammer_sphere',
                radius: 15,
                position: xyz2area([300, 100, 200]),
                color: '#ff2200', opacity: 0.1,
            },
        ],
    ).promise;
}

// 每帧更新可视化
export async function updateVisualization(
    posA: [number, number, number],
    posB: [number, number, number],
    posJ: [number, number, number],
    linkStatus: 'ok' | 'jammed' | 'blocked',
) {
    // 将原始游戏坐标（cm）转换为 Three.js 场景坐标（/10，Z 轴取反）
    const sceneA = xyz2area(posA);
    const sceneB = xyz2area(posB);
    const sceneJ = xyz2area(posJ);

    // visionDraw.setObjectPosition(id, position) — 两个位置参数
    await socket.api.visionDraw.setObjectPosition('jammer_sphere', sceneJ).promise;

    // visionDraw.updateObject(id, params) — 两个位置参数
    const lineColor =
        linkStatus === 'ok' ? '#00ff00' :
            linkStatus === 'jammed' ? '#ffaa00' : '#ff0000';
    await socket.api.visionDraw.updateObject(
        'link_AB',
        {
            position: sceneA,
            lineVec: [sceneB[0] - sceneA[0], sceneB[1] - sceneA[1], sceneB[2] - sceneA[2]],
            color: lineColor,
        },
    ).promise;
}

// 事件发生时在现场放置标记
export async function markEvent(
    eventId: string,
    position: [number, number, number],
    type: RadioEvent['type'],
) {
    const color =
        type === 'comm_blocked' ? '#ff0000' :
            type === 'jammed' ? '#ff8800' :
                type === 'entered_restricted' ? '#0088ff' : '#ffffff';

    // visionDraw.createObject(params) — 单个 params 对象，id/groupId 内嵌其中
    await socket.api.visionDraw.createObject({
        type: 'cube', name: eventId, id: eventId,
        groupId: 'group_events',
        size: [3, 3, 3],
        position,
        color,
        opacity: 0.1,
        enable: true,
        showTimeout: 500,
    }).promise;
}
