package PhantasyIslandJavaRemoteControl.radio;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 无线电相关 API 模块。
 */
public class RadioApi extends ApiModule {
    public RadioApi(RadioManager rm) {
        super(rm);
    }

    public Object isSceneInit() {
        return send("radio.isSceneInit", null, null, 3.0, d -> (Boolean) d.get("init"));
    }

    public Object isRadioReachabilityCheckerInit() {
        return send("radio.isRadioReachabilityCheckerInit", null, null, 3.0, d -> (Boolean) d.get("init"));
    }

    public Object checkReachability(TypeDef.XYZ aTx, TypeDef.XYZ bRx, TypeDef.RadioCheckOptions options) {
        Map<String, Object> data = new HashMap<>();
        data.put("aTx", aTx.toArray());
        data.put("bRx", bRx.toArray());
        if (options != null) {
            data.put("options", options.toMap());
        }
        return send("radio.checkReachability", data, null);
    }

    public Object updateObjectPos(String objectId, TypeDef.XYZ position) {
        Map<String, Object> data = new HashMap<>();
        data.put("objectId", objectId);
        data.put("position", position.toArray());
        return send("radio.updateObjectPos", data, null);
    }

    public Object getObjectPos(String objectId) {
        Map<String, Object> data = new HashMap<>();
        data.put("objectId", objectId);
        return send("radio.updateObjectPos", data, null, 3.0, d -> TypeDef.XYZ.fromArray(d.get("position")));
    }

    public Object updateMeshRadioMaterial(String meshId, String materialId, Double thickness_m) {
        Map<String, Object> data = new HashMap<>();
        data.put("meshId", meshId);
        if (materialId != null) data.put("materialId", materialId);
        if (thickness_m != null) data.put("thickness_m", thickness_m);
        return send("radio.updateMeshRadioMaterial", data, null);
    }

    @SuppressWarnings("unchecked")
    public Object getAllRadioMaterial() {
        return send("radio.getAllRadioMaterial", null, null, 3.0, d -> {
            List<Map<String, Object>> list = (List<Map<String, Object>>) d.get("meshIds");
            return list.stream().map(TypeDef.RadioMaterialProperties::fromMap).collect(Collectors.toList());
        });
    }

    @SuppressWarnings("unchecked")
    public Object localRadioMaterial() {
        return send("radio.localRadioMaterial", null, null, 3.0, d -> {
            List<Map<String, Object>> list = (List<Map<String, Object>>) d.get("meshIds");
            return list.stream().map(TypeDef.RadioMaterialProperties::fromMap).collect(Collectors.toList());
        });
    }

    public Object getBuildingRadioMaterial() {
        return send("radio.getBuildingRadioMaterial");
    }

    public Object addRadioMaterial(TypeDef.RadioMaterialProperties material) {
        return send("radio.addRadioMaterial", material.toMap(), null);
    }

    @SuppressWarnings("unchecked")
    public Object listRadioLocalObjectsIds() {
        return send("radio.listRadioLocalObjects", null, null, 3.0, d -> (List<String>) d.get("localObjectIds"));
    }
}
