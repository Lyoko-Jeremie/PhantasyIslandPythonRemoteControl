import {ApiModule, SendResult} from './apiModule';
import {ViewMaterialChangeCommand, ViewMaterialChangeCommandSimple} from './typeDefView';
import {XYZ} from './typeDef';

export class SceneApi extends ApiModule {
    listAllMeshObjectInScene(): SendResult<any> {
        return this.send('scene.listAllMeshObjectInScene');
    }

    getObjectInfoById(objectId: string): SendResult<any> {
        return this.send('scene.getObjectInfoById', {objectId});
    }

    removeObjectById(objectId: string): SendResult<any> {
        return this.send('scene.removeObjectById', {objectId});
    }

    moveObjectById(objectId: string, position: XYZ): SendResult<any> {
        return this.send('scene.moveObjectById', {
            objectId,
            position
        });
    }

    setObjectRadioMaterial(objectId: string, materialId?: string, thickness_m?: number): SendResult<any> {
        return this.send('scene.setObjectRadioMaterial', {
            objectId,
            materialId,
            thickness_m
        });
    }

    updateMeshViewMaterial(meshId: string, viewMaterialChangeCommand: ViewMaterialChangeCommand): SendResult<any> {
        return this.send('scene.updateMeshViewMaterial', {
            meshId,
            viewMaterialChangeCommand
        });
    }

    updateMeshViewMaterialSimple(meshId: string, viewMaterialChangeCommandSimple: ViewMaterialChangeCommandSimple): SendResult<any> {
        return this.send('scene.updateMeshViewMaterialSimple', {
            meshId,
            viewMaterialChangeCommandSimple
        });
    }
}
