import {getAirplaneCameraImage} from './httpLayer';
import {readB64Img} from './imageProcess';
import {ImageReceiver} from './imageReceiverMook';

export interface AirplaneFlyStatus {
    landing: boolean;
    isStop: boolean;
    x: number;
    y: number;
    h: number;
    rX: number;
    rY: number;
    rZ: number;
}

export function makeAirplaneFlyStatus(flyStatus: any): AirplaneFlyStatus {
    return {
        landing: flyStatus.landing,
        isStop: flyStatus.isStop,
        x: flyStatus.x,
        y: flyStatus.y,
        h: flyStatus.h,
        rX: flyStatus.rX,
        rY: flyStatus.rY,
        rZ: flyStatus.rZ,
    };
}

export class AirplaneCore {
    keyName: string;
    typeName: string;
    updateTimestamp: number;
    status: AirplaneFlyStatus;
    cameraFront: string | null;
    cameraDown: string | null;
    imageReceiver: ImageReceiver;

    constructor(
        keyName: string,
        typeName: string,
        updateTimestamp: number,
        status: AirplaneFlyStatus,
        cameraFront: string | null = null,
        cameraDown: string | null = null
    ) {
        this.keyName = keyName;
        this.typeName = typeName;
        this.updateTimestamp = updateTimestamp;
        this.status = status;
        this.cameraFront = cameraFront;
        this.cameraDown = cameraDown;

        this.imageReceiver = new ImageReceiver(this);
    }

    capImage(
        userReceiveCallback?: (image: Buffer) => void,
        userProgressCallback?: (progress: number, total: number) => void
    ) {
        if (this.imageReceiver) {
            this.imageReceiver.sendCapImage(userReceiveCallback, userProgressCallback);
        }
    }

    getImageTransferProgress() {
        return this.imageReceiver ? this.imageReceiver.getTransferProgress() : 0;
    }

    isImageTransferInProgress() {
        return this.imageReceiver ? this.imageReceiver.isTransferInProgress() : false;
    }

    getLatestImage() {
        return this.imageReceiver ? this.imageReceiver.getLatestImage() : null;
    }

    async getCameraFrontImg() {
        const b64 = await getAirplaneCameraImage(this.keyName, 'front');
        return readB64Img(b64);
    }

    async getCameraDownImg() {
        const b64 = await getAirplaneCameraImage(this.keyName, 'down');
        return readB64Img(b64);
    }
}
