// ===== q2 主程序入口（捉迷藏对抗仿真） =====
//
// 整体运行流程：
//
//   main()
//   ├── initVisualization()              // 创建追逐线、干扰球、状态标记
//   ├── blueDroneLoop()                  // 蓝方 A/B 逃跑控制（并行）
//   ├── redJammerLoop()                  // 红方 C 追逐控制（并行，5s 后激活）
//   └── loop (5 Hz):
//       ├── judgeRound()                 // 裁判判定 → 更新 gameState 干扰状态
//       ├── updateVisualization(...)     // 可视化同步
//       ├── markEvent(...)               // 干扰事件放置标记
//       └── gameState.gameOver → exit()  // 游戏结束时退出

import {initVisualization, updateVisualization, markEvent} from './visualizer';
import {blueDroneLoop} from './blue_drone_controller';
import {redJammerLoop} from './red_jammer_controller';
import {judgeRound, eventLog} from './referee';
import {gameState} from './game_state';

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/** 裁判刷新间隔（ms）→ 5 Hz */
const JUDGE_INTERVAL_MS = 200;

/** Ctrl+C 或游戏结束后，可视化继续同步的缓冲时长（ms） */
const GRACEFUL_DRAIN_MS = 2000;

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   PhantasyIsland q2 — 捉迷藏无人机对抗仿真           ║');
    console.log('║   蓝方 A(150cm) + B(250cm) 逃跑  vs  红方 C(350cm) 追逐 ║');
    console.log('║   边界：X/Y 均在 [0,1000] cm 内                      ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');

    // ── 步骤 1：初始化可视化 ────────────────────────────────────────────────
    try {
        await initVisualization();
        console.log('[MAIN] 可视化初始化完成');
    } catch (e) {
        console.error('[MAIN] 可视化初始化失败，继续运行（可视化不可用）:', e);
    }

    // ── 共享停止信号 ────────────────────────────────────────────────────────
    const stopSignal = {stopped: false};

    // ── SIGINT 处理：停止控制器，保留裁判+可视化再跑 GRACEFUL_DRAIN_MS ────
    process.once('SIGINT', async () => {
        console.log('\n[MAIN] 收到 Ctrl+C，停止控制器循环，等待可视化同步...');
        stopSignal.stopped = true;
        await sleep(GRACEFUL_DRAIN_MS);
        console.log('[MAIN] 退出');
        process.exit(0);
    });

    // ── 步骤 2：启动蓝方逃跑循环（并行） ───────────────────────────────────
    blueDroneLoop(stopSignal).catch(e => console.error('[MAIN] blueDroneLoop 异常:', e));
    console.log('[MAIN] 蓝方 A/B 逃跑控制循环已启动');

    // ── 步骤 3：启动红方追逐循环（并行，内部等待 5s 后激活） ────────────────
    redJammerLoop(stopSignal).catch(e => console.error('[MAIN] redJammerLoop 异常:', e));
    console.log('[MAIN] 红方 C 追逐控制循环已启动（5s 后激活）');

    // ── 步骤 4：裁判判定 + 可视化更新主循环（5 Hz）─────────────────────────
    let eventLogCursor = 0;
    console.log('[MAIN] 裁判主循环启动（5 Hz）');

    while (true) {
        try {
            const state = await judgeRound();

            if (state) {
                const {posA, posB, posC} = state;
                const now = Date.now();

                // 4a. 可视化同步
                try {
                    await updateVisualization(
                        posA, posB, posC,
                        gameState.jammedAUntil > now,
                        gameState.jammedBUntil > now,
                        gameState.currentTarget,
                    );
                } catch (e) {
                    console.warn('[MAIN] updateVisualization 失败:', e);
                }

                // 4b. 处理新产生的裁判事件，在场景中放置标记
                while (eventLogCursor < eventLog.length) {
                    const evt = eventLog[eventLogCursor++]!;
                    try {
                        await markEvent(
                            `event_${evt.timestamp}_${eventLogCursor}`,
                            evt.position,
                            evt.type,
                        );
                    } catch (e) {
                        console.warn('[MAIN] markEvent 失败:', e);
                    }
                }

                // 4c. 检测游戏结束
                if (gameState.gameOver) {
                    console.log('[MAIN] 游戏结束，等待可视化同步后退出...');
                    stopSignal.stopped = true;
                    await sleep(GRACEFUL_DRAIN_MS);
                    console.log('[MAIN] 程序退出');
                    process.exit(0);
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

