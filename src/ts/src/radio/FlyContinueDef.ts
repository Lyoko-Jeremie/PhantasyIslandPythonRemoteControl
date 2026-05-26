/**
 * 控制输入接口
 * 表示来自摇杆/输入设备的实时控制数据
 */
export interface ControlInput {
    /** X轴线速度（-1 ~ 1） */
    vx: number;
    /** Y轴线速度（高度方向，-1 ~ 1） */
    vy: number;
    /** Z轴线速度（-1 ~ 1） */
    vz: number;
    /** Y轴角速度（旋转，度/秒，-1 ~ 1） */
    yawRate: number;
}
