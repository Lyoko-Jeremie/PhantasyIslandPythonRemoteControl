package PhantasyIslandKotlinRemoteControl.radio

import org.json.JSONObject
import org.json.JSONArray

/**
 * 三维坐标，单位米，格式 (x, y, z)
 */
data class XYZ(val x: Double, val y: Double, val z: Double) {
    fun toList(): List<Double> = listOf(x, y, z)
    fun toJSONArray(): JSONArray = JSONArray(toList())
    
    companion object {
        fun fromJSONArray(arr: JSONArray): XYZ = XYZ(arr.getDouble(0), arr.getDouble(1), arr.getDouble(2))
        fun fromList(list: List<Any>): XYZ = XYZ((list[0] as Number).toDouble(), (list[1] as Number).toDouble(), (list[2] as Number).toDouble())
    }
}

/**
 * 链路可达性检查的可选参数。
 */
data class RadioCheckOptions(
    var frequencyMHz: Double? = null,
    var txPowerDbm: Double? = null,
    var rxSensitivityDbm: Double? = null,
    var fresnelZoneRatio: Double? = null,
    var skipFresnelZoneCheck: Boolean? = null,
    var enableMultipath: Boolean? = null,
    var maxReflectionPaths: Double? = null,
    var maxReflectionPathLengthRatio: Double? = null,
    var defaultTxAntennaGain_dBi: Double? = null,
    var defaultRxAntennaGain_dBi: Double? = null,
    var enableAntennaPattern: Boolean? = null,
    var enableMutualCoupling: Boolean? = null,
    var couplingNegligibleThresholdWavelengths: Double? = null,
    var enableSINR: Boolean? = null,
    var receiverBandwidthHz: Double? = null,
    var minSINR_dB: Double? = null,
    var enableFrequencyIsolation: Boolean? = null,
    var enableNearFieldCorrection: Boolean? = null,
    var enableNodeBodyOcclusion: Boolean? = null
) {
    fun toJSONObject(): JSONObject {
        val json = JSONObject()
        frequencyMHz?.let { json.put("frequencyMHz", it) }
        txPowerDbm?.let { json.put("txPowerDbm", it) }
        rxSensitivityDbm?.let { json.put("rxSensitivityDbm", it) }
        fresnelZoneRatio?.let { json.put("fresnelZoneRatio", it) }
        skipFresnelZoneCheck?.let { json.put("skipFresnelZoneCheck", it) }
        enableMultipath?.let { json.put("enableMultipath", it) }
        maxReflectionPaths?.let { json.put("maxReflectionPaths", it) }
        maxReflectionPathLengthRatio?.let { json.put("maxReflectionPathLengthRatio", it) }
        defaultTxAntennaGain_dBi?.let { json.put("defaultTxAntennaGain_dBi", it) }
        defaultRxAntennaGain_dBi?.let { json.put("defaultRxAntennaGain_dBi", it) }
        enableAntennaPattern?.let { json.put("enableAntennaPattern", it) }
        enableMutualCoupling?.let { json.put("enableMutualCoupling", it) }
        couplingNegligibleThresholdWavelengths?.let { json.put("couplingNegligibleThresholdWavelengths", it) }
        enableSINR?.let { json.put("enableSINR", it) }
        receiverBandwidthHz?.let { json.put("receiverBandwidthHz", it) }
        minSINR_dB?.let { json.put("minSINR_dB", it) }
        enableFrequencyIsolation?.let { json.put("enableFrequencyIsolation", it) }
        enableNearFieldCorrection?.let { json.put("enableNearFieldCorrection", it) }
        enableNodeBodyOcclusion?.let { json.put("enableNodeBodyOcclusion", it) }
        return json
    }

    companion object {
        fun fromJSONObject(json: JSONObject): RadioCheckOptions {
            val opt = RadioCheckOptions()
            if (json.has("frequencyMHz")) opt.frequencyMHz = json.getDouble("frequencyMHz")
            if (json.has("txPowerDbm")) opt.txPowerDbm = json.getDouble("txPowerDbm")
            if (json.has("rxSensitivityDbm")) opt.rxSensitivityDbm = json.getDouble("rxSensitivityDbm")
            if (json.has("fresnelZoneRatio")) opt.fresnelZoneRatio = json.getDouble("fresnelZoneRatio")
            if (json.has("skipFresnelZoneCheck")) opt.skipFresnelZoneCheck = json.getBoolean("skipFresnelZoneCheck")
            if (json.has("enableMultipath")) opt.enableMultipath = json.getBoolean("enableMultipath")
            if (json.has("maxReflectionPaths")) opt.maxReflectionPaths = json.getDouble("maxReflectionPaths")
            if (json.has("maxReflectionPathLengthRatio")) opt.maxReflectionPathLengthRatio = json.getDouble("maxReflectionPathLengthRatio")
            if (json.has("defaultTxAntennaGain_dBi")) opt.defaultTxAntennaGain_dBi = json.getDouble("defaultTxAntennaGain_dBi")
            if (json.has("defaultRxAntennaGain_dBi")) opt.defaultRxAntennaGain_dBi = json.getDouble("defaultRxAntennaGain_dBi")
            if (json.has("enableAntennaPattern")) opt.enableAntennaPattern = json.getBoolean("enableAntennaPattern")
            if (json.has("enableMutualCoupling")) opt.enableMutualCoupling = json.getBoolean("enableMutualCoupling")
            if (json.has("couplingNegligibleThresholdWavelengths")) opt.couplingNegligibleThresholdWavelengths = json.getDouble("couplingNegligibleThresholdWavelengths")
            if (json.has("enableSINR")) opt.enableSINR = json.getBoolean("enableSINR")
            if (json.has("receiverBandwidthHz")) opt.receiverBandwidthHz = json.getDouble("receiverBandwidthHz")
            if (json.has("minSINR_dB")) opt.minSINR_dB = json.getDouble("minSINR_dB")
            if (json.has("enableFrequencyIsolation")) opt.enableFrequencyIsolation = json.getBoolean("enableFrequencyIsolation")
            if (json.has("enableNearFieldCorrection")) opt.enableNearFieldCorrection = json.getBoolean("enableNearFieldCorrection")
            if (json.has("enableNodeBodyOcclusion")) opt.enableNodeBodyOcclusion = json.getBoolean("enableNodeBodyOcclusion")
            return opt
        }
    }
}

