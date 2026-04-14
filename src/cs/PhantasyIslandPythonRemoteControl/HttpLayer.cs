using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace PhantasyIslandPythonRemoteControl
{
    public static class HttpLayer
    {
        private static readonly HttpClient _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };

        public static async Task<JsonElement?> Ping() => await SendCmd("ping");
        public static async Task<JsonElement?> PingVolatile() => await SendCmdVolatile("ping");
        public static async Task<JsonElement?> Start() => await SendCmd("start");
        public static async Task<JsonElement?> StartVolatile() => await SendCmdVolatile("start");

        public static async Task<JsonElement?> SendCmd(string s)
        {
            try
            {
                var response = await _httpClient.GetStringAsync($"http://{Config.RemoteLocation}/ECU_HTTP/sendStringCmd?c={s}");
                return JsonSerializer.Deserialize<JsonElement>(response);
            }
            catch (Exception e)
            {
                Console.WriteLine($"send_cmd {s} Error: {e.Message}");
                return JsonSerializer.Deserialize<JsonElement>("{\"ok\": false, \"r\": \"ConnectionError\"}");
            }
        }

        public static async Task<JsonElement?> SendCmdVolatile(string s)
        {
            try
            {
                var response = await _httpClient.GetStringAsync($"http://{Config.RemoteLocation}/ECU_HTTP/sendStringCmd?cc={s}");
                return JsonSerializer.Deserialize<JsonElement>(response);
            }
            catch (Exception e)
            {
                Console.WriteLine($"send_cmd_volatile {s} Error: {e.Message}");
                return JsonSerializer.Deserialize<JsonElement>("{\"ok\": false, \"r\": \"ConnectionError\"}");
            }
        }

        public static async Task<JsonElement?> GetAllAirplaneStatus()
        {
            try
            {
                var response = await _httpClient.GetStringAsync($"http://{Config.RemoteLocation}/ECU_HTTP/requestPullAllAirplaneState");
                return JsonSerializer.Deserialize<JsonElement>(response);
            }
            catch (Exception e)
            {
                Console.Error.WriteLine($"ConnectionError Cannot Connect to PhantasyIsland: {e.Message}");
                throw new Exception("ConnectionError Cannot Connect to PhantasyIsland", e);
            }
        }

        public static async Task<string> GetAirplaneCameraImage(string port, string camera)
        {
            try
            {
                var response = await _httpClient.GetStringAsync($"http://{Config.RemoteLocation}/ECU_HTTP/requestPullImage?flyPort={port}&imageType={camera}");
                var json = JsonSerializer.Deserialize<JsonElement>(response);
                if (json.GetProperty("ok").GetBoolean())
                {
                    return json.GetProperty("imgDataString").GetString();
                }
                return null;
            }
            catch (Exception e)
            {
                Console.Error.WriteLine($"ConnectionError: {e.Message}");
                return null;
            }
        }

        public static Dictionary<string, object> ProcessAirplane(JsonElement j)
        {
            if (j.GetProperty("ok").GetBoolean())
            {
                var airplanes = j.GetProperty("airplanes");
                var airplaneStatus = new Dictionary<string, object>();
                foreach (var air in airplanes.EnumerateArray())
                {
                    var keyName = air.GetProperty("keyName").GetString();
                    var status = new Dictionary<string, object>
                    {
                        ["keyName"] = keyName,
                        ["typeName"] = air.GetProperty("typeName").GetString(),
                        ["updateTimestamp"] = air.GetProperty("updateTimestamp").GetDouble(),
                        ["status"] = air.GetProperty("status"),
                        ["cameraFront"] = air.GetProperty("cameraFront").TryGetProperty("imgDataString", out var frontImg) ? frontImg.GetString() : null,
                        ["cameraDown"] = air.GetProperty("cameraDown").TryGetProperty("imgDataString", out var downImg) ? downImg.GetString() : null
                    };
                    airplaneStatus[keyName] = status;
                }
                return airplaneStatus;
            }
            return null;
        }
    }
}
