package PhantasyIslandJavaRemoteControl;

import java.util.HashMap;
import java.util.Map;

/**
 * 管理并更新所有飞机状态的管理器。
 */
public class AirplaneManager {
    private static final AirplaneManager instance = new AirplaneManager();
    public Map<String, Object> airplanesTable = new HashMap<>(); // 实际上是 AirplaneController

    private AirplaneManager() {}

    public static AirplaneManager getAirplaneManager() {
        return instance;
    }

    public Object ping() {
        // return HttpLayer.ping();
        return null;
    }

    public void start() {
        // HttpLayer.start();
    }

    public Object getAirplane(String id) {
        return airplanesTable.get(id);
    }

    public void flush() {
        // Map<String, Map<String, Object>> statusMap = HttpLayer.getAllAirplaneStatus();
        // 遍历并更新 airplanesTable
    }
}
