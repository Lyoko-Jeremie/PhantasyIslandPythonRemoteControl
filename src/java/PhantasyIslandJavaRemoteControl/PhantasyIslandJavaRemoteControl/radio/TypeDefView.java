package PhantasyIslandJavaRemoteControl.radio;

import java.util.HashMap;
import java.util.Map;

/**
 * 修改 mesh 可视化材质的指令。
 */
public class TypeDefView {

    public static class ViewMaterialChangeCommand {
        public String materialType = null;
        public String color = null;
        public Double opacity = null;
        public Boolean transparent = null;
        public Boolean visible = null;
        public Boolean wireframe = null;
        public Integer side = null;
        public Boolean depthTest = null;
        public Boolean depthWrite = null;
        public Double alphaTest = null;
        public Integer blending = null;
        public Boolean vertexColors = null;
        public Boolean fog = null;
        public String emissive = null;
        public Double emissiveIntensity = null;
        public Double metalness = null;
        public Double roughness = null;
        public Double envMapIntensity = null;
        public Boolean flatShading = null;
        public Double shininess = null;
        public String specular = null;
        public Double clearcoat = null;
        public Double clearcoatRoughness = null;
        public Double transmission = null;
        public Double ior = null;
        public Double thickness = null;
        public Double sheen = null;
        public Double sheenRoughness = null;
        public String sheenColor = null;
        public String attenuationColor = null;
        public Double attenuationDistance = null;
        public Double iridescence = null;
        public Double iridescenceIOR = null;
        public double[] iridescenceThicknessRange = null;
        public Double specularIntensity = null;
        public String specularColor = null;
        public Double reflectivity = null;
        public Double dispersion = null;
        public Double anisotropy = null;
        public Double anisotropyRotation = null;
        public String mapUrl = null;
        public String normalMapUrl = null;
        public String roughnessMapUrl = null;
        public String metalnessMapUrl = null;
        public String emissiveMapUrl = null;
        public String aoMapUrl = null;
        public String alphaMapUrl = null;
        public String bumpMapUrl = null;
        public String displacementMapUrl = null;
        public double[] normalScale = null;
        public Double bumpScale = null;
        public Double displacementScale = null;
        public Double displacementBias = null;
        public Double aoMapIntensity = null;
        public double[] mapRepeat = null;
        public double[] mapOffset = null;
        public Double mapRotation = null;

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            if (materialType != null) map.put("materialType", materialType);
            if (color != null) map.put("color", color);
            if (opacity != null) map.put("opacity", opacity);
            if (transparent != null) map.put("transparent", transparent);
            if (visible != null) map.put("visible", visible);
            if (wireframe != null) map.put("wireframe", wireframe);
            if (side != null) map.put("side", side);
            if (depthTest != null) map.put("depthTest", depthTest);
            if (depthWrite != null) map.put("depthWrite", depthWrite);
            if (alphaTest != null) map.put("alphaTest", alphaTest);
            if (blending != null) map.put("blending", blending);
            if (vertexColors != null) map.put("vertexColors", vertexColors);
            if (fog != null) map.put("fog", fog);
            if (emissive != null) map.put("emissive", emissive);
            if (emissiveIntensity != null) map.put("emissiveIntensity", emissiveIntensity);
            if (metalness != null) map.put("metalness", metalness);
            if (roughness != null) map.put("roughness", roughness);
            if (envMapIntensity != null) map.put("envMapIntensity", envMapIntensity);
            if (flatShading != null) map.put("flatShading", flatShading);
            if (shininess != null) map.put("shininess", shininess);
            if (specular != null) map.put("specular", specular);
            if (clearcoat != null) map.put("clearcoat", clearcoat);
            if (clearcoatRoughness != null) map.put("clearcoatRoughness", clearcoatRoughness);
            if (transmission != null) map.put("transmission", transmission);
            if (ior != null) map.put("ior", ior);
            if (thickness != null) map.put("thickness", thickness);
            if (sheen != null) map.put("sheen", sheen);
            if (sheenRoughness != null) map.put("sheenRoughness", sheenRoughness);
            if (sheenColor != null) map.put("sheenColor", sheenColor);
            if (attenuationColor != null) map.put("attenuationColor", attenuationColor);
            if (attenuationDistance != null) map.put("attenuationDistance", attenuationDistance);
            if (iridescence != null) map.put("iridescence", iridescence);
            if (iridescenceIOR != null) map.put("iridescenceIOR", iridescenceIOR);
            if (iridescenceThicknessRange != null) map.put("iridescenceThicknessRange", iridescenceThicknessRange);
            if (specularIntensity != null) map.put("specularIntensity", specularIntensity);
            if (specularColor != null) map.put("specularColor", specularColor);
            if (reflectivity != null) map.put("reflectivity", reflectivity);
            if (dispersion != null) map.put("dispersion", dispersion);
            if (anisotropy != null) map.put("anisotropy", anisotropy);
            if (anisotropyRotation != null) map.put("anisotropyRotation", anisotropyRotation);
            if (mapUrl != null) map.put("mapUrl", mapUrl);
            if (normalMapUrl != null) map.put("normalMapUrl", normalMapUrl);
            if (roughnessMapUrl != null) map.put("roughnessMapUrl", roughnessMapUrl);
            if (metalnessMapUrl != null) map.put("metalnessMapUrl", metalnessMapUrl);
            if (emissiveMapUrl != null) map.put("emissiveMapUrl", emissiveMapUrl);
            if (aoMapUrl != null) map.put("aoMapUrl", aoMapUrl);
            if (alphaMapUrl != null) map.put("alphaMapUrl", alphaMapUrl);
            if (bumpMapUrl != null) map.put("bumpMapUrl", bumpMapUrl);
            if (displacementMapUrl != null) map.put("displacementMapUrl", displacementMapUrl);
            if (normalScale != null) map.put("normalScale", normalScale);
            if (bumpScale != null) map.put("bumpScale", bumpScale);
            if (displacementScale != null) map.put("displacementScale", displacementScale);
            if (displacementBias != null) map.put("displacementBias", displacementBias);
            if (aoMapIntensity != null) map.put("aoMapIntensity", aoMapIntensity);
            if (mapRepeat != null) map.put("mapRepeat", mapRepeat);
            if (mapOffset != null) map.put("mapOffset", mapOffset);
            if (mapRotation != null) map.put("mapRotation", mapRotation);
            return map;
        }
    }

    public static class ViewMaterialChangeCommandSimple {
        public String color = null;
        public Double opacity = null;
        public Boolean transparent = null;
        public Boolean visible = null;
        public Boolean wireframe = null;
        public Integer side = null;
        public Boolean fog = null;
        public String emissive = null;
        public Double emissiveIntensity = null;

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            if (color != null) map.put("color", color);
            if (opacity != null) map.put("opacity", opacity);
            if (transparent != null) map.put("transparent", transparent);
            if (visible != null) map.put("visible", visible);
            if (wireframe != null) map.put("wireframe", wireframe);
            if (side != null) map.put("side", side);
            if (fog != null) map.put("fog", fog);
            if (emissive != null) map.put("emissive", emissive);
            if (emissiveIntensity != null) map.put("emissiveIntensity", emissiveIntensity);
            return map;
        }
    }
}
