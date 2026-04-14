package PhantasyIslandJavaRemoteControl.radio;

import java.util.*;
import java.util.concurrent.*;
import java.util.function.Function;

/**
 * RadioManager 类负责与远端进行 Socket.IO 通信，并管理各 API 模块。
 */
public class RadioManager {
    // 假设使用某个 Socket.IO 客户端库，这里使用伪代码或通用接口
    // 在实际 Java 移植中，通常使用 socket.io-client-java
    public Object socketio; 
    public String namespace = "/UserSide";
    public boolean sceneIsInit = false;

    // Sub-API 模块
    public final DebugApi debugApi;
    public final SceneApi sceneApi;
    public final FlyApi flyApi;
    public final RadioApi radioApi;

    // waitCmd -> List of weak references to WaitToken
    private final Map<String, List<java.lang.ref.WeakReference<WaitToken<?>>>> pendingWaiters = new ConcurrentHashMap<>();

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
        // 初始化 Socket.IO 客户端并连接 (伪代码)
        System.out.println("[RadioManager] Connecting to " + url + " namespace " + namespace);
        initListener();
    }

    private void initListener() {
        // 注册监听器 (伪代码，实际取决于所选的 Socket.IO 库)
        // socketio.on("connect", () -> { ... });
        // socketio.on("message", (data) -> { msgDispatch(data); });
    }

    public Object ping() {
        return sendAndWaitSync("ping", null, "pong", 3.0, null);
    }

    private void send(String cmd, Map<String, Object> data) {
        Map<String, Object> msg = new HashMap<>();
        msg.put("cmd", cmd);
        if (data != null) {
            msg.putAll(data);
        }
        // 发送消息 (伪代码)
        // socketio.emit("message", msg);
        System.out.println("[RadioManager] Sending: " + msg);
    }

    public <T> WaitToken<T> sendWithToken(String cmd, Map<String, Object> data, String waitCmd, Function<Map<String, Object>, T> postProcessor) {
        if (waitCmd == null) {
            waitCmd = cmd;
        }

        int timeBaseId = (int) createMsgTimestampId();
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
        // Java 的 CompletableFuture 不像 Python 的 asyncio.wait_for 那么直接支持超时
        // 实际实现中可能需要配合 ScheduledExecutorService
        return token.asFuture();
    }

    private boolean notifyWaiters(String cmd, Map<String, Object> data) {
        Object timestampIdObj = data.get("timestampIdPython");
        if (timestampIdObj == null) return false;
        int timestampId = ((Number) timestampIdObj).intValue();

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
        }
        return matched;
    }

    public void msgDispatch(Map<String, Object> data) {
        String cmd = (String) data.get("cmd");
        if (cmd == null) return;

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
                System.out.println("[RadioManager] unknown cmd: " + cmd);
        }
    }

    private void onSceneReset(Map<String, Object> data) {
        System.out.println("[RadioManager] handle sceneReset");
        sceneIsInit = false;
    }

    private void onSceneInit(Map<String, Object> data) {
        System.out.println("[RadioManager] handle sceneInit");
        sceneIsInit = true;
    }
}
