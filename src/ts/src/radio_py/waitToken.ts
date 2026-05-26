/**
 * 轻量级的请求-响应等待令牌。
 */

export class WaitToken<T = any> {
    waitCmd: string;
    timeBaseId: number;
    response: T | null = null;
    processedResponse: any = null;

    private _resolve?: (value: any) => void;
    private _reject?: (reason?: any) => void;
    private _promise: Promise<any>;
    private _done: boolean = false;
    private _postProcessor?: (data: T) => any;

    constructor(waitCmd: string, timeBaseId: number) {
        this.waitCmd = waitCmd;
        this.timeBaseId = timeBaseId;
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    get done(): boolean {
        return this._done;
    }

    setPostProcessor(processor: (data: T) => any): WaitToken<T> {
        this._postProcessor = processor;
        return this;
    }

    private _applyPostProcessor(data: T): any {
        if (this._postProcessor) {
            this.processedResponse = this._postProcessor(data);
        } else {
            this.processedResponse = data;
        }
        return this.processedResponse;
    }

    complete(data: T): void {
        this.response = data;
        const result = this._applyPostProcessor(data);
        this._done = true;
        if (this._resolve) {
            this._resolve(result);
        }
    }

    async wait(timeoutMs: number = 3000): Promise<any> {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('WaitToken Timeout')), timeoutMs);
        });
        return Promise.race([this._promise, timeoutPromise]);
    }

    // 使其支持 await token
    then<TResult1 = any, TResult2 = never>(
        onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2> {
        return this._promise.then(onfulfilled, onrejected);
    }
}
