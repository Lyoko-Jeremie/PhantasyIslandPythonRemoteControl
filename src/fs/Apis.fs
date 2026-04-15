namespace PhantasyIslandRemoteControl.Radio

open System
open System.Collections.Generic
open System.Text.Json
open System.Linq

type DebugApi(rm: IRadioManager) =
    inherit ApiModule(rm)
    member this.Ping() = this.SendInternal("ping", waitCmd = "pong")

type SceneApi(rm: IRadioManager) =
    inherit ApiModule(rm)
    
    member this.ListAllMeshObjectInScene() = this.SendInternal("scene.listAllMeshObjectInScene")

    member this.GetObjectInfoById(objectId: string) =
        let data = Dictionary<string, obj>()
        data.["objectId"] <- objectId
        this.SendInternal("scene.getObjectInfoById", data)

    member this.RemoveObjectById(objectId: string) =
        let data = Dictionary<string, obj>()
        data.["objectId"] <- objectId
        this.SendInternal("scene.removeObjectById", data)

    member this.MoveObjectById(objectId: string, position: XYZ) =
        let data = Dictionary<string, obj>()
        data.["objectId"] <- objectId
        data.["position"] <- position.ToList()
        this.SendInternal("scene.moveObjectById", data)

    member this.SetObjectRadioMaterial(objectId: string, materialId: string, thickness_m: Nullable<double>) =
        let data = Dictionary<string, obj>()
        data.["objectId"] <- objectId
        data.["materialId"] <- materialId
        data.["thickness_m"] <- if thickness_m.HasValue then thickness_m.Value :> obj else null
        this.SendInternal("scene.setObjectRadioMaterial", data)

    member this.UpdateMeshViewMaterial(meshId: string, command: ViewMaterialChangeCommand) =
        let data = Dictionary<string, obj>()
        data.["meshId"] <- meshId
        data.["viewMaterialChangeCommand"] <- command.ToDict()
        this.SendInternal("scene.updateMeshViewMaterial", data)

    member this.UpdateMeshViewMaterialSimple(meshId: string, command: ViewMaterialChangeCommandSimple) =
        let data = Dictionary<string, obj>()
        data.["meshId"] <- meshId
        data.["viewMaterialChangeCommandSimple"] <- command.ToDict()
        this.SendInternal("scene.updateMeshViewMaterialSimple", data)

type FlyApi(rm: IRadioManager) =
    inherit ApiModule(rm)
    
    member this.ListFlyObject() = this.SendInternal("fly.listFlyObject")

    member this.GetFlyObjectInfo(keyName: string) =
        let data = Dictionary<string, obj>()
        data.["keyName"] <- keyName
        this.SendInternal("fly.getFlyObjectInfo", data)

    member this.GetFlyObjectCameraImageDown(keyName: string) =
        let data = Dictionary<string, obj>()
        data.["keyName"] <- keyName
        this.SendInternal("fly.getFlyObjectCameraImageDown", data)

    member this.GetFlyObjectCameraImageFront(keyName: string) =
        let data = Dictionary<string, obj>()
        data.["keyName"] <- keyName
        this.SendInternal("fly.getFlyObjectCameraImageFront", data)

type RadioApi(rm: IRadioManager) =
    inherit ApiModule(rm)

    let parseMaterial (n: JsonElement) =
        let m = RadioMaterialProperties()
        m.Id <- n.GetProperty("id").GetString()
        m.DisplayName <- n.GetProperty("displayName").GetString()
        m.PenetrationLoss_dBPerMeter <- n.GetProperty("penetrationLoss_dBPerMeter").GetDouble()
        m.ReflectionCoefficient <- n.GetProperty("reflectionCoefficient").GetDouble()
        m.DefaultThickness_m <- n.GetProperty("defaultThickness_m").GetDouble()
        m

    member this.IsSceneInit() =
        this.SendInternal("radio.isSceneInit", postProcessor = Func<JsonElement, obj>(fun d -> d.GetProperty("init").GetBoolean() :> obj))

    member this.IsRadioReachabilityCheckerInit() =
        this.SendInternal("radio.isRadioReachabilityCheckerInit", postProcessor = Func<JsonElement, obj>(fun d -> d.GetProperty("init").GetBoolean() :> obj))

    member this.CheckReachability(aTx: XYZ, bRx: XYZ, options: RadioCheckOptions) =
        let data = Dictionary<string, obj>()
        data.["aTx"] <- aTx.ToList()
        data.["bRx"] <- bRx.ToList()
        data.["options"] <- if not (Object.ReferenceEquals(options, null)) then options.ToDict() :> obj else null
        this.SendInternal("radio.checkReachability", data)

    member this.UpdateObjectPos(objectId: string, position: XYZ) =
        let data = Dictionary<string, obj>()
        data.["objectId"] <- objectId
        data.["position"] <- position.ToList()
        this.SendInternal("radio.updateObjectPos", data)

    member this.GetObjectPos(objectId: string) =
        let data = Dictionary<string, obj>()
        data.["objectId"] <- objectId
        this.SendInternal("radio.getObjectPos", data, postProcessor = Func<JsonElement, obj>(fun d -> 
            d.GetProperty("position").EnumerateArray().Select(fun n -> n.GetDouble()).ToList() :> obj))

    member this.UpdateMeshRadioMaterial(meshId: string, materialId: string, thickness_m: Nullable<double>) =
        let data = Dictionary<string, obj>()
        data.["meshId"] <- meshId
        data.["materialId"] <- materialId
        data.["thickness_m"] <- if thickness_m.HasValue then thickness_m.Value :> obj else null
        this.SendInternal("radio.updateMeshRadioMaterial", data)

    member this.GetAllRadioMaterial() =
        this.SendInternal("radio.getAllRadioMaterial", postProcessor = Func<JsonElement, obj>(fun d ->
            d.GetProperty("meshIds").EnumerateArray().Select(fun n -> parseMaterial n).ToList() :> obj))

    member this.LocalRadioMaterial() =
        this.SendInternal("radio.localRadioMaterial", postProcessor = Func<JsonElement, obj>(fun d ->
            d.GetProperty("meshIds").EnumerateArray().Select(fun n -> parseMaterial n).ToList() :> obj))

    member this.GetBuildingRadioMaterial() = this.SendInternal("radio.getBuildingRadioMaterial")

    member this.AddRadioMaterial(material: RadioMaterialProperties) =
        this.SendInternal("radio.addRadioMaterial", material.ToDict())

    member this.ListRadioLocalObjectsIds() =
        this.SendInternal("radio.listRadioLocalObjects", postProcessor = Func<JsonElement, obj>(fun d ->
            let mutable ids = JsonElement()
            if d.TryGetProperty("localObjectIds", &ids) then
                ids.EnumerateArray().Select(fun n -> n.GetString()).ToList() :> obj
            else
                List<string>() :> obj))
