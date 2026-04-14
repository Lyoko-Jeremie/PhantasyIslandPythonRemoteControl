/**
 * 这个文件是 PhantasyIslandPythonRemoteControl 库与仿真平台的核心通信协议部分
 */
import {remoteLocation} from './config';

// 在 TS 中，我们通常使用 fetch 或 axios。这里假设使用 fetch (Web 标准) 或 node-fetch。
// 为了简单起见，我们定义一个通用的请求函数。

async function fetchJson(url: string, timeoutMs: number = 10000): Promise<any> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {signal: controller.signal});
        clearTimeout(id);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error: any) {
        clearTimeout(id);
        throw error;
    }
}

export async function ping() {
    return sendCmd('ping');
}

export async function pingVolatile() {
    return sendCmdVolatile('ping');
}

export async function start() {
    return sendCmd('start');
}

export async function startVolatile() {
    return sendCmdVolatile('start');
}

export async function sendCmd(s: string) {
    try {
        const url = `http://${remoteLocation}/ECU_HTTP/sendStringCmd?c=${s}`;
        return await fetchJson(url, 10000);
    } catch (e: any) {
        if (e.name === 'AbortError') {
            console.log('send_cmd ', s, ' ', 'Error Command Timeout');
            return {ok: false, r: 'Timeout'};
        }
        console.error('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.');
        return {ok: false, r: 'ConnectionError Cannot Connect to PhantasyIsland'};
    }
}

export async function sendCmdVolatile(s: string) {
    try {
        const url = `http://${remoteLocation}/ECU_HTTP/sendStringCmd?cc=${s}`;
        return await fetchJson(url, 10000);
    } catch (e: any) {
        if (e.name === 'AbortError') {
            console.log('send_cmd_volatile ', s, ' ', 'Error Command Timeout');
            return {ok: false, r: 'Timeout'};
        }
        console.error('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.');
        return {ok: false, r: 'ConnectionError Cannot Connect to PhantasyIsland'};
    }
}

export async function getAllAirplaneStatus() {
    try {
        const url = `http://${remoteLocation}/ECU_HTTP/requestPullAllAirplaneState`;
        return await fetchJson(url, 5000);
    } catch (e: any) {
        console.error('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.');
        throw new Error('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.');
    }
}

/**
 * 获取指定无人机的摄像头图像
 * @param port 无人机的 keyName
 * @param camera 'down' 或 'front'
 * @returns Promise<string | null> 图像的 base64 编码字符串
 */
export async function getAirplaneCameraImage(port: string, camera: string): Promise<string | null> {
    try {
        const url = `http://${remoteLocation}/ECU_HTTP/requestPullImage?flyPort=${port}&imageType=${camera}`;
        const j = await fetchJson(url, 5000);
        if (j.ok === true) {
            return j.imgDataString;
        } else {
            return null;
        }
    } catch (e: any) {
        console.error('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.');
        return null;
    }
}

export function processAirplane(j: any) {
    if (j.ok === true) {
        const airplanes = j.airplanes;
        const airplaneStatus: Record<string, any> = {};
        for (const air of airplanes) {
            const status: any = {};
            status.keyName = air.keyName;
            status.typeName = air.typeName;
            status.updateTimestamp = air.updateTimestamp;
            status.status = air.status;

            const cameraFront = air.cameraFront;
            status.cameraFront = cameraFront ? cameraFront.imgDataString : null;

            const cameraDown = air.cameraDown;
            status.cameraDown = cameraDown ? cameraDown.imgDataString : null;

            airplaneStatus[status.keyName] = status;
        }
        return airplaneStatus;
    } else {
        return null;
    }
}
