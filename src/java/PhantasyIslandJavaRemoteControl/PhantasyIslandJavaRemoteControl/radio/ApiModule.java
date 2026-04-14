package PhantasyIslandJavaRemoteControl.radio;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.function.Function;

/**
 * API 模块基类。
 */
public abstract class ApiModule {
    protected final RadioManager rm;

    public enum Mode { SYNC, ASYNC, TOKEN }

    private Mode nowMode = Mode.SYNC;

    public ApiModule(RadioManager rm) {
        this.rm = rm;
    }

    public ApiModule setMode(Mode mode) {
        this.nowMode = mode;
        return this;
    }

    public Mode getNowMode() {
        return nowMode;
    }

    /**
     * 发送指令。根据当前模式返回不同类型的结果。
     *
     * SYNC 模式 -> 返回处理后的数据 T
     * TOKEN 模式 -> 返回 WaitToken<T>
     * ASYNC 模式 -> 返回 CompletableFuture<T>
     */
    protected <T> Object send(
            String cmd,
            Map<String, Object> data,
            String waitCmd,
            double timeout,
            Function<Map<String, Object>, T> postProcessor
    ) {
        switch (nowMode) {
            case SYNC:
                return rm.sendAndWaitSync(cmd, data, waitCmd, timeout, postProcessor);
            case TOKEN:
                return rm.sendAndGetToken(cmd, data, waitCmd, postProcessor);
            case ASYNC:
                return rm.sendAndWaitAsync(cmd, data, waitCmd, timeout, postProcessor);
            default:
                throw new IllegalStateException("Unexpected mode: " + nowMode);
        }
    }

    protected Object send(String cmd, Map<String, Object> data, String waitCmd) {
        return send(cmd, data, waitCmd, 3.0, null);
    }

    protected Object send(String cmd, String waitCmd) {
        return send(cmd, null, waitCmd, 3.0, null);
    }

    protected Object send(String cmd) {
        return send(cmd, null, null, 3.0, null);
    }

    /**
     * 类型安全转换辅助函数
     */
    @SuppressWarnings("unchecked")
    public static <T> T asSync(Object result) {
        return (T) result;
    }

    @SuppressWarnings("unchecked")
    public static <T> WaitToken<T> asToken(Object result) {
        return (WaitToken<T>) result;
    }

    @SuppressWarnings("unchecked")
    public static <T> CompletableFuture<T> asAsync(Object result) {
        return (CompletableFuture<T>) result;
    }
}
