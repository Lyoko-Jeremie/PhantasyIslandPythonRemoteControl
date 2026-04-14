package PhantasyIslandKotlinRemoteControl.radio

import org.json.JSONObject
import org.json.JSONArray

/**
 * 修改 mesh 的可视化材质的指令。
 */
data class ViewMaterialChangeCommand(
    var materialType: String? = null,
    var color: String? = null,
    var opacity: Double? = null,
    var transparent: Boolean? = null,
    var visible: Boolean? = null,
    var wireframe: Boolean? = null,
    var side: Int? = null,
    var depthTest: Boolean? = null,
    var depthWrite: Boolean? = null,
    var alphaTest: Double? = null,
    var blending: Int? = null,
    var vertexColors: Boolean? = null,
    var fog: Boolean? = null,
    var emissive: String? = null,
    var emissiveIntensity: Double? = null,
    var metalness: Double? = null,
    var roughness: Double? = null,
    var envMapIntensity: Double? = null,
    var flatShading: Boolean? = null,
    var shininess: Double? = null,
    var specular: String? = null,
    var clearcoat: Double? = null,
    var clearcoatRoughness: Double? = null,
    var transmission: Double? = null,
    var ior: Double? = null,
    var thickness: Double? = null,
    var sheen: Double? = null,
    var sheenRoughness: Double? = null,
    var sheenColor: String? = null,
    var attenuationColor: String? = null,
    var attenuationDistance: Double? = null,
    var iridescence: Double? = null,
    var iridescenceIOR: Double? = null,
    var iridescenceThicknessRange: Pair<Double, Double>? = null,
    var specularIntensity: Double? = null,
    var specularColor: String? = null,
    var reflectivity: Double? = null,
    var dispersion: Double? = null,
    var anisotropy: Double? = null,
    var anisotropyRotation: Double? = null,
    var mapUrl: String? = null,
    var normalMapUrl: String? = null,
    var roughnessMapUrl: String? = null,
    var metalnessMapUrl: String? = null,
    var emissiveMapUrl: String? = null,
    var aoMapUrl: String? = null,
    var alphaMapUrl: String? = null,
    var bumpMapUrl: String? = null,
    var displacementMapUrl: String? = null,
    var normalScale: Pair<Double, Double>? = null,
    var bumpScale: Double? = null,
    var displacementScale: Double? = null,
    var displacementBias: Double? = null,
    var aoMapIntensity: Double? = null,
    var mapRepeat: Pair<Double, Double>? = null,
    var mapOffset: Pair<Double, Double>? = null,
    var mapRotation: Double? = null
) {
    fun toJSONObject(): JSONObject {
        val json = JSONObject()
        materialType?.let { json.put("materialType", it) }
        color?.let { json.put("color", it) }
        opacity?.let { json.put("opacity", it) }
        transparent?.let { json.put("transparent", it) }
        visible?.let { json.put("visible", it) }
        wireframe?.let { json.put("wireframe", it) }
        side?.let { json.put("side", it) }
        depthTest?.let { json.put("depthTest", it) }
        depthWrite?.let { json.put("depthWrite", it) }
        alphaTest?.let { json.put("alphaTest", it) }
        blending?.let { json.put("blending", it) }
        vertexColors?.let { json.put("vertexColors", it) }
        fog?.let { json.put("fog", it) }
        emissive?.let { json.put("emissive", it) }
        emissiveIntensity?.let { json.put("emissiveIntensity", it) }
        metalness?.let { json.put("metalness", it) }
        roughness?.let { json.put("roughness", it) }
        envMapIntensity?.let { json.put("envMapIntensity", it) }
        flatShading?.let { json.put("flatShading", it) }
        shininess?.let { json.put("shininess", it) }
        specular?.let { json.put("specular", it) }
        clearcoat?.let { json.put("clearcoat", it) }
        clearcoatRoughness?.let { json.put("clearcoatRoughness", it) }
        transmission?.let { json.put("transmission", it) }
        ior?.let { json.put("ior", it) }
        thickness?.let { json.put("thickness", it) }
        sheen?.let { json.put("sheen", it) }
        sheenRoughness?.let { json.put("sheenRoughness", it) }
        sheenColor?.let { json.put("sheenColor", it) }
        attenuationColor?.let { json.put("attenuationColor", it) }
        attenuationDistance?.let { json.put("attenuationDistance", it) }
        iridescence?.let { json.put("iridescence", it) }
        iridescenceIOR?.let { json.put("iridescenceIOR", it) }
        iridescenceThicknessRange?.let { json.put("iridescenceThicknessRange", JSONArray(listOf(it.first, it.second))) }
        specularIntensity?.let { json.put("specularIntensity", it) }
        specularColor?.let { json.put("specularColor", it) }
        reflectivity?.let { json.put("reflectivity", it) }
        dispersion?.let { json.put("dispersion", it) }
        anisotropy?.let { json.put("anisotropy", it) }
        anisotropyRotation?.let { json.put("anisotropyRotation", it) }
        mapUrl?.let { json.put("mapUrl", it) }
        normalMapUrl?.let { json.put("normalMapUrl", it) }
        roughnessMapUrl?.let { json.put("roughnessMapUrl", it) }
        metalnessMapUrl?.let { json.put("metalnessMapUrl", it) }
        emissiveMapUrl?.let { json.put("emissiveMapUrl", it) }
        aoMapUrl?.let { json.put("aoMapUrl", it) }
        alphaMapUrl?.let { json.put("alphaMapUrl", it) }
        bumpMapUrl?.let { json.put("bumpMapUrl", it) }
        displacementMapUrl?.let { json.put("displacementMapUrl", it) }
        normalScale?.let { json.put("normalScale", JSONArray(listOf(it.first, it.second))) }
        bumpScale?.let { json.put("bumpScale", it) }
        displacementScale?.let { json.put("displacementScale", it) }
        displacementBias?.let { json.put("displacementBias", it) }
        aoMapIntensity?.let { json.put("aoMapIntensity", it) }
        mapRepeat?.let { json.put("mapRepeat", JSONArray(listOf(it.first, it.second))) }
        mapOffset?.let { json.put("mapOffset", JSONArray(listOf(it.first, it.second))) }
        mapRotation?.let { json.put("mapRotation", it) }
        return json
    }
}

/**
 * 修改 mesh 的可视化材质的指令（简化版）。
 */
data class ViewMaterialChangeCommandSimple(
    var color: String? = null,
    var opacity: Double? = null,
    var transparent: Boolean? = null,
    var visible: Boolean? = null,
    var wireframe: Boolean? = null,
    var side: Int? = null,
    var fog: Boolean? = null,
    var emissive: String? = null,
    var emissiveIntensity: Double? = null
) {
    fun toJSONObject(): JSONObject {
        val json = JSONObject()
        color?.let { json.put("color", it) }
        opacity?.let { json.put("opacity", it) }
        transparent?.let { json.put("transparent", it) }
        visible?.let { json.put("visible", it) }
        wireframe?.let { json.put("wireframe", it) }
        side?.let { json.put("side", it) }
        fog?.let { json.put("fog", it) }
        emissive?.let { json.put("emissive", it) }
        emissiveIntensity?.let { json.put("emissiveIntensity", it) }
        return json
    }
}
