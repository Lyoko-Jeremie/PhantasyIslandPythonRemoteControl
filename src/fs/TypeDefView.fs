namespace PhantasyIslandRemoteControl.Radio

open System.Collections.Generic

type ViewMaterialChangeCommand() =
    member val MaterialType: string = null with get, set
    member val Color: string = null with get, set
    member val Opacity: float32 option = None with get, set
    member val Transparent: bool option = None with get, set
    member val Visible: bool option = None with get, set
    member val Wireframe: bool option = None with get, set
    member val Side: int option = None with get, set
    member val DepthTest: bool option = None with get, set
    member val DepthWrite: bool option = None with get, set
    member val AlphaTest: float32 option = None with get, set
    member val Blending: int option = None with get, set
    member val VertexColors: bool option = None with get, set
    member val Fog: bool option = None with get, set
    member val Emissive: string = null with get, set
    member val EmissiveIntensity: float32 option = None with get, set
    member val Metalness: float32 option = None with get, set
    member val Roughness: float32 option = None with get, set
    member val EnvMapIntensity: float32 option = None with get, set
    member val FlatShading: bool option = None with get, set
    member val Shininess: float32 option = None with get, set
    member val Specular: string = null with get, set
    member val Clearcoat: float32 option = None with get, set
    member val ClearcoatRoughness: float32 option = None with get, set
    member val Transmission: float32 option = None with get, set
    member val Ior: float32 option = None with get, set
    member val Thickness: float32 option = None with get, set
    member val Sheen: float32 option = None with get, set
    member val SheenRoughness: float32 option = None with get, set
    member val SheenColor: string = null with get, set
    member val AttenuationColor: string = null with get, set
    member val AttenuationDistance: float32 option = None with get, set
    member val Iridescence: float32 option = None with get, set
    member val IridescenceIOR: float32 option = None with get, set
    member val IridescenceThicknessRange: List<float32> = null with get, set
    member val SpecularIntensity: float32 option = None with get, set
    member val SpecularColor: string = null with get, set
    member val Reflectivity: float32 option = None with get, set
    member val Dispersion: float32 option = None with get, set
    member val Anisotropy: float32 option = None with get, set
    member val AnisotropyRotation: float32 option = None with get, set
    member val MapUrl: string = null with get, set
    member val NormalMapUrl: string = null with get, set
    member val RoughnessMapUrl: string = null with get, set
    member val MetalnessMapUrl: string = null with get, set
    member val EmissiveMapUrl: string = null with get, set
    member val AoMapUrl: string = null with get, set
    member val AlphaMapUrl: string = null with get, set
    member val BumpMapUrl: string = null with get, set
    member val DisplacementMapUrl: string = null with get, set
    member val NormalScale: List<float32> = null with get, set
    member val BumpScale: float32 option = None with get, set
    member val DisplacementScale: float32 option = None with get, set
    member val DisplacementBias: float32 option = None with get, set
    member val AoMapIntensity: float32 option = None with get, set
    member val MapRepeat: List<float32> = null with get, set
    member val MapOffset: List<float32> = null with get, set
    member val MapRotation: float32 option = None with get, set

    member this.ToDict() =
        let dict = Dictionary<string, obj>()
        let props = this.GetType().GetProperties()
        for prop in props do
            let value = prop.GetValue(this)
            if value <> null && prop.Name <> "ToDict" then
                let name = prop.Name.[0].ToString().ToLower() + prop.Name.Substring(1)
                dict.[name] <- value
        dict

type ViewMaterialChangeCommandSimple() =
    member val Color: string = null with get, set
    member val Opacity: float32 option = None with get, set
    member val Transparent: bool option = None with get, set
    member val Visible: bool option = None with get, set
    member val Wireframe: bool option = None with get, set
    member val Side: int option = None with get, set
    member val Fog: bool option = None with get, set
    member val Emissive: string = null with get, set
    member val EmissiveIntensity: float32 option = None with get, set

    member this.ToDict() =
        let dict = Dictionary<string, obj>()
        let props = this.GetType().GetProperties()
        for prop in props do
            let value = prop.GetValue(this)
            if value <> null && prop.Name <> "ToDict" then
                let name = prop.Name.[0].ToString().ToLower() + prop.Name.Substring(1)
                dict.[name] <- value
        dict
