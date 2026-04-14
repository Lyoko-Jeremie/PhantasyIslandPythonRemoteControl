using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace PhantasyIslandPythonRemoteControl
{
    public class AirplaneFlyStatus
    {
        public bool Landing { get; set; }
        public bool IsStop { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public double H { get; set; }
        public double RX { get; set; }
        public double RY { get; set; }
        public double RZ { get; set; }

        public static AirplaneFlyStatus FromJson(JsonElement flyStatus)
        {
            return new AirplaneFlyStatus
            {
                Landing = flyStatus.GetProperty("landing").GetBoolean(),
                IsStop = flyStatus.GetProperty("isStop").GetBoolean(),
                X = flyStatus.GetProperty("x").GetDouble(),
                Y = flyStatus.GetProperty("y").GetDouble(),
                H = flyStatus.GetProperty("h").GetDouble(),
                RX = flyStatus.GetProperty("rX").GetDouble(),
                RY = flyStatus.GetProperty("rY").GetDouble(),
                RZ = flyStatus.GetProperty("rZ").GetDouble()
            };
        }
    }

    public class AirplaneCore
    {
        public string KeyName { get; set; }
        public string TypeName { get; set; }
        public double UpdateTimestamp { get; set; }
        public AirplaneFlyStatus Status { get; set; }
        public string CameraFront { get; set; }
        public string CameraDown { get; set; }

        public ImageReceiver ImageReceiver { get; protected set; }

        public AirplaneCore()
        {
            ImageReceiver = new ImageReceiver(this);
        }

        public void CapImage(Action<byte[]> receiveCallback = null, Action<int, int> progressCallback = null)
        {
            ImageReceiver.SendCapImage(receiveCallback, progressCallback);
        }

        public int? GetImageTransferProgress() => ImageReceiver.GetTransferProgress();
        public bool IsImageTransferInProgress() => ImageReceiver.IsTransferInProgress();
        public byte[] GetLatestImage() => ImageReceiver.GetLatestImage();

        public string GetCameraFrontImg()
        {
            return HttpLayer.GetAirplaneCameraImage(KeyName, "front").Result;
        }

        public string GetCameraDownImg()
        {
            return HttpLayer.GetAirplaneCameraImage(KeyName, "down").Result;
        }
    }

    public class ImageInfo
    {
        public byte[] Img { get; set; }
        public int Id { get; set; }
        public int TotalCount { get; set; }
        public int ProgressCount { get; set; } = 0;
        public bool Ok { get; set; } = false;
    }

    public class ImageReceiver
    {
        private readonly AirplaneCore _airplane;
        private ImageInfo _imageInstance;
        private int _cmdIdCounter = 1;
        private int _nowLoadingId = 0;
        private readonly object _lock = new object();

        public ImageReceiver(AirplaneCore airplane)
        {
            _airplane = airplane;
        }

        public void SendCapImage(Action<byte[]> receiveCallback = null, Action<int, int> progressCallback = null)
        {
            Task.Run(() =>
            {
                lock (_lock)
                {
                    _cmdIdCounter++;
                    _nowLoadingId = _cmdIdCounter;
                    _imageInstance = new ImageInfo
                    {
                        Img = null, // In C# we'd decode base64 if needed
                        Id = _cmdIdCounter,
                        TotalCount = 300
                    };
                }

                while (true)
                {
                    lock (_lock)
                    {
                        if (_imageInstance.Id != _nowLoadingId) break;
                        if (_imageInstance.ProgressCount >= _imageInstance.TotalCount) break;
                        _imageInstance.ProgressCount++;
                    }
                    progressCallback?.Invoke(_imageInstance.ProgressCount, _imageInstance.TotalCount);
                    Task.Delay(10).Wait();
                }

                lock (_lock)
                {
                    if (_imageInstance.Id == _nowLoadingId)
                    {
                        _imageInstance.Ok = true;
                        receiveCallback?.Invoke(_imageInstance.Img);
                    }
                }
            });
        }

        public byte[] GetLatestImage()
        {
            lock (_lock) return _imageInstance?.Ok == true ? _imageInstance.Img : null;
        }

        public int? GetTransferProgress()
        {
            lock (_lock) return _imageInstance?.ProgressCount;
        }

        public bool IsTransferInProgress()
        {
            lock (_lock) return _imageInstance != null && !_imageInstance.Ok;
        }
    }
}
