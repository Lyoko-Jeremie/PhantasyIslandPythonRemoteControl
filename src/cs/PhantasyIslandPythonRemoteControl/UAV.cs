using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace PhantasyIslandPythonRemoteControl
{
    public class AirplaneController : AirplaneCore
    {
        private int _count = 1;
        private Func<string, Task<JsonElement?>> _sendCmdFn;

        public AirplaneController() : base()
        {
            _sendCmdFn = HttpLayer.SendCmd;
        }

        public void UseFastMode(bool fastMode = true, bool asyncMode = true)
        {
            if (asyncMode)
            {
                _sendCmdFn = fastMode ? HttpLayer.SendCmdVolatile : HttpLayer.SendCmd;
            }
            else
            {
                // Synchronous wrapper (basic implementation)
                _sendCmdFn = s => Task.Run(() => (fastMode ? HttpLayer.SendCmdVolatile(s) : HttpLayer.SendCmd(s)).Result);
            }
        }

        private string NextCount()
        {
            _count += 2;
            return _count.ToString();
        }

        private string PrepareCommand(string command) => $"{KeyName} {NextCount()} {command}";

        private async Task<JsonElement?> SendCommand(string command)
        {
            return await _sendCmdFn(PrepareCommand(command));
        }

        public Task Mode(int mode) => AirplaneMode(mode);
        public Task Takeoff(int high) => SendCommand($"takeoff {high}");
        public Task Land() => SendCommand("land");
        public Task Emergency() => SendCommand("emergency");
        public Task Up(int distance) => SendCommand($"up {distance}");
        public Task Down(int distance) => SendCommand($"down {distance}");
        public Task Forward(int distance) => SendCommand($"forward {distance}");
        public Task Back(int distance) => SendCommand($"back {distance}");
        public Task Left(int distance) => SendCommand($"left {distance}");
        public Task Right(int distance) => SendCommand($"right {distance}");
        public Task Goto(int x, int y, int h) => SendCommand($"goto {x} {y} {h}");
        public Task Flip(string direction) => SendCommand($"flip {direction} 1");
        public Task FlipForward() => Flip("f");
        public Task FlipBack() => Flip("b");
        public Task FlipLeft() => Flip("l");
        public Task FlipRight() => Flip("r");
        public Task Rotate(int degree) => SendCommand($"rotate {degree}");
        public Task Cw(int degree) => SendCommand($"cw {degree}");
        public Task Ccw(int degree) => SendCommand($"ccw {degree}");
        public Task High(int high) => SendCommand($"high {high}");
        public Task Speed(int speed) => SendCommand($"setSpeed {speed}");
        public Task Led(int r, int g, int b) => SendCommand($"light {r} {g} {b}");
        public Task Bln(int r, int g, int b) => SendCommand($"bln {r} {g} {b}");
        public Task Rainbow(int r, int g, int b) => SendCommand($"rainbow {r} {g} {b}");
        public Task AirplaneMode(int mode) => SendCommand($"airplane_mode {mode}");
        public Task Stop() => Hover();
        public Task Hover() => SendCommand("hover");
    }

    public class AirplaneManager
    {
        public Dictionary<string, AirplaneController> AirplanesTable { get; } = new Dictionary<string, AirplaneController>();

        public async Task<JsonElement?> Ping() => await HttpLayer.Ping();
        public async Task<JsonElement?> Start() => await HttpLayer.Start();

        public AirplaneController GetAirplane(string id)
        {
            return AirplanesTable.TryGetValue(id, out var air) ? air : null;
        }

        public async Task Flush()
        {
            var statusJson = await HttpLayer.GetAllAirplaneStatus();
            if (statusJson == null) return;
            
            var airplaneStatus = HttpLayer.ProcessAirplane(statusJson.Value);
            if (airplaneStatus == null) return;

            foreach (var kv in airplaneStatus)
            {
                var statusDict = kv.Value as Dictionary<string, object>;
                if (!AirplanesTable.ContainsKey(kv.Key))
                {
                    var air = new AirplaneController
                    {
                        KeyName = (string)statusDict["keyName"],
                        TypeName = (string)statusDict["typeName"],
                        UpdateTimestamp = (double)statusDict["updateTimestamp"],
                        Status = AirplaneFlyStatus.FromJson((JsonElement)statusDict["status"]),
                        CameraFront = (string)statusDict["cameraFront"],
                        CameraDown = (string)statusDict["cameraDown"]
                    };
                    AirplanesTable[kv.Key] = air;
                }
                else
                {
                    var air = AirplanesTable[kv.Key];
                    air.KeyName = (string)statusDict["keyName"];
                    air.TypeName = (string)statusDict["typeName"];
                    air.UpdateTimestamp = (double)statusDict["updateTimestamp"];
                    air.Status = AirplaneFlyStatus.FromJson((JsonElement)statusDict["status"]);
                    air.CameraFront = (string)statusDict["cameraFront"];
                    air.CameraDown = (string)statusDict["cameraDown"];
                }
            }
        }

        private static AirplaneManager _instance = new AirplaneManager();
        public static AirplaneManager Instance => _instance;
    }

    public class UAV
    {
        private AirplaneManager _airs = AirplaneManager.Instance;

        public UAV()
        {
            _airs.Flush().Wait();
            _airs.Start().Wait();
            _airs.Flush().Wait();
        }

        public void Sleep(int seconds) => Task.Delay(TimeSpan.FromSeconds(seconds)).Wait();
        public void AddUav(string port) => _airs.Flush().Wait();
        private AirplaneController P(string port) => _airs.GetAirplane(port);

        public void Land(string port) => P(port).Land().Wait();
        public void Takeoff(string port, int high) => P(port).Takeoff(high).Wait();
        public void Up(string port, int dist) => P(port).Up(dist).Wait();
        public void Down(string port, int dist) => P(port).Down(dist).Wait();
        public void Forward(string port, int dist) => P(port).Forward(dist).Wait();
        public void Back(string port, int dist) => P(port).Back(dist).Wait();
        public void Left(string port, int dist) => P(port).Left(dist).Wait();
        public void Right(string port, int dist) => P(port).Right(dist).Wait();
        public void Goto(string port, int x, int y, int h) => P(port).Goto(x, y, h).Wait();
        public void Rotate(string port, int deg) => P(port).Rotate(deg).Wait();
        public void Stop(string port) => P(port).Stop().Wait();
        public void Hover(string port) => P(port).Hover().Wait();
    }

    public class FH0A : UAV { }
}
