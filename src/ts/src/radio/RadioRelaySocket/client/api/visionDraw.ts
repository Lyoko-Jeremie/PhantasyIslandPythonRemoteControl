import type {RadioRelaySocketClient} from '../client';

export interface VisionDrawObjectParams {
    type: 'sphere' | 'cube' | 'line' | string;
    name?: string;
    id?: string;
    groupId?: string;
    radius?: number;
    size?: [number, number, number];
    lineVec?: [number, number, number];
    position?: [number, number, number];
    rotation?: [number, number, number, number];
    scale?: [number, number, number];
    color?: string;
    opacity?: number;
    enable?: boolean;

    lineRadius?: number;
    lineRadiusSegment?: number;

    showTimeout?: number;
}

export interface VisionDrawObjectData {
    id: string;
    type: string;
    name?: string;
    groupId?: string;
    [key: string]: any;
}

export interface VisionDrawGroupUpdateParams {
    color?: string;
    opacity?: number;
    enable?: boolean;
    scale?: [number, number, number];
}

export class VisionDraw {
    constructor(private client: RadioRelaySocketClient) {
    }

    TableName = 'visionDraw';

    createObject(params: VisionDrawObjectParams) {
        return this.client._sendMessage<{
            data: VisionDrawObjectData,
        }>({cmd: `${this.TableName}.createObject`, params});
    }

    createGroup(groupId: string, paramsList: VisionDrawObjectParams[]) {
        return this.client._sendMessage<{
            data: VisionDrawObjectData[],
        }>({cmd: `${this.TableName}.createGroup`, groupId, paramsList});
    }

    updateObject(id: string, params: Partial<VisionDrawObjectParams>) {
        return this.client._sendMessage<{
            data: VisionDrawObjectData,
        }>({cmd: `${this.TableName}.updateObject`, id, params});
    }

    removeObject(id: string) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.removeObject`, id});
    }

    getObject(id: string) {
        return this.client._sendMessage<{
            data: VisionDrawObjectData,
        }>({cmd: `${this.TableName}.getObject`, id});
    }

    getGroup(groupId: string) {
        return this.client._sendMessage<{
            data: VisionDrawObjectData[],
        }>({cmd: `${this.TableName}.getGroup`, groupId});
    }

    removeGroup(groupId: string) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.removeGroup`, groupId});
    }

    setGroupEnable(groupId: string, enable: boolean) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.setGroupEnable`, groupId, enable});
    }

    moveGroup(groupId: string, offset: [number, number, number]) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.moveGroup`, groupId, offset});
    }

    updateGroup(groupId: string, params: VisionDrawGroupUpdateParams) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.updateGroup`, groupId, params});
    }

    cloneGroup(sourceGroupId: string, newGroupId: string, offset?: [number, number, number]) {
        return this.client._sendMessage<{
            data: VisionDrawObjectData[],
        }>({cmd: `${this.TableName}.cloneGroup`, sourceGroupId, newGroupId, offset});
    }

    moveObject(id: string, offset: [number, number, number]) {
        return this.client._sendMessage<{
            data: { id: string, position: [number, number, number] },
        }>({cmd: `${this.TableName}.moveObject`, id, offset});
    }

    setObjectPosition(id: string, position: [number, number, number]) {
        return this.client._sendMessage<{
            data: { id: string, position: [number, number, number] },
        }>({cmd: `${this.TableName}.setObjectPosition`, id, position});
    }

    setObjectRotation(id: string, rotation: [number, number, number, number]) {
        return this.client._sendMessage<{
            data: { id: string, rotation: [number, number, number, number] },
        }>({cmd: `${this.TableName}.setObjectRotation`, id, rotation});
    }

    setObjectScale(id: string, scale: [number, number, number]) {
        return this.client._sendMessage<{
            data: { id: string, scale: [number, number, number] },
        }>({cmd: `${this.TableName}.setObjectScale`, id, scale});
    }

    setObjectColor(id: string, color: string) {
        return this.client._sendMessage<{
            data: { id: string, color: string },
        }>({cmd: `${this.TableName}.setObjectColor`, id, color});
    }

    setObjectOpacity(id: string, opacity: number) {
        return this.client._sendMessage<{
            data: { id: string, opacity: number },
        }>({cmd: `${this.TableName}.setObjectOpacity`, id, opacity});
    }

    setObjectEnable(id: string, enable: boolean) {
        return this.client._sendMessage<{
            data: { id: string, enable: boolean },
        }>({cmd: `${this.TableName}.setObjectEnable`, id, enable});
    }

    setAllEnable(enable: boolean) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.setAllEnable`, enable});
    }

    removeAll() {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.removeAll`});
    }

    getGroupIds() {
        return this.client._sendMessage<{
            data: string[],
        }>({cmd: `${this.TableName}.getGroupIds`});
    }

    getAllJsonSerializable() {
        return this.client._sendMessage<{
            data: {
                groups: Record<string, VisionDrawObjectData[]>,
                standalone: VisionDrawObjectData[],
            },
        }>({cmd: `${this.TableName}.getAllJsonSerializable`});
    }

    addObjectToGroup(id: string, groupId: string) {
        return this.client._sendMessage<{
            data: { id: string, groupId: string },
        }>({cmd: `${this.TableName}.addObjectToGroup`, id, groupId});
    }

    removeObjectFromGroup(id: string) {
        return this.client._sendMessage<{
            data: { id: string, groupId: null },
        }>({cmd: `${this.TableName}.removeObjectFromGroup`, id});
    }
}

