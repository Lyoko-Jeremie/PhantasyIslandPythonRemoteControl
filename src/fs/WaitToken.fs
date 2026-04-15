namespace PhantasyIslandRemoteControl.Radio

open System
open System.Text.Json
open System.Threading
open System.Threading.Tasks

type WaitToken(waitCmd: string, timeBaseId: int64) =
    let _event = new ManualResetEvent(false)
    let _tcs = TaskCompletionSource<obj>()
    let mutable _postProcessor: Func<JsonElement, obj> = null
    
    member val WaitCmd = waitCmd with get
    member val TimeBaseId = timeBaseId with get
    member val Response: Nullable<JsonElement> = Nullable() with get, set
    member val ProcessedResponse: obj = null with get, set

    member this.IsDone = _event.WaitOne(0)

    member this.SetPostProcessor(processor: Func<JsonElement, obj>) =
        _postProcessor <- processor
        this

    member private this.ApplyPostProcessor(data: JsonElement) =
        if _postProcessor <> null then
            this.ProcessedResponse <- _postProcessor.Invoke(data)
        else
            this.ProcessedResponse <- data
        this.ProcessedResponse

    member this.Complete(data: JsonElement) =
        this.Response <- Nullable(data)
        let result = this.ApplyPostProcessor(data)
        _event.Set() |> ignore
        _tcs.TrySetResult(result) |> ignore

    member this.Wait(timeout: TimeSpan) =
        if _event.WaitOne(timeout) then
            this.ProcessedResponse
        else
            null

    member this.WaitAsync() = _tcs.Task
