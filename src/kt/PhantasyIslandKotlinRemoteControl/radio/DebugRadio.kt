package PhantasyIslandKotlinRemoteControl.radio

/**
 * 调试 RadioManager 的简单示例程序
 */
fun main() {
    val rm = RadioManager()
    rm.connect()

    println("Timestamp ID: ${rm.createMsgTimestampId()}")

    // 默认 SYNC 模式
    val pingResult = rm.debugApi.ping()
    println("Ping Result: $pingResult")

    val localObjectIds = asSync<List<String>>(rm.radioApi.listRadioLocalObjectsIds())
    println("Local Object IDs: $localObjectIds")

    println("isSceneInit: ${rm.radioApi.isSceneInit()}")
    println("isRadioReachabilityCheckerInit: ${rm.radioApi.isRadioReachabilityCheckerInit()}")
    println("getAllRadioMaterial: ${rm.radioApi.getAllRadioMaterial()}")
    println("localRadioMaterial: ${rm.radioApi.localRadioMaterial()}")

    // 可以在这里添加更多测试逻辑
    
    // 如果需要保持程序运行以等待异步回调
    // Thread.sleep(10000)
}
