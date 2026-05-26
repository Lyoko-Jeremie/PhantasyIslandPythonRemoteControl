import type {RadioRelaySocketClient} from '../client';
import {ViewMaterialChangeCommand, ViewMaterialChangeCommandSimple} from '../../TypeDefViewCommand';

export class Scene {
    constructor(private client: RadioRelaySocketClient) {
    }

    TableName = 'scene';

    getInitState() {
        return this.client._sendMessage({cmd: `${this.TableName}.getInitState`});
    }

    listAllMeshObjectInScene() {
        return this.client._sendMessage<{
            allMeshObjectInScene: {
                id: string,
                name: string,
                position: [number, number, number],
                radioMaterial: [string | undefined, number | undefined] | undefined,
            }[]
        }>({
            cmd: `${this.TableName}.listAllMeshObjectInScene`,
        });
    }

    getObjectInfoById(objectId: string) {
        return this.client._sendMessage<{ info?: any }>({cmd: `${this.TableName}.getObjectInfoById`, objectId});
    }

    removeObjectById(objectId: string) {
        return this.client._sendMessage<{ result: boolean }>({cmd: `${this.TableName}.removeObjectById`, objectId});
    }

    setObjectRadioMaterial(objectId: string, materialId?: string, thickness_m?: number) {
        return this.client._sendMessage<{ result: boolean }>({
            cmd: `${this.TableName}.setObjectRadioMaterial`,
            objectId,
            materialId,
            thickness_m
        });
    }

    updateMeshViewMaterial(objectId: string, viewMaterialChangeCommand: ViewMaterialChangeCommand) {
        return this.client._sendMessage<{ result: boolean }>({
            cmd: `${this.TableName}.updateMeshViewMaterial`,
            objectId,
            viewMaterialChangeCommand
        });
    }

    updateMeshViewMaterialSimple(objectId: string, viewMaterialChangeCommandSimple: ViewMaterialChangeCommandSimple) {
        return this.client._sendMessage<{ result: boolean }>({
            cmd: `${this.TableName}.updateMeshViewMaterialSimple`,
            objectId,
            viewMaterialChangeCommandSimple
        });
    }

}
