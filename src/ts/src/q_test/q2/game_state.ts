// ===== q2 共享游戏状态（捉迷藏对抗） =====
//
// Node.js 模块缓存机制保证同进程内多次 import 总是拿到同一个对象引用，
// 因此 gameState 可安全地作为跨模块的单例可变状态来使用。

export interface Q2GameState {
    /** 蓝方 A（blue_drone_1）当前位置
     *  格式：posXYH2arrayXYZ([x, h, y])，单位 cm；null = 尚未获取 */
    posA: [number, number, number] | null;

    /** 蓝方 B（blue_drone_2）当前位置，格式同 posA */
    posB: [number, number, number] | null;

    /** 红方 C（red_jammer）当前位置，格式同 posA */
    posC: [number, number, number] | null;

    /**
     * A 被干扰悬停的截止时刻（Date.now() + JAM_DURATION_MS）。
     * **0 表示当前未被干扰**（干扰到期后裁判会显式归零）。
     */
    jammedAUntil: number;

    /**
     * B 被干扰悬停的截止时刻，含义同 jammedAUntil。
     */
    jammedBUntil: number;

    /**
     * A 恢复自由后的保护期截止时刻。
     * 在此时刻之前 C 不会重新触发对 A 的干扰，防止 C 路过 A 悬停位置时立即重干扰。
     * 0 表示无保护期。
     */
    jamRecoveryAUntil: number;

    /**
     * B 恢复自由后的保护期截止时刻，含义同 jamRecoveryAUntil。
     */
    jamRecoveryBUntil: number;

    /**
     * 红方 C 当前追踪的目标（由裁判模块在干扰事件后切换）。
     * 初始值 'A'，每次成功干扰后切换到另一架。
     */
    currentTarget: 'A' | 'B';

    /**
     * 游戏是否已结束（AB 同时处于被干扰悬停状态时置 true）。
     * 所有控制器循环收到此标志后应安全退出。
     */
    gameOver: boolean;

    /** 游戏整体启动时间戳（Date.now()） */
    startTime: number;

    /** A 累计被干扰次数 */
    jamCountA: number;

    /** B 累计被干扰次数 */
    jamCountB: number;
}

export const gameState: Q2GameState = {
    posA: null,
    posB: null,
    posC: null,
    jammedAUntil: 0,
    jammedBUntil: 0,
    jamRecoveryAUntil: 0,
    jamRecoveryBUntil: 0,
    currentTarget: 'A',
    gameOver: false,
    startTime: Date.now(),
    jamCountA: 0,
    jamCountB: 0,
};

