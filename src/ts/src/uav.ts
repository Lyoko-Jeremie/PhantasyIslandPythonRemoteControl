import {AirplaneManager, getAirplaneManager} from './airplaneManager';
import {AirplaneController} from './controlCommand';

export class UAV {
    /**
     * 此类是到 UAV 库的适配器，是对 AirplaneManager 的 wrapper
     */
    airs: AirplaneManager = getAirplaneManager();

    constructor() {
        this.init();
    }

    private async init() {
        await this.airs.flush();
        await this.airs.start();
        await this.airs.flush();
    }

    async sleep(time: number) {
        /** sleep 单位 秒 */
        return new Promise(resolve => setTimeout(resolve, time * 1000));
    }

    destroy() {
        // this.airs.destroy()
    }

    async addUav(port: string) {
        /** 添加（注册）无人机 */
        return this.airs.getAirplane(port);
    }

    p(port: string): AirplaneController | undefined {
        return this.airs.getAirplane(port);
    }

    async land(port: string) {
        /** 降落 */
        const uav = this.p(port);
        if (uav) return uav.land();
    }

    async emergency(port: string) {
        const uav = this.p(port);
        if (uav) return uav.stop();
    }

    async takeoff(port: string, high: number) {
        /** 起飞到指定高度 单位cm */
        const uav = this.p(port);
        if (uav) return uav.takeoff(high);
    }

    async up(port: string, distance: number) {
        /** 上升指定距离 单位cm */
        const uav = this.p(port);
        if (uav) return uav.up(distance);
    }

    async down(port: string, distance: number) {
        /** 下降指定距离 单位cm */
        const uav = this.p(port);
        if (uav) return uav.down(distance);
    }

    async forward(port: string, distance: number) {
        /** 前进指定距离 单位cm */
        const uav = this.p(port);
        if (uav) return uav.forward(distance);
    }

    async back(port: string, distance: number) {
        /** 后退指定距离 单位cm */
        const uav = this.p(port);
        if (uav) return uav.back(distance);
    }

    async left(port: string, distance: number) {
        /** 左移指定距离 单位cm */
        const uav = this.p(port);
        if (uav) return uav.left(distance);
    }

    async right(port: string, distance: number) {
        /** 右移指定距离 单位cm */
        const uav = this.p(port);
        if (uav) return uav.right(distance);
    }

    async goto(port: string, x: number, y: number, h: number) {
        /** 移动到指定坐标处 */
        const uav = this.p(port);
        if (uav) return uav.goto(x, y, h);
    }

    async flip(port: string, direction: string) {
        /**
         * flip 函数用于控制无人机翻滚
         * @param port
         * @param direction 翻滚方向（f前 b后 l左 r右）
         */
        const uav = this.p(port);
        if (!uav) return;
        if (direction === 'f') {
            return uav.flipForward();
        } else if (direction === 'b') {
            return uav.flipBack();
        } else if (direction === 'r') {
            return uav.flipRight();
        } else if (direction === 'l') {
            return uav.flipLeft();
        }
    }

    async rotate(port: string, degree: number) {
        /** 顺时旋转指定角度 */
        const uav = this.p(port);
        if (uav) return uav.rotate(degree);
    }

    async cw(port: string, degree: number) {
        /** 顺时针旋转指定角度 */
        const uav = this.p(port);
        if (uav) return uav.cw(degree);
    }

    async ccw(port: string, degree: number) {
        /** 逆时针旋转指定角度 */
        const uav = this.p(port);
        if (uav) return uav.ccw(degree);
    }

    async speed(port: string, speed: number) {
        /** 设置飞行速度 */
        const uav = this.p(port);
        if (uav) return uav.speed(speed);
    }

    async high(port: string, high: number) {
        /** 移动到指定高度处 */
        const uav = this.p(port);
        if (uav) return uav.high(high);
    }

    async led(port: string, r: number, g: number, b: number) {
        /** 设置无人机led色彩 */
        const uav = this.p(port);
        if (uav) return uav.led(r, g, b);
    }

    async bln(port: string, r: number, g: number, b: number) {
        /** 设置无人机led呼吸灯色彩 */
        const uav = this.p(port);
        if (uav) return uav.bln(r, g, b);
    }

    async rainbow(port: string, r: number, g: number, b: number) {
        /** 设置无人机led彩虹色彩 */
        const uav = this.p(port);
        if (uav) return uav.rainbow(r, g, b);
    }

    async mode(port: string, m: number) {
        /** 设置无人机飞行模式 */
        const uav = this.p(port);
        if (uav) return uav.airplaneMode(m);
    }

    async stop(port: string) {
        /** 停桨 */
        const uav = this.p(port);
        if (uav) return uav.stop();
    }

    async hover(port: string) {
        /** 悬停 */
        const uav = this.p(port);
        if (uav) return uav.hover();
    }
}
