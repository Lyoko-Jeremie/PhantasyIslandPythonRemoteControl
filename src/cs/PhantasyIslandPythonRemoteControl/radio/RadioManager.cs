using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using SocketIOClient;

namespace PhantasyIslandPythonRemoteControl.Radio
{
    public class RadioManager
    {
        public SocketIO? Socket { get; private set; }
        public string Namespace { get; private set; } = "/UserSide";
        public bool IsSceneInit { get; private set; }

        public DebugApi DebugApi { get; }
        public SceneApi SceneApi { get; }
        public FlyApi FlyApi { get; }
        public RadioApi RadioApi { get; }

        private readonly ConcurrentDictionary<string, List<WeakReference<WaitToken>>> _pendingWaiters =
            new ConcurrentDictionary<string, List<WeakReference<WaitToken>>>();

        private readonly object _waitersLock = new object();

        public long CreateMsgTimestampId()
        {
            return (long)(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() * 100);
        }

        public RadioManager()
        {
            Namespace = "/UserSide";
            DebugApi = new DebugApi(this);
            SceneApi = new SceneApi(this);
            FlyApi = new FlyApi(this);
            RadioApi = new RadioApi(this);
        }

        public async Task Connect(string url = "http://127.0.0.1:60002", string ns = "/UserSide")
        {
            Namespace = ns;
            Reset();

            Socket = new SocketIO(url);

            InitListener();
            await Socket.ConnectAsync();
        }

        public void Reset()
        {
            if (Socket != null && Socket.Connected)
            {
                Socket.DisconnectAsync().Wait();
            }

            IsSceneInit = false;
        }

        private void InitListener()
        {
            if (Socket == null) return;

            Socket.OnConnected += (sender, e) =>
            {
                Console.WriteLine("[RadioManager] connected");
                CheckSceneStatus();
            };

            Socket.OnDisconnected += (sender, e) =>
            {
                Console.WriteLine("[RadioManager] disconnected");
                IsSceneInit = false;
            };

            Socket.On("message", response =>
            {
                var data = response.GetValue<JsonElement>();
                Console.WriteLine($"[RadioManager] message: {data}");
                MsgDispatch(data);
            });
        }

        private void CheckSceneStatus()
        {
            InternalSend("ping");
            InternalSend("scene.getInitState");
        }

        public object Ping()
        {
            return SendAndWaitSync("ping", waitCmd: "pong");
        }

        private void OnSceneReset(JsonElement data)
        {
            Console.WriteLine($"[RadioManager] handle sceneReset: {data}");
            IsSceneInit = false;
        }

        private void OnSceneInit(JsonElement data)
        {
            Console.WriteLine($"[RadioManager] handle sceneInit: {data}");
            IsSceneInit = true;
        }

        internal void InternalSend(string cmd, Dictionary<string, object>? data = null)
        {
            var msg = new Dictionary<string, object> { ["cmd"] = cmd };
            if (data != null)
            {
                foreach (var kv in data) msg[kv.Key] = kv.Value;
            }

            Socket?.EmitAsync("message", msg).Wait();
        }

        public WaitToken SendWithToken(string cmd, Dictionary<string, object>? data = null,
            string? waitCmd = null, Func<JsonElement, object>? postProcessor = null)
        {
            waitCmd ??= cmd;
            long timeBaseId = CreateMsgTimestampId();
            var token = new WaitToken(waitCmd, timeBaseId);
            if (postProcessor != null) token.SetPostProcessor(postProcessor);

            lock (_waitersLock)
            {
                var waiters = _pendingWaiters.GetOrAdd(waitCmd, _ => new List<WeakReference<WaitToken>>());
                waiters.Add(new WeakReference<WaitToken>(token));
            }

            var msg = new Dictionary<string, object> { ["timestampIdPython"] = timeBaseId };
            if (data != null)
            {
                foreach (var kv in data)
                {
                    if (kv.Value != null) msg[kv.Key] = kv.Value;
                }
            }

            InternalSend(cmd, msg);
            return token;
        }

        public object? SendAndWaitSync(string cmd, Dictionary<string, object>? data = null,
            string? waitCmd = null, double timeout = 3.0,
            Func<JsonElement, object>? postProcessor = null)
        {
            var token = SendWithToken(cmd, data, waitCmd, postProcessor);
            return token.Wait(TimeSpan.FromSeconds(timeout));
        }

        public async Task<object?> SendAndWaitAsync(string cmd, Dictionary<string, object>? data = null,
            string? waitCmd = null, double timeout = 3.0,
            Func<JsonElement, object>? postProcessor = null)
        {
            var token = SendWithToken(cmd, data, waitCmd, postProcessor);
            var task = token.WaitAsync();
            if (await Task.WhenAny(task, Task.Delay(TimeSpan.FromSeconds(timeout))) == task)
            {
                return await task;
            }

            return null;
        }

        private bool NotifyWaiters(string? cmd, JsonElement data)
        {
            if (cmd == null || !data.TryGetProperty("timestampIdPython", out var tsProp)) return false;
            long timestampId = tsProp.GetInt64();

            lock (_waitersLock)
            {
                if (!_pendingWaiters.TryGetValue(cmd, out var refs)) return false;

                var surviving = new List<WeakReference<WaitToken>>();
                bool matched = false;
                foreach (var r in refs)
                {
                    if (r.TryGetTarget(out var token))
                    {
                        if (!matched && token.TimeBaseId == timestampId)
                        {
                            token.Complete(data);
                            matched = true;
                        }
                        else
                        {
                            surviving.Add(r);
                        }
                    }
                }

                if (surviving.Count > 0) _pendingWaiters[cmd] = surviving;
                else _pendingWaiters.TryRemove(cmd, out _);

                return matched;
            }
        }

        private void MsgDispatch(JsonElement data)
        {
            if (!data.TryGetProperty("cmd", out var cmdProp))
            {
                Console.WriteLine($"[RadioManager] received message without cmd: {data}");
                return;
            }

            string? cmd = cmdProp.GetString();

            if (NotifyWaiters(cmd, data)) return;

            switch (cmd)
            {
                case "pong": break;
                case "sceneReset":
                case "sceneNotInit":
                    OnSceneReset(data);
                    break;
                case "sceneInit":
                case "sceneIsInit":
                    OnSceneInit(data);
                    break;
                default:
                    Console.WriteLine($"[RadioManager] unknown cmd: {cmd}, data: {data}");
                    break;
            }
        }
    }
}