package PhantasyIslandJavaRemoteControl;

import java.util.Map;

/**
 * 每个飞机的飞行状态。
 */
public class AirplaneFlyStatus {
    public boolean landing;
    public boolean isStop;
    public double x;
    public double y;
    public double h;
    public double rX;
    public double rY;
    public double rZ;

    public AirplaneFlyStatus() {}

    public static AirplaneFlyStatus fromMap(Map<String, Object> data) {
        AirplaneFlyStatus s = new AirplaneFlyStatus();
        s.landing = (Boolean) data.get("landing");
        s.isStop = (Boolean) data.get("isStop");
        s.x = ((Number) data.get("x")).doubleValue();
        s.y = ((Number) data.get("y")).doubleValue();
        s.h = ((Number) data.get("h")).doubleValue();
        s.rX = ((Number) data.get("rX")).doubleValue();
        s.rY = ((Number) data.get("rY")).doubleValue();
        s.rZ = ((Number) data.get("rZ")).doubleValue();
        return s;
    }
}
