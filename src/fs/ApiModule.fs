namespace PhantasyIslandRemoteControl.Radio

open System
open System.Collections.Generic
open System.Text.Json
open System.Threading.Tasks

type IRadioManager =
    abstract member InternalSend: cmd: string * ?data: Dictionary<string, obj> -> unit
    abstract member SendWithToken: cmd: string * ?data: Dictionary<string, obj> * ?waitCmd: string * ?postProcessor: Func<JsonElement, obj> -> WaitToken
    abstract member SendAndWaitSync: cmd: string * ?data: Dictionary<string, obj> * ?waitCmd: string * ?timeout: double * ?postProcessor: Func<JsonElement, obj> -> obj
    abstract member SendAndWaitAsync: cmd: string * ?data: Dictionary<string, obj> * ?waitCmd: string * ?timeout: double * ?postProcessor: Func<JsonElement, obj> -> Async<obj>

[<AbstractClass>]
type ApiModule(rm: IRadioManager) =
    let mutable _nowMode = "sync"
    
    member this.RM = rm

    member this.Mode(mode: string) =
        if mode = "sync" || mode = "async" || mode = "token" then
            _nowMode <- mode
            this
        else
            raise (ArgumentException(sprintf "Invalid mode: %s" mode))

    member this.GetNowMode() = _nowMode

    member this._Send(cmd: string, ?data: Dictionary<string, obj>) =
        rm.InternalSend(cmd, ?data = data)

    member this.SendInternal(cmd: string, ?data: Dictionary<string, obj>, ?waitCmd: string, ?timeout: double, ?postProcessor: Func<JsonElement, obj>) =
        match _nowMode with
        | "sync" -> rm.SendAndWaitSync(cmd, ?data = data, ?waitCmd = waitCmd, ?timeout = timeout, ?postProcessor = postProcessor)
        | "async" -> rm.SendAndWaitAsync(cmd, ?data = data, ?waitCmd = waitCmd, ?timeout = timeout, ?postProcessor = postProcessor) :> obj
        | "token" -> rm.SendWithToken(cmd, ?data = data, ?waitCmd = waitCmd, ?postProcessor = postProcessor) :> obj
        | _ -> raise (InvalidOperationException("Invalid mode"))
