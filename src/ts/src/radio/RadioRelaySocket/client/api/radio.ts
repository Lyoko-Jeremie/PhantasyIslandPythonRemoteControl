import type {RadioRelaySocketClient} from '../client';
import {CheckReachabilityShowConfigExtend, RadioCheckOptions, RadioCheckResult} from '../../../RadioTypes';
import {RadioMaterialProperties} from '../../../RadioMaterialDatabase';
import {isArray} from 'lodash';
import {RadioReachabilityShowConfig} from '../../../RadioReachabilityShow';

export class Radio {
    constructor(private client: RadioRelaySocketClient) {
    }

    TableName = 'radio';

    isSceneInit() {
        return this.client._sendMessage<{
            init: boolean,
        }>({cmd: `${this.TableName}.isSceneInit`});
    }

    isRadioReachabilityCheckerInit() {
        return this.client._sendMessage<{
            init: boolean,
        }>({cmd: `${this.TableName}.isRadioReachabilityCheckerInit`});
    }

    checkReachability(
        aTx: [number, number, number],
        bRx: [number, number, number],
        options?: RadioCheckOptions,
        configRadioReachabilityShow?: (RadioReachabilityShowConfig & CheckReachabilityShowConfigExtend),
    ) {
        if (!isArray(aTx) || (aTx.length !== 3)) {
            throw new Error(
                `aTx must be a array of length 3, but got ${aTx}`
            );
        }
        if (!isArray(bRx) || (bRx.length !== 3)) {
            throw new Error(
                `bRx must be a array of length 3, but got ${bRx}`
            );
        }
        return this.client._sendMessage<{
            aTx: [number, number, number],
            bRx: [number, number, number],
            options: RadioCheckOptions,
            result: RadioCheckResult,
        }>({cmd: `${this.TableName}.checkReachability`, aTx, bRx, options, configRadioReachabilityShow});
    }

    updateObjectPos(objectId: string, position: [number, number, number]) {
        if (!isArray(position) || (position.length !== 3)) {
            throw new Error(
                `position must be a array of length 3, but got ${position}`
            );
        }
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.updateObjectPos`, objectId, position});
    }

    getObjectPos(objectId: string) {
        return this.client._sendMessage<{
            position: [number, number, number],
        }>({cmd: `${this.TableName}.getObjectPos`, objectId});
    }

    updateMeshRadioMaterial(meshId: string, materialId: string, thickness_m: number) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.updateMeshRadioMaterial`, meshId, materialId, thickness_m});
    }

    getAllRadioMaterial() {
        return this.client._sendMessage<{
            meshIds: RadioMaterialProperties[],
        }>({cmd: `${this.TableName}.getAllRadioMaterial`});
    }

    localRadioMaterial() {
        return this.client._sendMessage<{
            meshIds: RadioMaterialProperties[],
        }>({cmd: `${this.TableName}.localRadioMaterial`});
    }

    getBuildingRadioMaterial() {
        return this.client._sendMessage<{
            meshIds: RadioMaterialProperties[],
        }>({cmd: `${this.TableName}.getBuildingRadioMaterial`});
    }

    addRadioMaterial(material: RadioMaterialProperties) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.addRadioMaterial`, ...material});
    }

    listRadioLocalObjects() {
        return this.client._sendMessage<{
            localObjectIds: string[],
        }>({cmd: `${this.TableName}.listRadioLocalObjects`});
    }
}

