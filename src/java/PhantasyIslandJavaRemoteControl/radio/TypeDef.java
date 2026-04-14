package PhantasyIslandJavaRemoteControl.radio;

import java.util.HashMap;
import java.util.Map;

/**
 * Python 等价类型定义，对应 TypeScript TypeBox 定义的类型。
 */
public class TypeDef {

    /**
     * 三维坐标，单位米，格式 (x, y, z)
     */
    public static class XYZ {
        public double x, y, z;

        public XYZ(double x, double y, double z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        public double[] toArray() {
            return new double[]{x, y, z};
        }

        public static XYZ fromArray(Object data) {
            if (data instanceof double[]) {
                double[] arr = (double[]) data;
                return new XYZ(arr[0], arr[1], arr[2]);
            } else if (data instanceof java.util.List) {
                java.util.List<?> list = (java.util.List<?>) data;
                return new XYZ(
                    ((Number) list.get(0)).doubleValue(),
                    ((Number) list.get(1)).doubleValue(),
                    ((Number) list.get(2)).doubleValue()
                );
            }
            return null;
        }
    }

    /**
     * 链路可达性检查的可选参数。
     */
    public static class RadioCheckOptions {
        public Double frequencyMHz = null;
        public Double txPowerDbm = null;
        public Double rxSensitivityDbm = null;
        public Double fresnelZoneRatio = null;
        public Boolean skipFresnelZoneCheck = null;
        public Boolean enableMultipath = null;
        public Double maxReflectionPaths = null;
        public Double maxReflectionPathLengthRatio = null;
        public Double defaultTxAntennaGain_dBi = null;
        public Double defaultRxAntennaGain_dBi = null;
        public Boolean enableAntennaPattern = null;
        public Boolean enableMutualCoupling = null;
        public Double couplingNegligibleThresholdWavelengths = null;
        public Boolean enableSINR = null;
        public Double receiverBandwidthHz = null;
        public Double minSINR_dB = null;
        public Boolean enableFrequencyIsolation = null;
        public Boolean enableNearFieldCorrection = null;
        public Boolean enableNodeBodyOcclusion = null;

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            if (frequencyMHz != null) map.put("frequencyMHz", frequencyMHz);
            if (txPowerDbm != null) map.put("txPowerDbm", txPowerDbm);
            if (rxSensitivityDbm != null) map.put("rxSensitivityDbm", rxSensitivityDbm);
            if (fresnelZoneRatio != null) map.put("fresnelZoneRatio", fresnelZoneRatio);
            if (skipFresnelZoneCheck != null) map.put("skipFresnelZoneCheck", skipFresnelZoneCheck);
            if (enableMultipath != null) map.put("enableMultipath", enableMultipath);
            if (maxReflectionPaths != null) map.put("maxReflectionPaths", maxReflectionPaths);
            if (maxReflectionPathLengthRatio != null) map.put("maxReflectionPathLengthRatio", maxReflectionPathLengthRatio);
            if (defaultTxAntennaGain_dBi != null) map.put("defaultTxAntennaGain_dBi", defaultTxAntennaGain_dBi);
            if (defaultRxAntennaGain_dBi != null) map.put("defaultRxAntennaGain_dBi", defaultRxAntennaGain_dBi);
            if (enableAntennaPattern != null) map.put("enableAntennaPattern", enableAntennaPattern);
            if (enableMutualCoupling != null) map.put("enableMutualCoupling", enableMutualCoupling);
            if (couplingNegligibleThresholdWavelengths != null) map.put("couplingNegligibleThresholdWavelengths", couplingNegligibleThresholdWavelengths);
            if (enableSINR != null) map.put("enableSINR", enableSINR);
            if (receiverBandwidthHz != null) map.put("receiverBandwidthHz", receiverBandwidthHz);
            if (minSINR_dB != null) map.put("minSINR_dB", minSINR_dB);
            if (enableFrequencyIsolation != null) map.put("enableFrequencyIsolation", enableFrequencyIsolation);
            if (enableNearFieldCorrection != null) map.put("enableNearFieldCorrection", enableNearFieldCorrection);
            if (enableNodeBodyOcclusion != null) map.put("enableNodeBodyOcclusion", enableNodeBodyOcclusion);
            return map;
        }
    }

    /**
     * 电磁材料属性定义。
     */
    public static class RadioMaterialProperties {
        public String id;
        public String displayName;
        public double penetrationLoss_dBPerMeter;
        public double reflectionCoefficient;
        public double defaultThickness_m;

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("id", id);
            map.put("displayName", displayName);
            map.put("penetrationLoss_dBPerMeter", penetrationLoss_dBPerMeter);
            map.put("reflectionCoefficient", reflectionCoefficient);
            map.put("defaultThickness_m", defaultThickness_m);
            return map;
        }

        public static RadioMaterialProperties fromMap(Map<String, Object> data) {
            RadioMaterialProperties p = new RadioMaterialProperties();
            p.id = (String) data.get("id");
            p.displayName = (String) data.get("displayName");
            p.penetrationLoss_dBPerMeter = ((Number) data.get("penetrationLoss_dBPerMeter")).doubleValue();
            p.reflectionCoefficient = ((Number) data.get("reflectionCoefficient")).doubleValue();
            p.defaultThickness_m = ((Number) data.get("defaultThickness_m")).doubleValue();
            return p;
        }
    }

    /**
     * 摇杆输入消息。
     */
    public static class JoyStickInput {
        public double vx = 0.0;
        public double vy = 0.0;
        public double vz = 0.0;
        public double yawRate = 0.0;

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("vx", vx);
            map.put("vy", vy);
            map.put("vz", vz);
            map.put("yawRate", yawRate);
            return map;
        }
    }
}
