package PhantasyIslandKotlinRemoteControl.radio

/**
 * 飞行器相关 API 模块。
 */
class FlyApi(rm: RadioManager) : ApiModule(rm) {

    fun listFlyObject(): Any? {
        return send("fly.listFlyObject")
    }

    fun getFlyObjectInfo(keyName: String): Any? {
        return send("fly.getFlyObjectInfo", data = mapOf("keyName" to keyName))
    }

    fun getFlyObjectCameraImageDown(keyName: String): Any? {
        return send("fly.getFlyObjectCameraImageDown", data = mapOf("keyName" to keyName))
    }

    fun getFlyObjectCameraImageFront(keyName: String): Any? {
        return send("fly.getFlyObjectCameraImageFront", data = mapOf("keyName" to keyName))
    }
}
