package PhantasyIslandJavaRemoteControl.radio;

import io.socket.client.IO;
import io.socket.client.Socket;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Array;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Function;

/**
 * RadioManager 类负责与远端进行 Socket.IO 通信，并管理各 API 模块。
 */
public class RadioManager {
    public Socket socketio;
    public String namespace = "/UserSide";
    public boolean sceneIsInit = false;

    // Sub-API 模块
    public final DebugApi debugApi;
    public final SceneApi sceneApi;
    public final FlyApi flyApi;
    public final RadioApi radioApi;

    // waitCmd -> List of weak references to WaitToken
    private final Map<String, List<java.lang.ref.WeakReference<WaitToken<?>>>> pendingWaiters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService timeoutExecutor = Executors.newSingleThreadScheduledExecutor();

    public RadioManager() {
        this.debugApi = new DebugApi(this);
        this.sceneApi = new SceneApi(this);
        this.flyApi = new FlyApi(this);
        this.radioApi = new RadioApi(this);
    }

    public long createMsgTimestampId() {
        return System.currentTimeMillis() * 100;
    }

    public void connect() {
        connect("http://127.0.0.1:60002", "/UserSide");
    }

    public void connect(String url, String namespace) {
        this.namespace = namespace;
        reset();

        String socketUrl = buildSocketUrl(url, namespace);
        System.out.println("[RadioManager] Connecting to " + url + " namespace " + namespace);
        try {
            IO.Options options = IO.Options.builder().setReconnection(true).build();
            socketio = IO.socket(socketUrl, options);
            initListener();
            socketio.connect();
        } catch (Exception e) {
            throw new RuntimeException("Failed to connect socket.io: " + socketUrl, e);
        }
    }

    public void reset() {
        if (socketio != null) {
            socketio.off();
            socketio.disconnect();
            socketio.close();
            socketio = null;
        }
        sceneIsInit = false;
        pendingWaiters.clear();
    }

    private void initListener() {
        if (socketio == null) {
            return;
        }

        socketio.on(Socket.EVENT_CONNECT, args -> {
            System.out.println("[RadioManager] connected");
            checkSceneStatus();
        });

        socketio.on(Socket.EVENT_DISCONNECT, args -> {
            System.out.println("[RadioManager] disconnected");
            sceneIsInit = false;
        });

        socketio.on(Socket.EVENT_CONNECT_ERROR, args -> {
            String detail = (args != null && args.length > 0) ? String.valueOf(args[0]) : "unknown";
            System.out.println("[RadioManager] connect_error: " + detail);
        });

        socketio.on("message", args -> {
            if (args == null || args.length == 0) {
                return;
            }
            Map<String, Object> payload = normalizeIncomingData(args[0]);
            if (payload == null) {
                System.out.println("[RadioManager] unsupported message payload: " + args[0]);
                return;
            }
            System.out.println("[RadioManager] message: " + payload);
            msgDispatch(payload);
        });
    }

    private String buildSocketUrl(String url, String namespace) {
        if (namespace == null || namespace.isEmpty() || "/".equals(namespace)) {
            return url;
        }
        String base = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
        String ns = namespace.startsWith("/") ? namespace : "/" + namespace;
        return base + ns;
    }

    private void checkSceneStatus() {
        send("ping", null);
        send("scene.getInitState", null);
    }

    public Object ping() {
        return sendAndWaitSync("ping", null, "pong", 3.0, null);
    }

