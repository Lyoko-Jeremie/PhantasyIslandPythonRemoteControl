package PhantasyIslandJavaRemoteControl.radio;

import java.util.HashMap;
import java.util.Map;

/**
 * 飞行器相关 API 模块。
 */
public class FlyApi extends ApiModule {
    public FlyApi(RadioManager rm) {
        super(rm);
    }

    public Object listFlyObject() {
        return send("fly.listFlyObject");
    }

    public Object getFlyObjectInfo(String keyName) {
        Map<String, Object> data = new HashMap<>();
        data.put("keyName", keyName);
        return send("fly.getFlyObjectInfo", data, null);
    }

    public Object getFlyObjectCameraImageDown(String keyName) {
        Map<String, Object> data = new HashMap<>();
        data.put("keyName", keyName);
        return send("fly.getFlyObjectCameraImageDown", data, null);
    }

    public Object getFlyObjectCameraImageFront(String keyName) {
        Map<String, Object> data = new HashMap<>();
        data.put("keyName", keyName);
        return send("fly.getFlyObjectCameraImageFront", data, null);
    }
}
