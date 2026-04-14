package PhantasyIslandKotlinRemoteControl.radio

import java.util.concurrent.CompletableFuture

/**
 * API 模块基类。
 */
abstract class ApiModule(protected val rm: RadioManager) {
    
    enum class Mode { SYNC, ASYNC, TOKEN }
    
    private var nowMode: Mode = Mode.SYNC

    fun setMode(mode: Mode): ApiModule {
        this.nowMode = mode
        return this
    }

    fun getNowMode(): Mode = nowMode

    /**
     * 发送指令。根据当前模式返回不同类型的结果。
     * 
     * SYNC 模式 -> 返回处理后的数据 T?
     * TOKEN 模式 -> 返回 WaitToken<T>
     * ASYNC 模式 -> 返回 CompletableFuture<T?>
     */
    protected fun <T> send(
        cmd: String,
        data: Map<String, Any?>? = null,
        waitCmd: String? = null,
        timeout: Double = 3.0,
        postProcessor: ((Map<String, Any?>) -> T)? = null
    ): Any? {
        return when (nowMode) {
            Mode.SYNC -> rm.sendAndWaitSync(cmd, data, waitCmd, timeout, postProcessor)
            Mode.TOKEN -> rm.sendAndGetToken(cmd, data, waitCmd, postProcessor)
            Mode.ASYNC -> rm.sendAndWaitAsync(cmd, data, waitCmd, timeout, postProcessor)
        }
    }
}

/**
 * 类型安全转换辅助函数
 */
@Suppress("UNCHECKED_CAST")
fun <T> asSync(result: Any?): T? = result as? T

@Suppress("UNCHECKED_CAST")
fun <T> asToken(result: Any?): WaitToken<Map<String, Any?>>? = result as? WaitToken<Map<String, Any?>>

@Suppress("UNCHECKED_CAST")
fun <T> asAsync(result: Any?): CompletableFuture<T?>? = result as? CompletableFuture<T?>
