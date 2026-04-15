namespace PhantasyIslandRemoteControl

open System
open System.Text.Json
open System.Threading.Tasks

type AirplaneFlyStatus =
    { Landing: bool
      IsStop: bool
      X: double
      Y: double
      H: double
      RX: double
      RY: double
      RZ: double }

    static member FromJson(flyStatus: JsonElement) =
        { Landing = flyStatus.GetProperty("landing").GetBoolean()
          IsStop = flyStatus.GetProperty("isStop").GetBoolean()
          X = flyStatus.GetProperty("x").GetDouble()
          Y = flyStatus.GetProperty("y").GetDouble()
          H = flyStatus.GetProperty("h").GetDouble()
          RX = flyStatus.GetProperty("rX").GetDouble()
          RY = flyStatus.GetProperty("rY").GetDouble()
          RZ = flyStatus.GetProperty("rZ").GetDouble() }

type ImageInfo =
    { mutable Img: byte[]
      Id: int
      TotalCount: int
      mutable ProgressCount: int
      mutable Ok: bool }

type IAirplane =
    abstract member KeyName : string with get, set
    abstract member GetCameraFrontImg : unit -> Async<string>

type ImageReceiver(airplane: IAirplane) =
    let mutable _imageInstance: ImageInfo option = None
    let mutable _cmdIdCounter = 1
    let mutable _nowLoadingId = 0
    let _lock = obj()

    member this.SendCapImage(receiveCallback: Action<byte[]>, progressCallback: Action<int, int>) =
        Task.Run(fun () ->
            async {
                let currentId = lock _lock (fun () ->
                    _cmdIdCounter <- _cmdIdCounter + 1
                    _nowLoadingId <- _cmdIdCounter
                    _cmdIdCounter)
                
                let! frontImgStr = airplane.GetCameraFrontImg()
                let imgData = ImageProcess.readB64Img frontImgStr
                
                let instance = { Img = imgData; Id = currentId; TotalCount = 300; ProgressCount = 0; Ok = false }
                lock _lock (fun () -> _imageInstance <- Some instance)

                let mutable loop = true
                while loop do
                    let shouldContinue = lock _lock (fun () ->
                        match _imageInstance with
                        | Some inst when inst.Id = _nowLoadingId && inst.ProgressCount < inst.TotalCount ->
                            inst.ProgressCount <- inst.ProgressCount + 1
                            true
                        | _ -> false)
                    
                    if not shouldContinue then loop <- false
                    else
                        if progressCallback <> null then
                            let inst = _imageInstance.Value
                            progressCallback.Invoke(inst.ProgressCount, inst.TotalCount)
                        do! Async.Sleep 10

                lock _lock (fun () ->
                    match _imageInstance with
                    | Some inst when inst.Id = _nowLoadingId ->
                        inst.Ok <- true
                        if receiveCallback <> null then receiveCallback.Invoke(inst.Img)
                    | _ -> ())
            } |> Async.RunSynchronously
        ) |> ignore

    member this.GetLatestImage() =
        lock _lock (fun () ->
            match _imageInstance with
            | Some inst when inst.Ok -> inst.Img
            | _ -> null)

    member this.GetTransferProgress() =
        lock _lock (fun () ->
            match _imageInstance with
            | Some inst -> Nullable(inst.ProgressCount)
            | _ -> Nullable())

    member this.IsTransferInProgress() =
        lock _lock (fun () ->
            match _imageInstance with
            | Some inst -> not inst.Ok
            | _ -> false)

type AirplaneCore() as this =
    let mutable _keyName = ""
    let mutable _typeName = ""
    let mutable _updateTimestamp = 0.0
    let mutable _status = None
    let mutable _cameraFront = ""
    let mutable _cameraDown = ""
    
    let _imageReceiver = ImageReceiver(this)

    interface IAirplane with
        member this.KeyName with get() = _keyName and set(v) = _keyName <- v
        member this.GetCameraFrontImg() = this.GetCameraFrontImg()

    member val KeyName = "" with get, set
    member val TypeName = "" with get, set
    member val UpdateTimestamp = 0.0 with get, set
    member val Status: AirplaneFlyStatus option = None with get, set
    member val CameraFront = "" with get, set
    member val CameraDown = "" with get, set

    member this.CapImage(receiveCallback: Action<byte[]>, progressCallback: Action<int, int>) =
        _imageReceiver.SendCapImage(receiveCallback, progressCallback)

    member this.GetImageTransferProgress() = _imageReceiver.GetTransferProgress()
    member this.IsImageTransferInProgress() = _imageReceiver.IsTransferInProgress()
    member this.GetLatestImage() = _imageReceiver.GetLatestImage()

    member this.GetCameraFrontImg() =
        HttpLayer.getAirplaneCameraImage this.KeyName "front"

    member this.GetCameraDownImg() =
        HttpLayer.getAirplaneCameraImage this.KeyName "down"
