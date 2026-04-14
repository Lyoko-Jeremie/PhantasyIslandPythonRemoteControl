import {WaitToken} from './waitToken';
import {DebugApi} from './apiDebug';
import {SceneApi} from './apiScene';
import {FlyApi} from './apiFly';
import {RadioApi} from './apiRadio';

// 假设使用 socket.io-client
// import { io, Socket } from 'socket.io-client';

export class RadioManager {
    socketio: any; // Socket
    namespace: string = '/UserSide';
    sceneIsInit: boolean = false;

    // ---- Sub-API 模块 ----
    debugApi: DebugApi;
    sceneApi: SceneApi;
    flyApi: FlyApi;
    radioApi: RadioApi;

    // waitCmd -> Array<{ref: WeakRef<WaitToken>, id: number}>
    // 注意：TS/JS 的 WeakRef 需要环境支持
    private _pendingWaiters: Map<string, Array<{ ref: any, id: number }>> = new Map();

    constructor() {
        this.debugApi = new DebugApi(this);
        this.sceneApi = new SceneApi(this);
        this.flyApi = new FlyApi(this);
        this.radioApi = new RadioApi(this);
    }

    createMsgTimestampId(): number {
        return Math.floor(Date.now() * 100);
    }

    async connect(url: string = 'http://127.0.0.1:60002', namespace: string = '/UserSide'): Promise<void> {
        this.namespace = namespace;
        this.reset();

        // 模拟 socket.io 连接逻辑
        // this.socketio = io(`${url}${namespace}`, { reconnection: true });
        // this._initListener();

        return new Promise((resolve) => {
            // 假设连接成功
            console.log('[RadioManager] Connecting to', url, namespace);
            setTimeout(() => {
                this.sceneIsInit = true;
                resolve();
            }, 100);
        });
    }

    reset() {
        if (this.socketio) {
            this.socketio.disconnect();
        }
        this.sceneIsInit = false;
    }

    private _initListener() {
        this.socketio.on('connect', () => {
            console.log('[RadioManager] connected');
            this._checkSceneStatus();
        });

        this.socketio.on('disconnect', () => {
            console.log('[RadioManager] disconnected');
            this.sceneIsInit = false;
        });

        this.socketio.on('message', (data: any) => {
            console.log(`[RadioManager] message:`, data);
            this.msgDispatch(data);
        });
    }

    private _checkSceneStatus() {
        this._send('ping');
        this._send('scene.getInitState');
    }

    _send(cmd: string, data: any = null) {
        const msg = {cmd, ...data};
        if (this.socketio) {
            this.socketio.emit('message', msg);
        } else {
            console.warn('[RadioManager] socket not connected, cannot send:', msg);
        }
    }

    // ---- 请求-响应: 核心 ----

    _sendAndWaitToken(
        cmd: string,
        data: any = null,
        waitCmd: string | null = null,
        postProcessor?: (data: any) => any
    ): WaitToken {
        const finalWaitCmd = waitCmd || cmd;
        const timeBaseId = this.createMsgTimestampId();
        const token = new WaitToken(finalWaitCmd, timeBaseId);

        if (postProcessor) {
            token.setPostProcessor(postProcessor);
        }

        // 注册等待者
        let waiters = this._pendingWaiters.get(finalWaitCmd);
        if (!waiters) {
            waiters = [];
            this._pendingWaiters.set(finalWaitCmd, waiters);
        }

        // 在 JS 中使用简单的强引用或 WeakRef
        // 为了简单起见，这里直接存引用
        waiters.push({ref: token, id: timeBaseId});

        const msg = {
            timestampIdPython: timeBaseId,
            ...data
        };

        // 过滤掉 null
        const filteredMsg: any = {};
        for (const [k, v] of Object.entries(msg)) {
            if (v !== null) filteredMsg[k] = v;
        }

        this._send(cmd, filteredMsg);
        return token;
    }

    async _sendAndWaitAsync(
        cmd: string,
        data: any = null,
        waitCmd: string | null = null,
        timeoutMs: number = 3000,
        postProcessor?: (data: any) => any
    ): Promise<any> {
        const token = this._sendAndWaitToken(cmd, data, waitCmd, postProcessor);
        try {
            return await token.wait(timeoutMs);
        } catch (e) {
            return null;
        }
    }

    // ---- 分发 ----

    private _notifyWaiters(cmd: string, data: any): boolean {
        const timestampId = data.timestampIdPython;
        const waiters = this._pendingWaiters.get(cmd);
        if (!waiters) return false;

        let matched = false;
        const surviving: Array<{ ref: any, id: number }> = [];

        for (const waiter of waiters) {
            const token = waiter.ref;
            if (token && timestampId !== undefined && waiter.id === timestampId) {
                token.complete(data);
                matched = true;
            } else {
                surviving.push(waiter);
            }
        }

        if (surviving.length > 0) {
            this._pendingWaiters.set(cmd, surviving);
        } else {
            this._pendingWaiters.delete(cmd);
        }

        return matched;
    }

    msgDispatch(data: any) {
        const cmd = data.cmd;
        if (!cmd) {
            console.error('[RadioManager] received message without cmd:', data);
            return;
        }

        if (this._notifyWaiters(cmd, data)) {
            return;
        }

        switch (cmd) {
            case 'pong':
                break;
            case 'sceneReset':
            case 'sceneNotInit':
                this.sceneIsInit = false;
                break;
            case 'sceneInit':
            case 'sceneIsInit':
                this.sceneIsInit = true;
                break;
            default:
                console.log(`[RadioManager] unknown cmd: ${cmd}`, data);
        }
    }
}
