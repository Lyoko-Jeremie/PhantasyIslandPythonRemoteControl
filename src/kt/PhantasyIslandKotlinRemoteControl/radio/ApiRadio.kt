package PhantasyIslandKotlinRemoteControl.radio

/**
 * 无线电相关 API 模块。
 */
class RadioApi(rm: RadioManager) : ApiModule(rm) {

    fun isSceneInit(): Any? {
        return send("radio.isSceneInit", postProcessor = { d -> d["init"] as? Boolean })
    }

    fun isRadioReachabilityCheckerInit(): Any? {
        return send("radio.isRadioReachabilityCheckerInit", postProcessor = { d -> d["init"] as? Boolean })
    }

    fun checkReachability(aTx: XYZ, bRx: XYZ, options: RadioCheckOptions?): Any? {
        val data = mutableMapOf<String, Any?>()
        data["aTx"] = aTx.toList()
        data["bRx"] = bRx.toList()
        options?.let { data["options"] = it.toJSONObject().toMap() }
        return send<Any?>("radio.checkReachability", data = data)
    }

    fun updateObjectPos(objectId: String, position: XYZ): Any? {
        return send<Any?>("radio.updateObjectPos", data = mapOf(
            "objectId" to objectId,
            "position" to position.toList()
        ))
    }

    fun getObjectPos(objectId: String): Any? {
        return send("radio.updateObjectPos", data = mapOf(
            "objectId" to objectId
        ), postProcessor = { d -> d["position"] })
    }

    fun updateMeshRadioMaterial(meshId: String, materialId: String?, thicknessM: Double?): Any? {
        val data = mutableMapOf<String, Any?>()
        data["meshId"] = meshId
        materialId?.let { data["materialId"] = it }
        thicknessM?.let { data["thickness_m"] = it }
        return send<Any?>("radio.updateMeshRadioMaterial", data = data)
    }

    fun getAllRadioMaterial(): Any? {
        return send("radio.getAllRadioMaterial", postProcessor = { d ->
            val meshIds = d["meshIds"] as? List<Map<String, Any?>>
            meshIds?.map { RadioMaterialProperties.fromJSONObject(org.json.JSONObject(it)) }
        })
    }

    fun localRadioMaterial(): Any? {
        return send("radio.localRadioMaterial", postProcessor = { d ->
            val meshIds = d["meshIds"] as? List<Map<String, Any?>>
            meshIds?.map { RadioMaterialProperties.fromJSONObject(org.json.JSONObject(it)) }
        })
    }

    fun getBuildingRadioMaterial(): Any? {
        return send<Any?>("radio.getBuildingRadioMaterial")
    }

    fun addRadioMaterial(material: RadioMaterialProperties): Any? {
        return send<Any?>("radio.addRadioMaterial", data = material.toJSONObject().toMap())
    }

    fun listRadioLocalObjectsIds(): Any? {
        return send("radio.listRadioLocalObjects", postProcessor = { d -> d["localObjectIds"] as? List<String> })
    }
}

// 扩展函数方便在 Kotlin 中使用 Map
fun org.json.JSONObject.toMap(): Map<String, Any?> {
    val map = mutableMapOf<String, Any?>()
    val keys = this.keys()
    while (keys.hasNext()) {
        val key = keys.next()
        map[key] = this.get(key)
    }
    return map
}
