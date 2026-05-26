import type {RadioRelaySocketClient} from '../client';

export type EulerOrder = 'XYZ' | 'XZY' | 'YXZ' | 'YZX' | 'ZXY' | 'ZYX';
export type EulerTuple = [number, number, number, EulerOrder];
export type QuaternionTuple = [number, number, number, number];

export interface RestrictedAreaData {
    id: string;
    name: string;
    type: 'sphere' | 'cube' | 'cone';
    enabled: boolean;
    position: [number, number, number];
    rotation: EulerTuple;
    radius?: number;
    size?: [number, number, number];
    coneHeight?: number;
    coneAngle?: number;
}

export class RestrictedArea {
    constructor(private client: RadioRelaySocketClient) {
    }

    TableName = 'restrictedArea';

    getAllRadioRestrictedArea() {
        return this.client._sendMessage<{
            data: RestrictedAreaData[],
        }>({cmd: `${this.TableName}.getAllRadioRestrictedArea`});
    }

    getRadioRestrictedAreaById(id: string) {
        return this.client._sendMessage<{
            data: RestrictedAreaData,
        }>({cmd: `${this.TableName}.getRadioRestrictedAreaById`, id});
    }

    enableArea(id: string) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.enableArea`, id});
    }

    enableAreaByName(name: string) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.enableAreaByName`, name});
    }

    disableArea(id: string) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.disableArea`, id});
    }

    disableAreaByName(name: string) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.disableAreaByName`, name});
    }

    pointInAnyArea(pos: [number, number, number]) {
        return this.client._sendMessage<{
            result: RestrictedAreaData[],
        }>({cmd: `${this.TableName}.pointInAnyArea`, pos});
    }

    pointInAreaById(id: string, pos: [number, number, number]) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.pointInAreaById`, id, pos});
    }

    areaId2Name(id: string) {
        return this.client._sendMessage<{
            result: string,
        }>({cmd: `${this.TableName}.areaId2Name`, id});
    }

    areaName2Id(name: string) {
        return this.client._sendMessage<{
            result: string,
        }>({cmd: `${this.TableName}.areaName2Id`, name});
    }

    euler2quaternion(euler: EulerTuple) {
        return this.client._sendMessage<{
            result: QuaternionTuple,
        }>({cmd: `${this.TableName}.euler2quaternion`, euler});
    }

    quaternion2euler(quaternion: QuaternionTuple) {
        return this.client._sendMessage<{
            result: EulerTuple,
        }>({cmd: `${this.TableName}.quaternion2euler`, quaternion});
    }

    eulerReOrder(euler: EulerTuple, order: EulerOrder) {
        return this.client._sendMessage<{
            result: EulerTuple,
        }>({cmd: `${this.TableName}.eulerReOrder`, euler, order});
    }

    moveArea(id: string, pos: [number, number, number]) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.moveArea`, id, pos});
    }

    moveAreaByName(name: string, pos: [number, number, number]) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.moveAreaByName`, name, pos});
    }

    rotateArea(id: string, rotation: EulerTuple) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.rotateArea`, id, rotation});
    }

    rotateAreaByName(name: string, rotation: EulerTuple) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.rotateAreaByName`, name, rotation});
    }

    resizeSphereArea(id: string, radius: number) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.resizeSphereArea`, id, radius});
    }

    resizeSphereAreaByName(name: string, radius: number) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.resizeSphereAreaByName`, name, radius});
    }

    resizeCubeArea(id: string, size: [number, number, number]) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.resizeCubeArea`, id, size});
    }

    resizeCubeAreaByName(name: string, size: [number, number, number]) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.resizeCubeAreaByName`, name, size});
    }

    resizeConeArea(id: string, coneHeight: number, coneAngle: number) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.resizeConeArea`, id, coneHeight, coneAngle});
    }

    resizeConeAreaByName(name: string, coneHeight: number, coneAngle: number) {
        return this.client._sendMessage<{
            result: boolean,
        }>({cmd: `${this.TableName}.resizeConeAreaByName`, name, coneHeight, coneAngle});
    }

    createSphereArea(name: string, position: [number, number, number], rotation: EulerTuple, radius: number) {
        return this.client._sendMessage<{
            data: RestrictedAreaData,
        }>({cmd: `${this.TableName}.createSphereArea`, name, position, rotation, radius});
    }

    createCubeArea(name: string, position: [number, number, number], rotation: EulerTuple, size: [number, number, number]) {
        return this.client._sendMessage<{
            data: RestrictedAreaData,
        }>({cmd: `${this.TableName}.createCubeArea`, name, position, rotation, size});
    }

    createConeArea(name: string, position: [number, number, number], rotation: EulerTuple, coneHeight: number, coneAngle: number) {
        return this.client._sendMessage<{
            data: RestrictedAreaData,
        }>({cmd: `${this.TableName}.createConeArea`, name, position, rotation, coneHeight, coneAngle});
    }
}

