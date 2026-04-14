using System;

namespace PhantasyIslandPythonRemoteControl
{
    public static class ImageProcess
    {
        public static byte[] ReadB64Img(string uri)
        {
            if (string.IsNullOrEmpty(uri)) return null;
            try
            {
                var parts = uri.Split(',');
                if (parts.Length < 2) return null;
                return Convert.FromBase64String(parts[1]);
            }
            catch
            {
                return null;
            }
        }
    }
}