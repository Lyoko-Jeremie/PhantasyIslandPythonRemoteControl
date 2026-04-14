using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace PhantasyIslandPythonRemoteControl.Radio
{
    public abstract class ApiModule
    {
        protected readonly RadioManager _rm;
        private string _nowMode = "sync";

        protected ApiModule(RadioManager rm)
        {
            _rm = rm;
        }

        public ApiModule Mode(string mode)
        {
            if (mode == "sync" || mode == "async" || mode == "token")
            {
                _nowMode = mode;
            }
            else
            {
                throw new ArgumentException($"Invalid mode: {mode}");
            }

            return this;
        }

        public string GetNowMode() => _nowMode;

        protected void _Send(string cmd, Dictionary<string, object> data = null)
        {
            _rm.InternalSend(cmd, data);
        }

        protected object? SendInternal(string cmd, Dictionary<string, object>? data = null,
            string? waitCmd = null, double timeout = 3.0,
            Func<JsonElement, object>? postProcessor = null)
        {
            switch (_nowMode)
            {
                case "sync":
                    return _rm.SendAndWaitSync(cmd, data, waitCmd, timeout, postProcessor);
                case "async":
                    return _rm.SendAndWaitAsync(cmd, data, waitCmd, timeout, postProcessor);
                case "token":
                    return _rm.SendWithToken(cmd, data, waitCmd, postProcessor);
                default:
                    throw new InvalidOperationException("Invalid mode");
            }
        }
    }
}