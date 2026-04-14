package PhantasyIslandKotlinRemoteControl.radio

/**
 * 场景相关 API 模块。
 */
class SceneApi(rm: RadioManager) : ApiModule(rm) {

    fun listAllMeshObjectInScene(): Any? {
        return send<Any?>("scene.listAllMeshObjectInScene")
    }

    fun getObjectInfoById(objectId: String): Any? {
        return send<Any?>("scene.getObjectInfoById", data = mapOf("objectId" to objectId))
    }

    fun removeObjectById(objectId: String): Any? {
        return send<Any?>("scene.removeObjectById", data = mapOf("objectId" to objectId))
    }

    fun moveObjectById(objectId: String, position: Triple<Double, Double, Double>): Any? {
        return send<Any?>("scene.moveObjectById", data = mapOf(
            "objectId" to objectId,
            "position" to listOf(position.first, position.second, position.third)
        ))
    }

    fun setObjectRadioMaterial(objectId: String, materialId: String?, thicknessM: Double?): Any? {
        val data = mutableMapOf<String, Any?>()
        data["objectId"] = objectId
        materialId?.let { data["materialId"] = it }
        thicknessM?.let { data["thickness_m"] = it }
        return send<Any?>("scene.setObjectRadioMaterial", data = data)
    }

    fun updateMeshViewMaterial(meshId: String, command: ViewMaterialChangeCommand): Any? {
        return send<Any?>("scene.updateMeshViewMaterial", data = mapOf(
            "meshId" to meshId,
            "viewMaterialChangeCommand" to command.toJSONObject().toMap()
        ))
    }

    fun updateMeshViewMaterialSimple(meshId: String, command: ViewMaterialChangeCommandSimple): Any? {
        return send<Any?>("scene.updateMeshViewMaterialSimple", data = mapOf(
            "meshId" to meshId,
            "viewMaterialChangeCommandSimple" to command.toJSONObject().toMap()
        ))
    }
}
