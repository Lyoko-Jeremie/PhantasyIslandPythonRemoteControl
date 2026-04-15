namespace PhantasyIslandRemoteControl

open System
open System.Collections.Generic
open System.Text.Json
open System.Threading.Tasks

type AirplaneController() =
    inherit AirplaneCore()
    
    let mutable _count = 1
    let mutable _sendCmdFn: string -> Async<JsonElement option> = HttpLayer.sendCmd

    member this.UseFastMode(?fastMode: bool, ?asyncMode: bool) =
        let fast = defaultArg fastMode true
        let asyncM = defaultArg asyncMode true
        if asyncM then
            _sendCmdFn <- if fast then HttpLayer.sendCmdVolatile else HttpLayer.sendCmd
        else
            // Wrapper to run async as sync if needed, though in F# we prefer async
            _sendCmdFn <- fun s -> 
                let res = if fast then HttpLayer.sendCmdVolatile s else HttpLayer.sendCmd s
                async { return Async.RunSynchronously res }

    member private this.NextCount() =
        _count <- _count + 2
        string _count

    member private this.PrepareCommand(command: string) =
        sprintf "%s %s %s" this.KeyName (this.NextCount()) command

    member private this.SendCommand(command: string) =
        _sendCmdFn (this.PrepareCommand(command))

    member this.Mode(mode: int) = this.AirplaneMode(mode)
    member this.Takeoff(high: int) = this.SendCommand(sprintf "takeoff %d" high)
    member this.Land() = this.SendCommand("land")
    member this.Emergency() = this.SendCommand("emergency")
    member this.Up(distance: int) = this.SendCommand(sprintf "up %d" distance)
    member this.Down(distance: int) = this.SendCommand(sprintf "down %d" distance)
    member this.Forward(distance: int) = this.SendCommand(sprintf "forward %d" distance)
    member this.Back(distance: int) = this.SendCommand(sprintf "back %d" distance)
    member this.Left(distance: int) = this.SendCommand(sprintf "left %d" distance)
    member this.Right(distance: int) = this.SendCommand(sprintf "right %d" distance)
    member this.Goto(x: int, y: int, h: int) = this.SendCommand(sprintf "goto %d %d %d" x y h)
    member this.Flip(direction: string) = this.SendCommand(sprintf "flip %s 1" direction)
    member this.FlipForward() = this.Flip("f")
    member this.FlipBack() = this.Flip("b")
    member this.FlipLeft() = this.Flip("l")
    member this.FlipRight() = this.Flip("r")
    member this.Rotate(degree: int) = this.SendCommand(sprintf "rotate %d" degree)
    member this.Cw(degree: int) = this.SendCommand(sprintf "cw %d" degree)
    member this.Ccw(degree: int) = this.SendCommand(sprintf "ccw %d" degree)
    member this.High(high: int) = this.SendCommand(sprintf "high %d" high)
    member this.Speed(speed: int) = this.SendCommand(sprintf "setSpeed %d" speed)
    member this.Led(r: int, g: int, b: int) = this.SendCommand(sprintf "light %d %d %d" r g b)
    member this.Bln(r: int, g: int, b: int) = this.SendCommand(sprintf "bln %d %d %d" r g b)
    member this.Rainbow(r: int, g: int, b: int) = this.SendCommand(sprintf "rainbow %d %d %d" r g b)
    member this.AirplaneMode(mode: int) = this.SendCommand(sprintf "airplane_mode %d" mode)
    member this.Stop() = this.Hover()
    member this.Hover() = this.SendCommand("hover")

type AirplaneManager private () =
    let _airplanesTable = Dictionary<string, AirplaneController>()

    static let _instance = AirplaneManager()
    static member Instance = _instance

    member this.AirplanesTable = _airplanesTable

    member this.Ping() = HttpLayer.ping()
    member this.Start() = HttpLayer.start()

    member this.GetAirplane(id: string) =
        match _airplanesTable.TryGetValue(id) with
        | (true, air) -> Some air
        | _ -> None

    member this.Flush() =
        async {
            let! statusJson = HttpLayer.getAllAirplaneStatus()
            let airplaneStatus = HttpLayer.processAirplane(statusJson)
            if airplaneStatus <> null then
                for kv in airplaneStatus do
                    let statusDict = kv.Value :?> Dictionary<string, obj>
                    let key = kv.Key
                    let air = 
                        if _airplanesTable.ContainsKey(key) then
                            _airplanesTable.[key]
                        else
                            let a = AirplaneController()
                            _airplanesTable.[key] <- a
                            a
                    
                    air.KeyName <- statusDict.["keyName"] :?> string
                    air.TypeName <- statusDict.["typeName"] :?> string
                    air.UpdateTimestamp <- statusDict.["updateTimestamp"] :?> double
                    air.Status <- Some(AirplaneFlyStatus.FromJson(statusDict.["status"] :?> JsonElement))
                    air.CameraFront <- statusDict.["cameraFront"] :?> string
                    air.CameraDown <- statusDict.["cameraDown"] :?> string
        }

type UAV() =
    let _airs = AirplaneManager.Instance

    do
        _airs.Flush() |> Async.RunSynchronously
        _airs.Start() |> Async.Ignore |> Async.RunSynchronously
        _airs.Flush() |> Async.RunSynchronously

    member this.Sleep(seconds: int) = Task.Delay(TimeSpan.FromSeconds(float seconds)).Wait()
    member this.AddUav(port: string) = _airs.Flush() |> Async.RunSynchronously
    member private this.P(port: string) = _airs.GetAirplane(port)

    member this.Land(port: string) = 
        match this.P(port) with
        | Some air -> air.Land() |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Takeoff(port: string, high: int) = 
        match this.P(port) with
        | Some air -> air.Takeoff(high) |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Up(port: string, dist: int) = 
        match this.P(port) with
        | Some air -> air.Up(dist) |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Down(port: string, dist: int) = 
        match this.P(port) with
        | Some air -> air.Down(dist) |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Forward(port: string, dist: int) = 
        match this.P(port) with
        | Some air -> air.Forward(dist) |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Back(port: string, dist: int) = 
        match this.P(port) with
        | Some air -> air.Back(dist) |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Left(port: string, dist: int) = 
        match this.P(port) with
        | Some air -> air.Left(dist) |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Right(port: string, dist: int) = 
        match this.P(port) with
        | Some air -> air.Right(dist) |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Goto(port: string, x: int, y: int, h: int) = 
        match this.P(port) with
        | Some air -> air.Goto(x, y, h) |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Rotate(port: string, deg: int) = 
        match this.P(port) with
        | Some air -> air.Rotate(deg) |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Stop(port: string) = 
        match this.P(port) with
        | Some air -> air.Stop() |> Async.RunSynchronously |> ignore
        | None -> ()

    member this.Hover(port: string) = 
        match this.P(port) with
        | Some air -> air.Hover() |> Async.RunSynchronously |> ignore
        | None -> ()

type FH0A() =
    inherit UAV()
