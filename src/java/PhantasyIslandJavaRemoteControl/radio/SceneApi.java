package PhantasyIslandJavaRemoteControl.radio;

import java.util.HashMap;
import java.util.Map;

/**
 * 场景相关 API 模块。
 */
public class SceneApi extends ApiModule {
    public SceneApi(RadioManager rm) {
        super(rm);
    }

    public Object listAllMeshObjectInScene() {
        return send("scene.listAllMeshObjectInScene");
    }

    public Object getObjectInfoById(String objectId) {
        Map<String, Object> data = new HashMap<>();
        data.put("objectId", objectId);
        return send("scene.getObjectInfoById", data, null);
    }

    public Object removeObjectById(String objectId) {
        Map<String, Object> data = new HashMap<>();
        data.put("objectId", objectId);
        return send("scene.removeObjectById", data, null);
    }

    public Object moveObjectById(String objectId, TypeDef.XYZ position) {
        Map<String, Object> data = new HashMap<>();
        data.put("objectId", objectId);
        data.put("position", position.toArray());
        return send("scene.moveObjectById", data, null);
    }

    public Object setObjectRadioMaterial(String objectId, String materialId, Double thickness_m) {
        Map<String, Object> data = new HashMap<>();
        data.put("objectId", objectId);
        if (materialId != null) data.put("materialId", materialId);
        if (thickness_m != null) data.put("thickness_m", thickness_m);
        return send("scene.setObjectRadioMaterial", data, null);
    }

    public Object updateMeshViewMaterial(String meshId, TypeDefView.ViewMaterialChangeCommand viewMaterialChangeCommand) {
        Map<String, Object> data = new HashMap<>();
        data.put("meshId", meshId);
        data.put("viewMaterialChangeCommand", viewMaterialChangeCommand.toMap());
        return send("scene.updateMeshViewMaterial", data, null);
    }

    public Object updateMeshViewMaterialSimple(String meshId, TypeDefView.ViewMaterialChangeCommandSimple viewMaterialChangeCommandSimple) {
        Map<String, Object> data = new HashMap<>();
        data.put("meshId", meshId);
        data.put("viewMaterialChangeCommandSimple", viewMaterialChangeCommandSimple.toMap());
        return send("scene.updateMeshViewMaterialSimple", data, null);
    }
}
