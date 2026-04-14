package PhantasyIslandJavaRemoteControl.radio;

/**
 * 调试 / 连通性 相关 API 模块。
 */
public class DebugApi extends ApiModule {
    public DebugApi(RadioManager rm) {
        super(rm);
    }

    /** Ping 远端，等待 pong 回复。 */
    public Object ping() {
        return send("ping", "pong");
    }
}
