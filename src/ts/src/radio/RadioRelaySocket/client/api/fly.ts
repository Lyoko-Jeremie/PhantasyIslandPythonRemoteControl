import type {RadioRelaySocketClient} from '../client';
import {JoyStickInput} from '../../TypeDef';
import {FlyCmd} from '../../TypeDefFlyCmd';
import JSON5 from 'json5';

export interface FlyObjectInfo {
    keyName: string;
    typeName: string;
    XYH: {
        h: number,
        x: number,
        y: number,
        rX: number,
        rY: number,
        rZ: number,
    };
    XYHR_areaScale: {
        h: number,
        x: number,
        y: number,
        rX: number,
        rY: number,
        rZ: number,
    };
    isStop: boolean;
    isTakingOff: boolean;
    isLanding: boolean;
}

export class Fly {
    constructor(private client: RadioRelaySocketClient) {
    }

    TableName = 'fly';

    listFlyObject() {
        return this.client._sendMessage<{
            flyObjectList: FlyObjectInfo[],
        }>({cmd: `${this.TableName}.listFlyObject`});
    }

    getFlyObjectInfo(keyName: string) {
        return this.client._sendMessage<{
            flyObjectInfo: FlyObjectInfo,
        }>({cmd: `${this.TableName}.getFlyObjectInfo`, keyName});
    }

    getFlyObjectCameraImageDown(keyName: string) {
        return this.client._sendMessage<{
            imageData: string,
        }>({cmd: `${this.TableName}.getFlyObjectCameraImageDown`, keyName});
    }

    getFlyObjectCameraImageFront(keyName: string) {
        return this.client._sendMessage<{
            imageData: string,
        }>({cmd: `${this.TableName}.getFlyObjectCameraImageFront`, keyName});
    }

    setJoyStickInput(keyName: string, input: JoyStickInput) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.setJoyStickInput`, keyName, input});
    }

    flyCmd(keyName: string, flyCmd: FlyCmd) {
        console.log('flyCmd', keyName, JSON5.stringify(flyCmd));
        if (flyCmd.cmd === 'goto') {
            if (flyCmd.x > 10 * 100 || flyCmd.y > 10 * 100 || flyCmd.h > 10 * 100) {
                console.trace('flyCmd goto out of range', flyCmd);
            }
        }
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.flyCmd`, keyName, flyCmd});
    }
}
