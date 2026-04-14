import {makeAirplaneFlyStatus} from './airplaneCore';
import {AirplaneController} from './controlCommand';
import {getAllAirplaneStatus, processAirplane, ping, pingVolatile, start, startVolatile} from './httpLayer';

export class AirplaneManager {
    airplanesTable: Record<string, AirplaneController> = {};

    async ping() {
        return ping();
    }

    async pingVolatile() {
        return pingVolatile();
    }

    async start() {
        return start();
    }

    async startVolatile() {
        return startVolatile();
    }

    getAirplane(id: string): AirplaneController | undefined {
        return this.airplanesTable[id];
    }

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async flush() {
        const rawStatus = await getAllAirplaneStatus();
        const airplaneStatus = processAirplane(rawStatus);
        if (airplaneStatus) {
            for (const [k, status] of Object.entries(airplaneStatus)) {
                if (!this.airplanesTable[k]) {
                    this.airplanesTable[k] = new AirplaneController(
                        status.keyName,
                        status.typeName,
                        status.updateTimestamp,
                        status.status,
                        status.cameraFront,
                        status.cameraDown
                    );
                } else {
                    const a = this.airplanesTable[k];
                    a.keyName = status.keyName;
                    a.typeName = status.typeName;
                    a.updateTimestamp = status.updateTimestamp;
                    a.status = makeAirplaneFlyStatus(status.status);
                    a.cameraFront = status.cameraFront;
                    a.cameraDown = status.cameraDown;
                }
            }
        } else {
            return null;
        }
    }
}

export const airplaneManagerSingleton = new AirplaneManager();

/**
 * AirplaneManager 是以单例模式工作的，故而需要使用这个函数来获取 AirplaneManager 单例对象
 */
export function getAirplaneManager() {
    return airplaneManagerSingleton;
}
