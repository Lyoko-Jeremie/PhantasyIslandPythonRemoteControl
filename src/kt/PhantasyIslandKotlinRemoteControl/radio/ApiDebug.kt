package PhantasyIslandKotlinRemoteControl.radio

/**
 * 调试 / 连通性 相关 API 模块。
 */
class DebugApi(rm: RadioManager) : ApiModule(rm) {
    /** Ping 远端，等待 pong 回复。 */
    fun ping(): Any? {
        return send("ping", waitCmd = "pong")
    }
}
