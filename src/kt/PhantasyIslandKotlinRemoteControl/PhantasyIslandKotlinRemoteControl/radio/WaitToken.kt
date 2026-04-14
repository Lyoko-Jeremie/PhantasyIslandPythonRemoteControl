package PhantasyIslandKotlinRemoteControl.radio

import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.CompletableFuture

/**
 * 轻量级的请求-响应等待令牌。
 */
class WaitToken<T>(
    val waitCmd: String,
    val timeBaseId: Int
) {
    var response: T? = null
    var processedResponse: Any? = null
    private val latch = CountDownLatch(1)
    private val future = CompletableFuture<Any?>()
    private var postProcessor: ((T) -> Any)? = null

    /** 令牌是否已收到响应。 */
    val isDone: Boolean
        get() = latch.count == 0L

    /**
     * 注册后处理回调。当收到 response 后，会自动调用此回调进行数据格式转换。
     */
    fun setPostProcessor(processor: (T) -> Any): WaitToken<T> {
        this.postProcessor = processor
        return this
    }

    private fun applyPostProcessor(data: T): Any? {
        val result = postProcessor?.invoke(data) ?: data
        this.processedResponse = result
        return result
    }

    /**
     * 填充响应并唤醒所有等待者。
     */
    fun complete(data: T) {
        this.response = data
        val result = applyPostProcessor(data)
        latch.countDown()
        future.complete(result)
    }

    /**
     * 阻塞当前线程直到收到响应或超时。
     * @param timeoutSec 超时秒数
     * @return 后处理结果，超时返回 null
     */
    fun wait(timeoutSec: Double = 3.0): Any? {
        val success = latch.await((timeoutSec * 1000).toLong(), TimeUnit.MILLISECONDS)
        return if (success) processedResponse else null
    }

    /**
     * 获取用于异步等待的 CompletableFuture。
     */
    fun asFuture(): CompletableFuture<Any?> {
        return future
    }

    override fun toString(): String {
        val status = if (isDone) "done" else "pending"
        return "<WaitToken cmd=$waitCmd $status>"
    }
}
