import {AirplaneCore} from './airplaneCore';

export interface ImageInfo {
    img: string | null;
    id: number;
    totalCount: number;
    progressCount: number;
    ok: boolean;
}

export class ImageReceiver {
    airplane: AirplaneCore;
    imageInstance: ImageInfo | null = null;
    private _cmdIdCounter: number = 1;
    nowLoadingId: number = 0;

    userReceiveCallback?: (img: any) => void;
    userProgressCallback?: (progress: number, total: number) => void;

    mookTime = 3;

    constructor(airplane: AirplaneCore) {
        this.airplane = airplane;
    }

    async sendCapImage(
        userReceiveCallback?: (img: any) => void,
        userProgressCallback?: (progress: number, total: number) => void
    ) {
        this.userReceiveCallback = userReceiveCallback;
        this.userProgressCallback = userProgressCallback;

        this._cmdIdCounter++;
        this.nowLoadingId = this._cmdIdCounter;

        const img = await this.airplane.getCameraDownImg();

        this.imageInstance = {
            img: img,
            id: this._cmdIdCounter,
            totalCount: this.mookTime * 100,
            progressCount: 0,
            ok: false
        };

        const simulateLoading = async () => {
            const instance = this.imageInstance!;
            while (instance.progressCount < instance.totalCount) {
                await new Promise(resolve => setTimeout(resolve, 10));

                if (instance.id !== this.nowLoadingId) {
                    break;
                }

                instance.progressCount++;
                if (this.userProgressCallback) {
                    this.userProgressCallback(instance.progressCount, instance.totalCount);
                }
            }

            if (instance.id === this.nowLoadingId) {
                instance.ok = true;
                if (this.userReceiveCallback) {
                    this.userReceiveCallback(instance.img);
                }
            }
        };

        simulateLoading();
    }

    getLatestImage() {
        if (this.imageInstance && this.imageInstance.ok) {
            return this.imageInstance.img;
        }
        return null;
    }

    getTransferProgress() {
        return this.imageInstance ? this.imageInstance.progressCount : null;
    }

    isTransferInProgress() {
        return this.imageInstance ? !this.imageInstance.ok : false;
    }
}
