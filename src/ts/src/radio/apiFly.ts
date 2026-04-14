import {ApiModule, type SendResult} from './apiModule';

export class FlyApi extends ApiModule {
    listFlyObject(): SendResult<any> {
        return this.send('fly.listFlyObject');
    }

    getFlyObjectInfo(keyName: string): SendResult<any> {
        return this.send('fly.getFlyObjectInfo', {keyName});
    }

    getFlyObjectCameraImageDown(keyName: string): SendResult<any> {
        return this.send('fly.getFlyObjectCameraImageDown', {keyName});
    }

    getFlyObjectCameraImageFront(keyName: string): SendResult<any> {
        return this.send('fly.getFlyObjectCameraImageFront', {keyName});
    }
}
