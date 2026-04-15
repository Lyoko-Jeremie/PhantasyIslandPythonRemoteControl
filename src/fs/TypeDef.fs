namespace PhantasyIslandRemoteControl.Radio

open System.Collections.Generic

type XYZ(x: double, y: double, z: double) =
    member val X = x with get, set
    member val Y = y with get, set
    member val Z = z with get, set

    member this.ToList() = [ this.X; this.Y; this.Z ]
    static member FromList(list: IList<double>) = XYZ(list.[0], list.[1], list.[2])

type RadioCheckOptions() =
    member val FrequencyMHz: double option = None with get, set
    member val TxPowerDbm: double option = None with get, set
    member val RxSensitivityDbm: double option = None with get, set
    member val FresnelZoneRatio: double option = None with get, set
    member val SkipFresnelZoneCheck: bool option = None with get, set
    member val EnableMultipath: bool option = None with get, set
    member val MaxReflectionPaths: double option = None with get, set
    member val MaxReflectionPathLengthRatio: double option = None with get, set
    member val DefaultTxAntennaGain_dBi: double option = None with get, set
    member val DefaultRxAntennaGain_dBi: double option = None with get, set
    member val EnableAntennaPattern: bool option = None with get, set
    member val EnableMutualCoupling: bool option = None with get, set
    member val CouplingNegligibleThresholdWavelengths: double option = None with get, set
    member val EnableSINR: bool option = None with get, set
    member val ReceiverBandwidthHz: double option = None with get, set
    member val MinSINR_dB: double option = None with get, set
    member val EnableFrequencyIsolation: bool option = None with get, set
    member val EnableNearFieldCorrection: bool option = None with get, set
    member val EnableNodeBodyOcclusion: bool option = None with get, set

    member this.ToDict() =
        let dict = Dictionary<string, obj>()
        let props = this.GetType().GetProperties()
        for prop in props do
            let value = prop.GetValue(this)
            if value <> null && prop.Name <> "ToDict" then
                let name = prop.Name.[0].ToString().ToLower() + prop.Name.Substring(1)
                match value with
                | :? XYZ as xyz -> dict.[name] <- xyz.ToList()
                | _ -> dict.[name] <- value
        dict

type RadioMaterialProperties() =
    member val Id = "" with get, set
    member val DisplayName = "" with get, set
    member val PenetrationLoss_dBPerMeter = 0.0 with get, set
    member val ReflectionCoefficient = 0.0 with get, set
    member val DefaultThickness_m = 0.0 with get, set

    member this.ToDict() =
        let dict = Dictionary<string, obj>()
        dict.["id"] <- this.Id
        dict.["displayName"] <- this.DisplayName
        dict.["penetrationLoss_dBPerMeter"] <- this.PenetrationLoss_dBPerMeter
        dict.["reflectionCoefficient"] <- this.ReflectionCoefficient
        dict.["defaultThickness_m"] <- this.DefaultThickness_m
        dict

type JoyStickInput() =
    member val Vx = 0.0 with get, set
    member val Vy = 0.0 with get, set
    member val Vz = 0.0 with get, set
    member val YawRate = 0.0 with get, set

    member this.ToDict() =
        let dict = Dictionary<string, obj>()
        dict.["vx"] <- this.Vx
        dict.["vy"] <- this.Vy
        dict.["vz"] <- this.Vz
        dict.["yawRate"] <- this.YawRate
        dict
