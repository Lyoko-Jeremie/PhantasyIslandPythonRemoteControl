/**
 * 轻量级的请求-响应等待令牌。
 */
export class WaitToken<T> {
    public waitCmd: string;
    public timeBaseId: number;
    public response: any = null;
    public processedResponse: T | null = null;

    private _resolve: ((value: T | null) => void) | null = null;
    private _reject: ((reason?: any) => void) | null = null;
    private _promise: Promise<T | null>;
    private _postProcessor: ((data: any) => T) | null = null;
    private _done: boolean = false;

    constructor(waitCmd: string, timeBaseId: number) {
        this.waitCmd = waitCmd;
        this.timeBaseId = timeBaseId;
        this._promise = new Promise<T | null>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    /**
     * 令牌是否已收到响应。
     */
    get done(): boolean {
        return this._done;
    }

    /**
     * 注册后处理回调。
     */
    setPostProcessor(processor: (data: any) => T): this {
        this._postProcessor = processor;
        return this;
    }

    private _applyPostProcessor(data: any): T {
        if (this._postProcessor) {
            this.processedResponse = this._postProcessor(data);
        } else {
            this.processedResponse = data as unknown as T;
        }
        return this.processedResponse!;
    }

    /**
     * 填充响应并唤醒等待者。
     */
    complete(data: any): void {
        this.response = data;
        const result = this._applyPostProcessor(data);
        this._done = true;
        if (this._resolve) {
            this._resolve(result);
        }
    }

    /**
     * 异步等待直到收到响应或超时。
     * 注意：在 TS 中，由于单线程特性，wait 通常是异步的。
     */
    async wait(timeoutMs: number = 3000): Promise<T | null> {
        if (this._done) return this.processedResponse;

        return Promise.race([
            this._promise,
            new Promise<T | null>((resolve) => {
                setTimeout(() => resolve(null), timeoutMs);
            })
        ]);
    }

    /**
     * 支持 await token 直接调用。
     */
    then<TResult1 = T | null, TResult2 = never>(
        onfulfilled?: ((value: T | null) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }
}
