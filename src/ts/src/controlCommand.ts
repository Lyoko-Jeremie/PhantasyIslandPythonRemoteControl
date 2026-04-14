import {AirplaneCore} from './airplaneCore';
import {sendCmd, sendCmdVolatile} from './httpLayer';

export class AirplaneController extends AirplaneCore {
    count: number = 1;
    private _sendCmdFn: (s: string) => Promise<any> = sendCmd;

    /**
     * 设置命令是否使用非阻塞模式
     *
     * 在 TS 中，我们通常使用 Promise。fastMode 决定使用 volatile 命令，
     * futureMode 决定是否立即返回 Promise (在 TS 中始终返回 Promise，但可以通过不 await 来实现非阻塞)
     */
    useFastMode(fastMode: boolean = true, futureMode: boolean = true) {
        if (fastMode) {
            this._sendCmdFn = sendCmdVolatile;
        } else {
            this._sendCmdFn = sendCmd;
        }
    }

    private _nextCount(): number {
        this.count = this.count + 2;
        return this.count;
    }

    private _prepareCommand(command: string): string {
        return `${this.keyName} ${this._nextCount()} ${command}`;
    }

    protected async _sendCmd(command: string): Promise<any> {
        return this._sendCmdFn(this._prepareCommand(command));
    }

    mode(m: number) {
        return this.airplaneMode(m);
    }

    takeoff(high: number) {
        return this._sendCmd(`takeoff ${high}`);
    }

    land() {
        return this._sendCmd(`land`);
    }

    emergency() {
        return this._sendCmd(`emergency`);
    }

    up(distance: number) {
        return this._sendCmd(`up ${distance}`);
    }

    down(distance: number) {
        return this._sendCmd(`down ${distance}`);
    }

    forward(distance: number) {
        return this._sendCmd(`forward ${distance}`);
    }

    back(distance: number) {
        return this._sendCmd(`back ${distance}`);
    }

    left(distance: number) {
        return this._sendCmd(`left ${distance}`);
    }

    right(distance: number) {
        return this._sendCmd(`right ${distance}`);
    }

    goto(x: number, y: number, h: number) {
        return this._sendCmd(`goto ${x} ${y} ${h}`);
    }

    flip(direction: string) {
        return this._sendCmd(`flip ${direction} 1`);
    }

    flipForward() {
        return this.flip("f");
    }

    flipBack() {
        return this.flip("b");
    }

    flipLeft() {
        return this.flip("l");
    }

    flipRight() {
        return this.flip("r");
    }

    rotate(degree: number) {
        return this._sendCmd(`rotate ${degree}`);
    }

    cw(degree: number) {
        return this._sendCmd(`cw ${degree}`);
    }

    ccw(degree: number) {
        return this._sendCmd(`ccw ${degree}`);
    }

    high(h: number) {
        return this._sendCmd(`high ${h}`);
    }

    speed(s: number) {
        return this._sendCmd(`setSpeed ${s}`);
    }

    led(r: number, g: number, b: number) {
        return this._sendCmd(`light ${r} ${g} ${b}`);
    }

    bln(r: number, g: number, b: number) {
        return this._sendCmd(`bln ${r} ${g} ${b}`);
    }

    rainbow(r: number, g: number, b: number) {
        return this._sendCmd(`rainbow ${r} ${g} ${b}`);
    }

    airplaneMode(m: number) {
        return this._sendCmd(`airplane_mode ${m}`);
    }

    stop() {
        return this.hover();
    }

    hover() {
        return this._sendCmd(`hover`);
    }
}
