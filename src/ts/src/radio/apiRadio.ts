import {ApiModule, type SendResult} from './apiModule';
import type {XYZ, RadioCheckOptions, RadioMaterialProperties} from './typeDef';

export class RadioApi extends ApiModule {
    isSceneInit(): SendResult<boolean> {
        return this.send('radio.isSceneInit', null, null, 3000, d => d.init);
    }

    isRadioReachabilityCheckerInit(): SendResult<boolean> {
        return this.send('radio.isRadioReachabilityCheckerInit', null, null, 3000, d => d.init);
    }

    checkReachability(aTx: XYZ, bRx: XYZ, options?: RadioCheckOptions): SendResult<any> {
        return this.send('radio.checkReachability', {
            aTx,
            bRx,
            options
        });
    }

    updateObjectPos(objectId: string, position: XYZ): SendResult<any> {
        return this.send('radio.updateObjectPos', {
            objectId,
            position
        });
    }

    getObjectPos(objectId: string): SendResult<XYZ> {
        return this.send('radio.updateObjectPos', {
            objectId
        }, null, 3000, d => d.position);
    }

    updateMeshRadioMaterial(meshId: string, materialId?: string, thickness_m?: number): SendResult<any> {
        return this.send('radio.updateMeshRadioMaterial', {
            meshId,
            materialId,
            thickness_m
        });
    }

    getAllRadioMaterial(): SendResult<RadioMaterialProperties[]> {
        return this.send('radio.getAllRadioMaterial', null, null, 3000, d => d.meshIds);
    }

    localRadioMaterial(): SendResult<RadioMaterialProperties[]> {
        return this.send('radio.localRadioMaterial', null, null, 3000, d => d.meshIds);
    }

    getBuildingRadioMaterial(): SendResult<any> {
        return this.send('radio.getBuildingRadioMaterial');
    }

    addRadioMaterial(material: RadioMaterialProperties): SendResult<any> {
        return this.send('radio.addRadioMaterial', material);
    }

    listRadioLocalObjectsIds(): SendResult<string[]> {
        return this.send('radio.listRadioLocalObjects', null, null, 3000, d => d.localObjectIds);
    }
}
