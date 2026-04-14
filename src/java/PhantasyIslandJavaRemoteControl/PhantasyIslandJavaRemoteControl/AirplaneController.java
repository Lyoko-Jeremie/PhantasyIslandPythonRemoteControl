package PhantasyIslandJavaRemoteControl;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 无人机控制。
 * 此类包含控制单个无人机的所有指令。
 */
public class AirplaneController extends AirplaneCore {
    private int count = 1;
    private static final ExecutorService executor = Executors.newFixedThreadPool(10);

    private synchronized int nextCount() {
        count += 2;
        return count;
    }

    private String prepareCommand(String command) {
        return keyName + " " + nextCount() + " " + command;
    }

    private String sendCmd(String command) {
        String fullCmd = prepareCommand(command);
        // return HttpLayer.sendCmd(fullCmd);
        System.out.println("Sending command: " + fullCmd);
        return "ok";
    }

    public String takeoff(int high) {
        return sendCmd("takeoff " + high);
    }

    public String land() {
        return sendCmd("land");
    }

    public String up(int distance) {
        return sendCmd("up " + distance);
    }

    public String down(int distance) {
        return sendCmd("down " + distance);
    }

    public String forward(int distance) {
        return sendCmd("forward " + distance);
    }

    public String back(int distance) {
        return sendCmd("back " + distance);
    }

    public String left(int distance) {
        return sendCmd("left " + distance);
    }

    public String right(int distance) {
        return sendCmd("right " + distance);
    }

    public String gotoPos(int x, int y, int h) {
        return sendCmd("goto " + x + " " + y + " " + h);
    }

    public String rotate(int degree) {
        return sendCmd("rotate " + degree);
    }

    public String speed(int speed) {
        return sendCmd("setSpeed " + speed);
    }

    public String stop() {
        return sendCmd("hover");
    }

    public String hover() {
        return sendCmd("hover");
    }
}
