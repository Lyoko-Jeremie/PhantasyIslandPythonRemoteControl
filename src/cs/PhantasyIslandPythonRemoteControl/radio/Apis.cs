using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace PhantasyIslandPythonRemoteControl.Radio
{
    public class DebugApi : ApiModule
    {
        public DebugApi(RadioManager rm) : base(rm) { }
        public object Ping() => SendInternal("ping", waitCmd: "pong");
    }

    public class SceneApi : ApiModule
    {
        public SceneApi(RadioManager rm) : base(rm) { }
        public object ListAllMeshObjectInScene() => SendInternal("scene.listAllMeshObjectInScene");
        public object GetObjectInfoById(string objectId) => SendInternal("scene.getObjectInfoById", new Dictionary<string, object> { ["objectId"] = objectId });
        public object RemoveObjectById(string objectId) => SendInternal("scene.removeObjectById", new Dictionary<string, object> { ["objectId"] = objectId });
        public object MoveObjectById(string objectId, XYZ position) => SendInternal("scene.moveObjectById", new Dictionary<string, object> { ["objectId"] = objectId, ["position"] = position.ToList() });
        public object SetObjectRadioMaterial(string objectId, string materialId, double? thickness_m) => SendInternal("scene.setObjectRadioMaterial", new Dictionary<string, object> { ["objectId"] = objectId, ["materialId"] = materialId, ["thickness_m"] = thickness_m });
    }

    public class FlyApi : ApiModule
    {
        public FlyApi(RadioManager rm) : base(rm) { }
        public object ListFlyObject() => SendInternal("fly.listFlyObject");
        public object GetFlyObjectInfo(string keyName) => SendInternal("fly.getFlyObjectInfo", new Dictionary<string, object> { ["keyName"] = keyName });
        public object GetFlyObjectCameraImageDown(string keyName) => SendInternal("fly.getFlyObjectCameraImageDown", new Dictionary<string, object> { ["keyName"] = keyName });
        public object GetFlyObjectCameraImageFront(string keyName) => SendInternal("fly.getFlyObjectCameraImageFront", new Dictionary<string, object> { ["keyName"] = keyName });
    }

    public class RadioApi : ApiModule
    {
        public RadioApi(RadioManager rm) : base(rm) { }
        public object IsSceneInit() => SendInternal("radio.isSceneInit", postProcessor: d => d.GetProperty("init").GetBoolean());
        public object IsRadioReachabilityCheckerInit() => SendInternal("radio.isRadioReachabilityCheckerInit", postProcessor: d => d.GetProperty("init").GetBoolean());
        public object CheckReachability(XYZ aTx, XYZ bRx, RadioCheckOptions options) => SendInternal("radio.checkReachability", new Dictionary<string, object> { ["aTx"] = aTx.ToList(), ["bRx"] = bRx.ToList(), ["options"] = options?.ToDict() });
        public object UpdateObjectPos(string objectId, XYZ position) => SendInternal("radio.updateObjectPos", new Dictionary<string, object> { ["objectId"] = objectId, ["position"] = position.ToList() });
        public object UpdateMeshRadioMaterial(string meshId, string materialId, double? thickness_m) => SendInternal("radio.updateMeshRadioMaterial", new Dictionary<string, object> { ["meshId"] = meshId, ["materialId"] = materialId, ["thickness_m"] = thickness_m });
        public object GetAllRadioMaterial() => SendInternal("radio.getAllRadioMaterial", postProcessor: d => d.GetProperty("meshIds").EnumerateArray().Select(n => ParseMaterial(n)).ToList());
        public object LocalRadioMaterial() => SendInternal("radio.localRadioMaterial", postProcessor: d => d.GetProperty("meshIds").EnumerateArray().Select(n => ParseMaterial(n)).ToList());
        public object ListRadioLocalObjectsIds() => SendInternal("radio.listRadioLocalObjects", postProcessor: d => d.GetProperty("localObjectIds").EnumerateArray().Select(n => n.GetString()).ToList());

        private RadioMaterialProperties ParseMaterial(JsonElement n) => new RadioMaterialProperties
        {
            Id = n.GetProperty("id").GetString(),
            DisplayName = n.GetProperty("displayName").GetString(),
            PenetrationLoss_dBPerMeter = n.GetProperty("penetrationLoss_dBPerMeter").GetDouble(),
            ReflectionCoefficient = n.GetProperty("reflectionCoefficient").GetDouble(),
            DefaultThickness_m = n.GetProperty("defaultThickness_m").GetDouble()
        };
    }
}