/**
 * 链路可达性检查请求消息。
 */
data class CheckReachabilityRequest(
    val aTx: XYZ,
    val bRx: XYZ,
    val options: RadioCheckOptions? = null
) {
    fun toJSONObject(): JSONObject {
        val json = JSONObject()
        json.put("aTx", aTx.toJSONArray())
        json.put("bRx", bRx.toJSONArray())
        options?.let { json.put("options", it.toJSONObject()) }
        return json
    }

    companion object {
        fun fromJSONObject(json: JSONObject): CheckReachabilityRequest {
            return CheckReachabilityRequest(
                aTx = XYZ.fromJSONArray(json.getJSONArray("aTx")),
                bRx = XYZ.fromJSONArray(json.getJSONArray("bRx")),
                options = if (json.has("options")) RadioCheckOptions.fromJSONObject(json.getJSONObject("options")) else null
            )
        }
    }
}

/**
 * 更新对象位置的消息。
 */
data class UpdateObjectPosRequest(
    val objectId: String,
    val position: XYZ
) {
    fun toJSONObject(): JSONObject {
        val json = JSONObject()
        json.put("objectId", objectId)
        json.put("position", position.toJSONArray())
        return json
    }

    companion object {
        fun fromJSONObject(json: JSONObject): UpdateObjectPosRequest {
            return UpdateObjectPosRequest(
                objectId = json.getString("objectId"),
                position = XYZ.fromJSONArray(json.getJSONArray("position"))
            )
        }
    }
}

/**
 * 更新对象的电磁属性。
 */
data class UpdateMeshRadioMaterialRequest(
    val meshId: String,
    var materialId: String? = null,
    var thickness_m: Double? = null
) {
    fun toJSONObject(): JSONObject {
        val json = JSONObject()
        json.put("meshId", meshId)
        materialId?.let { json.put("materialId", it) }
        thickness_m?.let { json.put("thickness_m", it) }
        return json
    }

    companion object {
        fun fromJSONObject(json: JSONObject): UpdateMeshRadioMaterialRequest {
            val req = UpdateMeshRadioMaterialRequest(json.getString("meshId"))
            if (json.has("materialId")) req.materialId = json.getString("materialId")
            if (json.has("thickness_m")) req.thickness_m = json.getDouble("thickness_m")
            return req
        }
    }
}

/**
 * 电磁材料属性定义。
 */
data class RadioMaterialProperties(
    val id: String,
    val displayName: String,
    val penetrationLoss_dBPerMeter: Double,
    val reflectionCoefficient: Double,
    val defaultThickness_m: Double
) {
    fun toJSONObject(): JSONObject {
        val json = JSONObject()
        json.put("id", id)
        json.put("displayName", displayName)
        json.put("penetrationLoss_dBPerMeter", penetrationLoss_dBPerMeter)
        json.put("reflectionCoefficient", reflectionCoefficient)
        json.put("defaultThickness_m", defaultThickness_m)
        return json
    }

    companion object {
        fun fromJSONObject(json: JSONObject): RadioMaterialProperties {
            return RadioMaterialProperties(
                id = json.getString("id"),
                displayName = json.getString("displayName"),
                penetrationLoss_dBPerMeter = json.getDouble("penetrationLoss_dBPerMeter"),
                reflectionCoefficient = json.getDouble("reflectionCoefficient"),
                defaultThickness_m = json.getDouble("defaultThickness_m")
            )
        }
    }
}

/**
 * 摇杆输入消息。
 */
data class JoyStickInput(
    val vx: Double = 0.0,
    val vy: Double = 0.0,
    val vz: Double = 0.0,
    val yawRate: Double = 0.0
) {
    fun toJSONObject(): JSONObject {
        val json = JSONObject()
        json.put("vx", vx)
        json.put("vy", vy)
        json.put("vz", vz)
        json.put("yawRate", yawRate)
        return json
    }

    companion object {
        fun fromJSONObject(json: JSONObject): JoyStickInput {
            return JoyStickInput(
                vx = json.optDouble("vx", 0.0),
                vy = json.optDouble("vy", 0.0),
                vz = json.optDouble("vz", 0.0),
                yawRate = json.optDouble("yawRate", 0.0)
            )
        }
    }
}
