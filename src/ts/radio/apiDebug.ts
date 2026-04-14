import {ApiModule, SendResult} from './apiModule';

export class DebugApi extends ApiModule {
    /**
     * Ping 远端，等待 pong 回复。
     */
    ping(): SendResult<any> {
        return this.send('ping', null, 'pong');
    }
}
