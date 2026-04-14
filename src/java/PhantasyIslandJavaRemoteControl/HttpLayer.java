package PhantasyIslandJavaRemoteControl;

import java.util.HashMap;
import java.util.Map;

/**
 * 库与仿真平台的核心通信协议部分。
 */
public class HttpLayer {

    public static Map<String, Object> ping() {
        return sendCmd("ping");
    }

    public static Map<String, Object> start() {
        return sendCmd("start");
    }

    public static Map<String, Object> sendCmd(String s) {
        String url = "http://" + Config.remoteLocation + "/ECU_HTTP/sendStringCmd?c=" + s;
        // 实际应用中应使用 OkHttp 或 java.net.http.HttpClient
        System.out.println("HTTP GET: " + url);
        Map<String, Object> result = new HashMap<>();
        result.put("ok", true);
        return result;
    }

    public static Map<String, Object> getAllAirplaneStatus() {
        String url = "http://" + Config.remoteLocation + "/ECU_HTTP/requestPullAllAirplaneState";
        System.out.println("HTTP GET: " + url);
        return new HashMap<>();
    }

    public static String getAirplaneCameraImage(String port, String camera) {
        String url = "http://" + Config.remoteLocation + "/ECU_HTTP/requestPullImage?flyPort=" + port + "&imageType=" + camera;
        System.out.println("HTTP GET: " + url);
        return null; // 返回 base64 字符串
    }
}
