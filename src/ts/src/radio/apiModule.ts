import {WaitToken} from './waitToken';

/**
 * API 模块基类。
 */

export type SendMode = 'sync' | 'async' | 'token';

export type SendResult<T> = Promise<T | null> | WaitToken<T>;

export class ApiModule {
    protected _rm: any; // RadioManager
    protected _nowMode: SendMode = 'sync';

    constructor(rm: any) {
        this._rm = rm;
    }

    mode(m: SendMode): this {
        this._nowMode = m;
        return this;
    }

    getNowMode(): SendMode {
        return this._nowMode;
    }

    /**
     * 底层发送并等待响应的统一入口。
     * 根据当前 _nowMode 决定行为。
     */
    protected send<T = any>(
        cmd: string,
        data: any = null,
        waitCmd: string | null = null,
        timeout: number = 3000,
        postProcessor?: (data: any) => T
    ): SendResult<T> {
        if (this._nowMode === 'token') {
            const token = this._rm._sendAndWaitToken(cmd, data, waitCmd, postProcessor);
            return token as WaitToken<T>;
        } else if (this._nowMode === 'async') {
            return this._rm._sendAndWaitAsync(cmd, data, waitCmd, timeout, postProcessor);
        } else {
            // sync 模式在 TS 中也是返回 Promise，因为 IO 始终是异步的
            return this._rm._sendAndWaitAsync(cmd, data, waitCmd, timeout, postProcessor);
        }
    }

    protected _send(cmd: string, data: any = null): void {
        this._rm._send(cmd, data);
    }
}

// 窄化工具函数
export function asToken<T>(result: SendResult<T>): WaitToken<T> {
    if (result instanceof WaitToken) {
        return result;
    }
    throw new Error("Expected WaitToken, but got Promise. Did you forget to call mode('token')?");
}

export async function asAsync<T>(result: SendResult<T>): Promise<T | null> {
    if (result instanceof Promise) {
        return result;
    }
    return result.wait();
}
