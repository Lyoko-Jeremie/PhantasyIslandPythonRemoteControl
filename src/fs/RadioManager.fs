namespace PhantasyIslandRemoteControl.Radio

open System
open System.Collections.Concurrent
open System.Collections.Generic
open System.Text.Json
open System.Threading
open System.Threading.Tasks
open SocketIOClient

type RadioManager() =
    let mutable _socket: SocketIO = null
    let mutable _namespace = "/UserSide"
    let mutable _isSceneInit = false
    
    let _pendingWaiters = ConcurrentDictionary<string, List<WeakReference<WaitToken>>>()
    let _waitersLock = obj()

    interface IRadioManager with
        member this.InternalSend(cmd, ?data) = this.InternalSend(cmd, ?data = data)
        member this.SendWithToken(cmd, ?data, ?waitCmd, ?postProcessor) = this.SendWithToken(cmd, ?data = data, ?waitCmd = waitCmd, ?postProcessor = postProcessor)
        member this.SendAndWaitSync(cmd, ?data, ?waitCmd, ?timeout, ?postProcessor) = this.SendAndWaitSync(cmd, ?data = data, ?waitCmd = waitCmd, ?timeout = timeout, ?postProcessor = postProcessor)
        member this.SendAndWaitAsync(cmd, ?data, ?waitCmd, ?timeout, ?postProcessor) = this.SendAndWaitAsync(cmd, ?data = data, ?waitCmd = waitCmd, ?timeout = timeout, ?postProcessor = postProcessor)

    member this.Socket with get() = _socket and set(v) = _socket <- v
    member this.Namespace with get() = _namespace and set(v) = _namespace <- v
    member this.IsSceneInit with get() = _isSceneInit and set(v) = _isSceneInit <- v

    // API Properties
    member this.DebugApi = DebugApi(this :> IRadioManager)
    member this.SceneApi = SceneApi(this :> IRadioManager)
    member this.FlyApi = FlyApi(this :> IRadioManager)
    member this.RadioApi = RadioApi(this :> IRadioManager)

    member this.CreateMsgTimestampId() =
        DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() * 100L

    member this.Connect(?url: string, ?ns: string) =
        async {
            let urlVal = defaultArg url "http://127.0.0.1:60002"
            this.Namespace <- defaultArg ns "/UserSide"
            this.Reset()
            
            _socket <- new SocketIO(urlVal)
            this.InitListener()
            _socket.ConnectAsync() |> Async.AwaitTask |> ignore
        }

    member this.Reset() =
        if _socket <> null && _socket.Connected then
            _socket.DisconnectAsync().Wait()
        _isSceneInit <- false

    member private this.InitListener() =
        if _socket = null then ()
        else
            _socket.OnConnected.Add(fun _ ->
                printfn "[RadioManager] connected"
                this.CheckSceneStatus())

            _socket.OnDisconnected.Add(fun _ ->
                printfn "[RadioManager] disconnected"
                _isSceneInit <- false)

            _socket.On("message", fun response ->
                let data = response.GetValue<JsonElement>()
                printfn "[RadioManager] message: %s" (data.ToString())
                this.MsgDispatch(data) |> ignore)

    member private this.CheckSceneStatus() =
        this.InternalSend("ping")
        this.InternalSend("scene.getInitState")

    member this.Ping() =
        this.SendAndWaitSync("ping", waitCmd = "pong")

    member private this.OnSceneReset(data: JsonElement) =
        printfn "[RadioManager] handle sceneReset: %O" data
        _isSceneInit <- false

    member private this.OnSceneInit(data: JsonElement) =
        printfn "[RadioManager] handle sceneInit: %O" data
        _isSceneInit <- true

    member this.InternalSend(cmd: string, ?data: Dictionary<string, obj>) =
        let msg = Dictionary<string, obj>()
        msg.["cmd"] <- cmd
        match data with
        | Some d -> for kv in d do msg.[kv.Key] <- kv.Value
        | None -> ()
        
        if _socket <> null then
            _socket.EmitAsync("message", msg) |> ignore
        ()

    member this.SendWithToken(cmd: string, ?data: Dictionary<string, obj>, ?waitCmd: string, ?postProcessor: Func<JsonElement, obj>) =
        let wCmd = defaultArg waitCmd cmd
        let timeBaseId = this.CreateMsgTimestampId()
        let token = WaitToken(wCmd, timeBaseId)
        match postProcessor with
        | Some pp -> token.SetPostProcessor(pp) |> ignore
        | None -> ()

        lock _waitersLock (fun () ->
            let waiters = _pendingWaiters.GetOrAdd(wCmd, fun _ -> List<WeakReference<WaitToken>>())
            waiters.Add(WeakReference<WaitToken>(token)))

        let msg = Dictionary<string, obj>()
        msg.["timestampIdPython"] <- timeBaseId
        match data with
        | Some d -> 
            for kv in d do 
                if kv.Value <> null then msg.[kv.Key] <- kv.Value
        | None -> ()

        this.InternalSend(cmd, msg)
        token

    member this.SendAndWaitSync(cmd: string, ?data: Dictionary<string, obj>, ?waitCmd: string, ?timeout: double, ?postProcessor: Func<JsonElement, obj>) =
        let t = defaultArg timeout 3.0
        let token = this.SendWithToken(cmd, ?data = data, ?waitCmd = waitCmd, ?postProcessor = postProcessor)
        token.Wait(TimeSpan.FromSeconds(t))

    member this.SendAndWaitAsync(cmd: string, ?data: Dictionary<string, obj>, ?waitCmd: string, ?timeout: double, ?postProcessor: Func<JsonElement, obj>) =
        async {
            let t = defaultArg timeout 3.0
            let token = this.SendWithToken(cmd, ?data = data, ?waitCmd = waitCmd, ?postProcessor = postProcessor)
            let! taskResult = token.WaitAsync() |> Async.AwaitTask
            return taskResult
        }

    member private this.NotifyWaiters(cmd: string, data: JsonElement) =
        if String.IsNullOrEmpty cmd then false
        else
            let mutable tsProp = JsonElement()
            if not (data.TryGetProperty("timestampIdPython", &tsProp)) then false
            else
                let timestampId = tsProp.GetInt64()
                lock _waitersLock (fun () ->
                    match _pendingWaiters.TryGetValue(cmd) with
                    | (true, refs) ->
                        let surviving = List<WeakReference<WaitToken>>()
                        let mutable matched = false
                        for r in refs do
                            match r.TryGetTarget() with
                            | (true, token) ->
                                if not matched && token.TimeBaseId = timestampId then
                                    token.Complete(data)
                                    matched <- true
                                else
                                    surviving.Add(r)
                            | _ -> ()
                        
                        if surviving.Count > 0 then _pendingWaiters.[cmd] <- surviving
                        else _pendingWaiters.TryRemove(cmd) |> ignore
                        
                        matched
                    | _ -> false)

    member private this.MsgDispatch(data: JsonElement) : Task =
        let mutable cmdProp = JsonElement()
        if not (data.TryGetProperty("cmd", &cmdProp)) then
            printfn "[RadioManager] received message without cmd: %O" data
            Task.CompletedTask
        else
            let cmd = cmdProp.GetString()
            if not (this.NotifyWaiters(cmd, data)) then
                match cmd with
                | "pong" -> ()
                | "sceneReset" | "sceneNotInit" -> this.OnSceneReset(data)
                | "sceneInit" | "sceneIsInit" -> this.OnSceneInit(data)
                | _ -> printfn "[RadioManager] unknown cmd: %s, data: %O" cmd data
            Task.CompletedTask
