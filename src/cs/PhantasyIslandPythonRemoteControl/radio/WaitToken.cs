using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace PhantasyIslandPythonRemoteControl.Radio
{
    public class WaitToken
    {
        public string WaitCmd { get; }
        public long TimeBaseId { get; }
        public JsonElement? Response { get; private set; }
        public object? ProcessedResponse { get; private set; }

        private readonly ManualResetEvent _event = new ManualResetEvent(false);
        private readonly TaskCompletionSource<object?> _tcs = new TaskCompletionSource<object?>();
        private Func<JsonElement, object>? _postProcessor;

        public WaitToken(string waitCmd, long timeBaseId)
        {
            WaitCmd = waitCmd;
            TimeBaseId = timeBaseId;
        }

        public bool IsDone => _event.WaitOne(0);

        public WaitToken SetPostProcessor(Func<JsonElement, object> processor)
        {
            _postProcessor = processor;
            return this;
        }

        private object ApplyPostProcessor(JsonElement data)
        {
            if (_postProcessor != null)
            {
                ProcessedResponse = _postProcessor(data);
            }
            else
            {
                ProcessedResponse = data;
            }

            return ProcessedResponse;
        }

        public void Complete(JsonElement data)
        {
            Response = data;
            var result = ApplyPostProcessor(data);
            _event.Set();
            _tcs.TrySetResult(result);
        }

        public object? Wait(TimeSpan timeout)
        {
            if (_event.WaitOne(timeout))
            {
                return ProcessedResponse;
            }

            return null;
        }

        public Task<object?> WaitAsync() => _tcs.Task;
    }
}