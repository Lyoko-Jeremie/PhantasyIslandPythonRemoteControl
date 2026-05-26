import {io, Socket} from 'socket.io-client';
import moment from 'moment';
import {moment2Millisecond, moment2String} from '../../../Utils/MomentFormat';
import {GetPromiseWithResolvers} from '../../../Utils/GetPromiseWithResolvers';
import {isObject, isString} from 'lodash';
import json5 from 'json5';
import {v4 as uuid} from 'uuid';
import {Base} from './api/base';
import {Scene} from './api/scene';
import {Fly} from './api/fly';
import {VisionDraw} from './api/visionDraw';
import {Radio} from './api/radio';
import {RestrictedArea} from './api/restrictedArea';

export class RadioRelaySocketWaiter<ResponseT extends Record<string, any> = Record<string, any>> {
    constructor(
        public readonly id: string,
        public readonly req: Record<string, any>,
    ) {
        // to avoid unhandled rejection
        this.resolvers.promise.catch(/*empty*/);
    }

    readonly resolvers = GetPromiseWithResolvers<ResponseT>();

    get promise() {
        return this.resolvers.promise;
    }

    get finally() {
        return this.resolvers.promise.finally.bind(this.resolvers.promise);
    }
}

export interface MsgT {
    timestamp_req: number;
    timestampString_req: string;
    timestampString_req_nodeId: string;
    timestamp_req_id: string;
    timestamp: number;
    timestampString: string;
    error?: string;
}

export class RadioRelaySocketClient {
    private socket: Socket;

    private nodeId: string = uuid() + '_' + Math.floor(Math.random() * 10000);

    constructor(private remoteUrl: string = 'http://127.0.0.1:60002/UserSide') {
        this.socket = io(remoteUrl, {reconnection: true});
        this.api = {
            base: new Base(this),
            scene: new Scene(this),
            fly: new Fly(this),
            visionDraw: new VisionDraw(this),
            radio: new Radio(this),
            restrictedArea: new RestrictedArea(this),
        } as const;
        this.socket.on('message', (data) => {
            // console.log(data);
            let d;
            if (isString(data)) {
                try {
                    d = json5.parse(data);
                } catch (e) {
                    console.error('Failed to parse message:', data, e);
                    return;
                }
            } else if (isObject(data)) {
                d = data;
            } else {
                console.error('Received message in unknown format:', data);
                return;
            }
            try {
                this.dispatchMessage(d);
            } catch (e) {
                console.error('Error processing message:', d, e);
            }
        });
    }

    private dispatchMessage(data: Record<string, any>) {

        // broadcast message
        if (isString(data.cmd)) {
            switch (data.cmd) {
                case 'sceneIsInit':
                case 'sceneInit':
                    this.sceneIsInit = true;
                    break;
                case 'sceneNotInit':
                case 'sceneReset':
                    this.sceneIsInit = false;
                    break;
                default:
                    // ignore
                    break;
            }
        }

        const id = data.timestamp_req_id;
        const nodeId = data.timestampString_req_nodeId;
        if (id && nodeId) {
            if (nodeId !== this.nodeId) {
                console.warn('Received message from other node:', nodeId, data);
                // ignore
                return;
            }
            const w = this.waiters[id];
            if (w) {
                w.resolvers.resolve(data);
                return;
            } else {
                console.warn('Received response with unknown id:', id, data.cmd, data);
                return;
            }
        } else {
            console.warn('Received message without id:', data);
            return;
        }
    }

    private waiters: Record<string, RadioRelaySocketWaiter<any>> = {};

    public readonly api;

    public _sendMessage<ResponseT extends Record<string, any> = Record<string, any>>(msg: Record<string, any>) {
        const t = moment();
        const msgResponse = {} as Record<string, any>;
        msgResponse.timestamp_req = moment2Millisecond(t);
        msgResponse.timestampString_req = moment2String(t);
        msgResponse.timestampString_req_nodeId = this.nodeId;
        msgResponse.timestamp_req_id = 'id_' + msgResponse.timestamp_req + '_' + Math.floor(Math.random() * 10000);
        const q = {
            ...msgResponse,
            ...msg,
        };
        this.socket.send(q);

        const w = new RadioRelaySocketWaiter<ResponseT & MsgT>(msgResponse.timestamp_req_id, q);
        this.waiters[msgResponse.timestamp_req_id] = w;
        w.finally(() => {
            delete this.waiters[w.id];
        });
        return w;
    }

    public ping() {
        return this._sendMessage<{ cmd: 'pong' }>({
            cmd: 'ping',
        });
    }

    public listApi() {
        return this._sendMessage<{ cmd: 'listApiResult', apiList: string[], }>({
            cmd: 'listApi',
        });
    }

    sceneIsInit: boolean = false;

}
