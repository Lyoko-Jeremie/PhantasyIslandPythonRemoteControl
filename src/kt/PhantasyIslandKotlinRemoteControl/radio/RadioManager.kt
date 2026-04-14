package PhantasyIslandKotlinRemoteControl.radio

import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.CompletableFuture
import java.util.concurrent.TimeUnit
import java.lang.ref.WeakReference
import org.json.JSONObject

import io.socket.client.IO
import io.socket.client.Socket

/**
 * 核心管理器，处理 Socket.io 通信和令牌匹配。
 * 注意：此实现假设使用类似于 socket.io-client-java 的库。
 */
class RadioManager {
    // 模拟 Socket.io 客户端
    // lateinit var socket: io.socket.client.Socket
    var namespace: String = "/UserSide"
    var isSceneInit: Boolean = false

    // Sub-API 模块
    val debugApi = DebugApi(this)
    val sceneApi = SceneApi(this)
    val flyApi = FlyApi(this)
    val radioApi = RadioApi(this)

    // waitCmd -> List of WeakReferences to WaitToken
    private val pendingWaiters = ConcurrentHashMap<String, MutableList<WeakReference<WaitToken<Map<String, Any?>>>>>()

    fun createMsgTimestampId(): Long {
        return System.currentTimeMillis() * 100
    }

    fun connect(url: String = "http://127.0.0.1:60002", ns: String = "/UserSide") {
        this.namespace = ns
        println("[RadioManager] Connecting to $url$ns...")
        // 实际项目中应在这里初始化 socket 并设置监听器
        // socket = IO.socket(url, IO.Options().apply { namespaces = arrayOf(ns) })
        // initListener()
        // socket.connect()
    }

    fun reset() {
        // if (::socket.isInitialized && socket.connected()) socket.disconnect()
        isSceneInit = false
    }

    private fun initListener() {
        // socket.on("connect") { 
        //     println("[RadioManager] connected")
        //     checkSceneStatus()
        // }
        // socket.on("disconnect") {
        //     println("[RadioManager] disconnected")
        //     isSceneInit = false
        // }
        // socket.on("message") { args ->
        //     val data = args[0] as JSONObject
        //     msgDispatch(data.toMap())
        // }
    }

    private fun checkSceneStatus() {
        send("ping")
        send("scene.getInitState")
    }

    fun ping(): Any? {
        return sendAndWaitSync("ping", waitCmd = "pong")
    }

    fun send(cmd: String, data: Map<String, Any?>? = null) {
        val msg = JSONObject()
        msg.put("cmd", cmd)
        data?.forEach { (k, v) -> msg.put(k, v) }
        println("[RadioManager] Emitting: $msg")
        // socket.emit("message", msg)
    }

    /**
     * 发送命令并获取一个 WaitToken。
     */
    fun <T> sendAndGetToken(
        cmd: String,
        data: Map<String, Any?>? = null,
        waitCmd: String? = null,
        postProcessor: ((Map<String, Any?>) -> T)? = null
    ): WaitToken<Map<String, Any?>> {
        val finalWaitCmd = waitCmd ?: cmd
        val timestampId = createMsgTimestampId()
        
        val token = WaitToken<Map<String, Any?>>(finalWaitCmd, timestampId.toInt())
        if (postProcessor != null) {
            token.setPostProcessor { raw -> postProcessor(raw) as Any }
        }

        // 注册弱引用
        val ref = WeakReference(token)
        pendingWaiters.getOrPut(finalWaitCmd) { CopyOnWriteArrayList() }.add(ref)

        val msg = mutableMapOf<String, Any?>()
        msg["timestampIdPython"] = timestampId
        data?.forEach { (k, v) -> if (v != null) msg[k] = v }

        send(cmd, msg)
        return token
    }

    /**
     * 同步发送并等待响应。
     */
    fun <T> sendAndWaitSync(
        cmd: String,
        data: Map<String, Any?>? = null,
        waitCmd: String? = null,
        timeout: Double = 3.0,
        postProcessor: ((Map<String, Any?>) -> T)? = null
    ): T? {
        val token = sendAndGetToken(cmd, data, waitCmd, postProcessor)
        @Suppress("UNCHECKED_CAST")
        return token.wait(timeout) as? T
    }

    /**
     * 异步发送并等待响应。
     */
    fun <T> sendAndWaitAsync(
        cmd: String,
        data: Map<String, Any?>? = null,
        waitCmd: String? = null,
        timeout: Double = 3.0,
        postProcessor: ((Map<String, Any?>) -> T)? = null
    ): CompletableFuture<T?> {
        val token = sendAndGetToken(cmd, data, waitCmd, postProcessor)
        return token.asFuture().thenApply { 
            @Suppress("UNCHECKED_CAST")
            it as? T 
        }.orTimeout((timeout * 1000).toLong(), TimeUnit.MILLISECONDS)
            .exceptionally { null }
    }

    private fun notifyWaiters(cmd: String, data: Map<String, Any?>): Boolean {
        val timestampId = (data["timestampIdPython"] as? Number)?.toInt()
        val waiters = pendingWaiters[cmd] ?: return false

        var matched = false
        val toRemove = mutableListOf<WeakReference<WaitToken<Map<String, Any?>>>>()

        for (ref in waiters) {
            val token = ref.get()
            if (token == null) {
                toRemove.add(ref)
                continue
            }
            if (!matched && timestampId != null && token.timeBaseId == timestampId) {
                token.complete(data)
                matched = true
                toRemove.add(ref)
            }
        }
        
        waiters.removeAll(toRemove)
        if (waiters.isEmpty()) pendingWaiters.remove(cmd)
        
        return matched
    }

    fun msgDispatch(data: Map<String, Any?>) {
        val cmd = data["cmd"] as? String ?: return
        
        if (notifyWaiters(cmd, data)) return

        when (cmd) {
            "pong" -> {}
            "sceneReset", "sceneNotInit" -> {
                println("[RadioManager] Scene Reset: $data")
                isSceneInit = false
            }
            "sceneInit", "sceneIsInit" -> {
                println("[RadioManager] Scene Init: $data")
                isSceneInit = true
            }
            else -> {
                println("[RadioManager] Unknown cmd: $cmd, data: $data")
            }
        }
    }
}
