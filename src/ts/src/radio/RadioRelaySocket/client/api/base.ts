import type {RadioRelaySocketClient} from '../client';

export class Base {
    constructor(private client: RadioRelaySocketClient) {
    }

    listApi() {
        return this.client._sendMessage<{ apiList: string[], }>({cmd: 'base.listApi'});
    }

    ping() {
        return this.client._sendMessage({cmd: 'base.ping'});
    }
}