    private void send(String cmd, Map<String, Object> data) {
        Map<String, Object> msg = new HashMap<>();
        msg.put("cmd", cmd);
        if (data != null) {
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                if (entry.getValue() != null) {
                    msg.put(entry.getKey(), entry.getValue());
                }
            }
        }
        if (socketio == null) {
            throw new IllegalStateException("Socket is not connected");
        }
        socketio.emit("message", toJsonObject(msg));
        System.out.println("[RadioManager] Sending: " + msg);
    }

    public <T> WaitToken<T> sendWithToken(String cmd, Map<String, Object> data, String waitCmd, Function<Map<String, Object>, T> postProcessor) {
        if (waitCmd == null) {
            waitCmd = cmd;
        }

        long timeBaseId = createMsgTimestampId();
        WaitToken<T> token = new WaitToken<>(waitCmd, timeBaseId);
        if (postProcessor != null) {
            token.setPostProcessor(postProcessor);
        }

        // 注册弱引用
        java.lang.ref.WeakReference<WaitToken<?>> ref = new java.lang.ref.WeakReference<>(token);
        pendingWaiters.computeIfAbsent(waitCmd, k -> Collections.synchronizedList(new ArrayList<>())).add(ref);

        Map<String, Object> msg = new HashMap<>();
        msg.put("timestampIdPython", timeBaseId);
        if (data != null) {
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                if (entry.getValue() != null) {
                    msg.put(entry.getKey(), entry.getValue());
                }
            }
        }

        send(cmd, msg);
        return token;
    }

    public <T> T sendAndWaitSync(String cmd, Map<String, Object> data, String waitCmd, double timeout, Function<Map<String, Object>, T> postProcessor) {
        WaitToken<T> token = sendWithToken(cmd, data, waitCmd, postProcessor);
        return token.waitResponse(timeout);
    }

    public <T> WaitToken<T> sendAndGetToken(String cmd, Map<String, Object> data, String waitCmd, Function<Map<String, Object>, T> postProcessor) {
        return sendWithToken(cmd, data, waitCmd, postProcessor);
    }

    public <T> CompletableFuture<T> sendAndWaitAsync(String cmd, Map<String, Object> data, String waitCmd, double timeout, Function<Map<String, Object>, T> postProcessor) {
        WaitToken<T> token = sendWithToken(cmd, data, waitCmd, postProcessor);
        CompletableFuture<T> future = token.asFuture();
        if (timeout > 0) {
            ScheduledFuture<?> timeoutTask = timeoutExecutor.schedule(
                    () -> future.complete(null),
                    (long) (timeout * 1000),
                    TimeUnit.MILLISECONDS
            );
            future.whenComplete((r, ex) -> timeoutTask.cancel(false));
        }
        return future;
    }

    private boolean notifyWaiters(String cmd, Map<String, Object> data) {
        if (cmd == null) return false;
        Object timestampIdObj = data.get("timestampIdPython");
        if (timestampIdObj == null) return false;
        long timestampId = toLong(timestampIdObj);

        List<java.lang.ref.WeakReference<WaitToken<?>>> refs = pendingWaiters.get(cmd);
        if (refs == null) return false;

        boolean matched = false;
        synchronized (refs) {
            Iterator<java.lang.ref.WeakReference<WaitToken<?>>> it = refs.iterator();
            while (it.hasNext()) {
                WaitToken<?> token = it.next().get();
                if (token == null) {
                    it.remove();
                    continue;
                }
                if (!matched && token.timeBaseId == timestampId) {
                    token.complete(data);
                    it.remove();
                    matched = true;
                }
            }
            if (refs.isEmpty()) {
                pendingWaiters.remove(cmd);
            }
        }
        return matched;
    }

    public void msgDispatch(Map<String, Object> data) {
        String cmd = (String) data.get("cmd");
        if (cmd == null) {
            System.out.println("[RadioManager] received message without cmd: " + data);
            return;
        }

        if (notifyWaiters(cmd, data)) {
            return;
        }

        switch (cmd) {
            case "pong":
                break;
            case "sceneReset":
            case "sceneNotInit":
                onSceneReset(data);
                break;
            case "sceneInit":
            case "sceneIsInit":
                onSceneInit(data);
                break;
            default:
                System.out.println("[RadioManager] unknown cmd: " + cmd + ", data: " + data);
        }
    }

    private void onSceneReset(Map<String, Object> data) {
        System.out.println("[RadioManager] handle sceneReset: " + data);
        sceneIsInit = false;
    }

    private void onSceneInit(Map<String, Object> data) {
        System.out.println("[RadioManager] handle sceneInit: " + data);
        sceneIsInit = true;
    }

    public void waitExit() throws InterruptedException {
        if (socketio != null) {
            socketio.wait();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> normalizeIncomingData(Object payload) {
        if (payload instanceof JSONObject jsonObject) {
            return jsonObjectToMap(jsonObject);
        }
        if (payload instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        if (payload instanceof String text) {
            try {
                return jsonObjectToMap(new JSONObject(text));
            } catch (JSONException ignored) {
                return null;
            }
        }
        return null;
    }

    private JSONObject toJsonObject(Map<String, Object> map) {
        JSONObject jsonObject = new JSONObject();
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            jsonObject.put(entry.getKey(), toJsonValue(entry.getValue()));
        }
        return jsonObject;
    }

    private Object toJsonValue(Object value) {
        if (value == null) {
            return JSONObject.NULL;
        }
        if (value instanceof Map<?, ?> m) {
            JSONObject nested = new JSONObject();
            for (Map.Entry<?, ?> entry : m.entrySet()) {
                nested.put(String.valueOf(entry.getKey()), toJsonValue(entry.getValue()));
            }
            return nested;
        }
        if (value instanceof Collection<?> collection) {
            JSONArray array = new JSONArray();
            for (Object item : collection) {
                array.put(toJsonValue(item));
            }
            return array;
        }
        if (value.getClass().isArray()) {
            JSONArray array = new JSONArray();
            int len = Array.getLength(value);
            for (int i = 0; i < len; i++) {
                array.put(toJsonValue(Array.get(value, i)));
            }
            return array;
        }
        return value;
    }

    private Map<String, Object> jsonObjectToMap(JSONObject jsonObject) {
        Map<String, Object> map = new HashMap<>();
        Iterator<String> keys = jsonObject.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            map.put(key, fromJsonValue(jsonObject.get(key)));
        }
        return map;
    }

    private Object fromJsonValue(Object value) {
        if (value == null || value == JSONObject.NULL) {
            return null;
        }
        if (value instanceof JSONObject jsonObject) {
            return jsonObjectToMap(jsonObject);
        }
        if (value instanceof JSONArray jsonArray) {
            List<Object> list = new ArrayList<>(jsonArray.length());
            for (int i = 0; i < jsonArray.length(); i++) {
                list.add(fromJsonValue(jsonArray.get(i)));
            }
            return list;
        }
        return value;
    }

    private long toLong(Object value) {
        if (value instanceof Number n) {
            return n.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }
}
