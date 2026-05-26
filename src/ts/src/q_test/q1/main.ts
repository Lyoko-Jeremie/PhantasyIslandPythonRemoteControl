// ===== 主程序入口 =====
//
// 整体运行流程（q.md §四）：
//
//   main()
//   ├── initVisualization()            // 创建可视化分组
//   ├── blueDroneLoop()                // 蓝方自主规划（并行，不等待）
//   ├── redJammerLoop()                // 红方干扰机控制（并行，不等待）
//   └── loop (5 Hz):
//       ├── judgeRound()               // 裁判判定 → 返回位置 + 链路状态
//       └── updateVisualization(...)   // 可视化同步 + 事件标记
//

import {initVisualization, markEvent, updateVisualization} from './visualizer';
import {blueDroneLoop} from './blue_drone_controller';
import {redJammerLoop} from './red_jammer_controller';
import {eventLog, judgeRound} from './referee';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/** 裁判刷新间隔（ms）→ 5 Hz */
const JUDGE_INTERVAL_MS = 200;

/** Ctrl+C 后可视化继续同步的时长（ms） */
const GRACEFUL_DRAIN_MS = 1000;

async function main() {
    console.log('[MAIN] PhantasyIsland 无线电对抗仿真启动');

    // ── 步骤 1：初始化可视化分组 ───────────────────────────────────────────
    // 在场景中预先创建：通信连线、干扰区球体、事件标记三大分组
    try {
        await initVisualization();
        console.log('[MAIN] 可视化初始化完成');
    } catch (e) {
        console.error('[MAIN] 可视化初始化失败，继续运行（可视化将不可用）:', e);
    }

    // ── 共享停止信号（Ctrl+C 时置 true，控制器循环据此退出）────────────────
    const stopSignal = {stopped: false};

    // ── SIGINT 处理：停止控制器，保留裁判+可视化再跑 GRACEFUL_DRAIN_MS ────
    process.once('SIGINT', async () => {
        console.log('\n[MAIN] 收到 Ctrl+C，停止控制器循环，等待可视化同步...');
        stopSignal.stopped = true;
        await sleep(GRACEFUL_DRAIN_MS);
        console.log('[MAIN] 可视化同步完成，程序退出');
        process.exit(0);
    });

    // ── 步骤 2：启动蓝方自主规划循环（并行，不阻塞后续流程）───────────────
    blueDroneLoop(stopSignal).catch(e => console.error('[MAIN] blueDroneLoop 异常退出:', e));
    console.log('[MAIN] 蓝方自主规划循环已启动');

    // ── 步骤 3：启动红方干扰机控制循环（并行）───────────────────────────────
    redJammerLoop(stopSignal).catch(e => console.error('[MAIN] redJammerLoop 异常退出:', e));
    console.log('[MAIN] 红方干扰机控制循环已启动');

    // ── 步骤 4：裁判判定 + 可视化更新主循环（5 Hz）─────────────────────────
    let eventLogCursor = 0; // 记录已处理到 eventLog 的位置，避免重复标记

    console.log('[MAIN] 裁判 + 可视化主循环启动（5 Hz）');

    while (true) {
        try {
            // 4a. 裁判判定：获取各方位置、通信可达性、干扰 SNR、限制区状态
            const state = await judgeRound();

            if (state) {
                const {posA, posB, posJ, linkStatus} = state;

                // 4b. 可视化同步：更新连线颜色 + 干扰区球体位置
                try {
                    await updateVisualization(posA, posB, posJ, linkStatus);
                } catch (e) {
                    console.warn('[MAIN] updateVisualization 失败:', e);
                }

                // 4c. 将本轮新产生的裁判事件逐条在场景中放置标记方块
                while (eventLogCursor < eventLog.length) {
                    const evt = eventLog[eventLogCursor++]!;
                    try {
                        // 每个事件用唯一 ID（时间戳 + 序号）避免重复
                        await markEvent(
                            `event_${evt.timestamp}_${eventLogCursor}`,
                            evt.position,
                            evt.type,
                        );
                    } catch (e) {
                        console.warn('[MAIN] markEvent 失败:', e);
                    }
                }
            }
        } catch (e) {
            console.error('[MAIN] 裁判主循环本轮出错，跳过:', e);
        }

        await sleep(JUDGE_INTERVAL_MS);
    }
}

main().catch(e => {
    console.error('[MAIN] 主程序异常退出:', e);
    process.exit(1);
});

