namespace PhantasyIslandRemoteControl

open System
open System.Collections.Generic
open System.Net.Http
open System.Text.Json
open System.Threading.Tasks

module HttpLayer =
    let private _httpClient = new HttpClient(Timeout = TimeSpan.FromSeconds(10.0))

    let sendCmd (s: string) =
        async {
            try
                let url = sprintf "http://%s/ECU_HTTP/sendStringCmd?c=%s" Config.RemoteLocation s
                let! response = _httpClient.GetStringAsync(url) |> Async.AwaitTask
                return Some(JsonSerializer.Deserialize<JsonElement>(response))
            with e ->
                printfn "send_cmd %s Error: %s" s e.Message
                return Some(JsonSerializer.Deserialize<JsonElement>("{\"ok\": false, \"r\": \"ConnectionError\"}"))
        }

    let sendCmdVolatile (s: string) =
        async {
            try
                let url = sprintf "http://%s/ECU_HTTP/sendStringCmd?cc=%s" Config.RemoteLocation s
                let! response = _httpClient.GetStringAsync(url) |> Async.AwaitTask
                return Some(JsonSerializer.Deserialize<JsonElement>(response))
            with e ->
                printfn "send_cmd_volatile %s Error: %s" s e.Message
                return Some(JsonSerializer.Deserialize<JsonElement>("{\"ok\": false, \"r\": \"ConnectionError\"}"))
        }

    let ping () = sendCmd "ping"
    let pingVolatile () = sendCmdVolatile "ping"
    let start () = sendCmd "start"
    let startVolatile () = sendCmdVolatile "start"

    let getAllAirplaneStatus () =
        async {
            try
                let url = sprintf "http://%s/ECU_HTTP/requestPullAllAirplaneState" Config.RemoteLocation
                let! response = _httpClient.GetStringAsync(url) |> Async.AwaitTask
                return JsonSerializer.Deserialize<JsonElement>(response)
            with e ->
                eprintfn "ConnectionError Cannot Connect to PhantasyIsland: %s" e.Message
                return raise (Exception("ConnectionError Cannot Connect to PhantasyIsland", e))
        }

    let getAirplaneCameraImage (port: string) (camera: string) =
        async {
            try
                let url = sprintf "http://%s/ECU_HTTP/requestPullImage?flyPort=%s&imageType=%s" Config.RemoteLocation port camera
                let! response = _httpClient.GetStringAsync(url) |> Async.AwaitTask
                let json = JsonSerializer.Deserialize<JsonElement>(response)
                if json.GetProperty("ok").GetBoolean() then
                    return json.GetProperty("imgDataString").GetString()
                else
                    return null
            with e ->
                eprintfn "ConnectionError: %s" e.Message
                return null
        }

    let processAirplane (j: JsonElement) =
        if j.GetProperty("ok").GetBoolean() then
            let airplanes = j.GetProperty("airplanes")
            let airplaneStatus = Dictionary<string, obj>()
            for air in airplanes.EnumerateArray() do
                let keyName = air.GetProperty("keyName").GetString()
                let status = Dictionary<string, obj>()
                status.["keyName"] <- keyName
                status.["typeName"] <- air.GetProperty("typeName").GetString()
                status.["updateTimestamp"] <- air.GetProperty("updateTimestamp").GetDouble()
                status.["status"] <- air.GetProperty("status")
                
                let frontImg =
                    let mutable p = JsonElement()
                    if air.GetProperty("cameraFront").TryGetProperty("imgDataString", &p) then
                        p.GetString()
                    else
                        null
                status.["cameraFront"] <- frontImg

                let downImg =
                    let mutable p = JsonElement()
                    if air.GetProperty("cameraDown").TryGetProperty("imgDataString", &p) then
                        p.GetString()
                    else
                        null
                status.["cameraDown"] <- downImg

                airplaneStatus.[keyName] <- status
            airplaneStatus
        else
            null
