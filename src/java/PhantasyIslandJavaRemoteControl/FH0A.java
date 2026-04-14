package PhantasyIslandJavaRemoteControl;

import PhantasyIslandJavaRemoteControl.AirplaneManager;

/**
 * 此类是到FH0A库的适配器，是对AirplaneManager的wrapper。
 */
public class FH0A {
    public AirplaneManager airs = AirplaneManager.getAirplaneManager();

    public FH0A() {
        airs.flush();
        airs.start();
        airs.flush();
    }

    /** sleep 单位 秒 */
    public void sleep(double time) {
        try {
            Thread.sleep((long) (time * 1000));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public void destroy() {
        // airs.destroy();
    }

    /** 添加（注册）无人机 */
    public void addUav(String port) {
        airs.getAirplane(port);
    }

    private Object p(String port) {
        // 这里返回类型应为 Uav 或 AirplaneCore，取决于 AirplaneManager.getAirplane 的返回类型
        return airs.getAirplane(port);
    }

    // 这里由于 AirplaneManager 和 Uav 类还没实现，方法调用暂时使用伪代码风格
    // 在后续步骤中会完善这些类的具体定义

    /** 降落 */
    public void land(String port) {
        // ((Uav)p(port)).land();
    }

    /** 起飞到指定高度 单位cm */
    public void takeoff(String port, int high) {
        // ((Uav)p(port)).takeoff(high);
    }

    /** 上升指定距离 单位cm */
    public void up(String port, int distance) {
        // ((Uav)p(port)).up(distance);
    }

    /** 下降指定距离 单位cm */
    public void down(String port, int distance) {
        // ((Uav)p(port)).down(distance);
    }

    /** 前进指定距离 单位cm */
    public void forward(String port, int distance) {
        // ((Uav)p(port)).forward(distance);
    }

    /** 后退指定距离 单位cm */
    public void back(String port, int distance) {
        // ((Uav)p(port)).back(distance);
    }

    /** 左移指定距离 单位cm */
    public void left(String port, int distance) {
        // ((Uav)p(port)).left(distance);
    }

    /** 右移指定距离 单位cm */
    public void right(String port, int distance) {
        // ((Uav)p(port)).right(distance);
    }

    /** 移动到指定坐标处 */
    public void gotoPos(String port, int x, int y, int h) {
        // ((Uav)p(port)).gotoPos(x, y, h);
    }

    /** 顺时旋转指定角度 */
    public void rotate(String port, int degree) {
        // ((Uav)p(port)).rotate(degree);
    }

    /** 设置飞行速度 */
    public void speed(String port, int speed) {
        // ((Uav)p(port)).speed(speed);
    }

    /** 停桨 */
    public void stop(String port) {
        // ((Uav)p(port)).stop();
    }

    /** 悬停 */
    public void hover(String port) {
        // ((Uav)p(port)).hover();
    }
}
