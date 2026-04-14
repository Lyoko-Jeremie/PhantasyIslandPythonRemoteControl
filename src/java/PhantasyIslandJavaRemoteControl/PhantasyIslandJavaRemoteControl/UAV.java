package PhantasyIslandJavaRemoteControl;

/**
 * 此类是到 UAV 库的适配器，是对 AirplaneManager 的 wrapper。
 * 与 FH0A 类基本一致。
 */
public class UAV {
    public AirplaneManager airs = AirplaneManager.getAirplaneManager();

    public UAV() {
        airs.flush();
        airs.start();
        airs.flush();
    }

    public void sleep(double time) {
        try {
            Thread.sleep((long) (time * 1000));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public void addUav(String port) {
        airs.getAirplane(port);
    }

    private AirplaneController p(String port) {
        return (AirplaneController) airs.getAirplane(port);
    }

    public void land(String port) {
        p(port).land();
    }

    public void takeoff(String port, int high) {
        p(port).takeoff(high);
    }

    public void up(String port, int distance) {
        p(port).up(distance);
    }

    public void down(String port, int distance) {
        p(port).down(distance);
    }

    public void forward(String port, int distance) {
        p(port).forward(distance);
    }

    public void back(String port, int distance) {
        p(port).back(distance);
    }

    public void left(String port, int distance) {
        p(port).left(distance);
    }

    public void right(String port, int distance) {
        p(port).right(distance);
    }

    public void gotoPos(String port, int x, int y, int h) {
        p(port).gotoPos(x, y, h);
    }

    public void rotate(String port, int degree) {
        p(port).rotate(degree);
    }

    public void speed(String port, int speed) {
        p(port).speed(speed);
    }

    public void stop(String port) {
        p(port).stop();
    }

    public void hover(String port) {
        p(port).hover();
    }
}
