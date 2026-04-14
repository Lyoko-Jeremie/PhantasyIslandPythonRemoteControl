<?php

namespace PhantasyIslandPhpRemoteControl;

/**
 * 这个文件在 PhantasyIslandPythonRemoteControl 库中负责解析从仿真平台发回的无人机相机图像
 * PHP 实现中使用 base64_decode，不依赖 OpenCV (cv2)
 */
class ImageProcess
{
    /**
     * 从仿真平台中返回的无人机相机图像是一个标准html编码的png/jpg图像
     * @param string|null $uri 来自仿真平台的无人机相机图像数据字符串
     * @return string|null 图像二进制数据（PHP 中通常以字符串形式表示二进制）
     */
    public static function read_b64_img($uri)
    {
        if ($uri === null) {
            return null;
        }
        $parts = explode(',', $uri);
        if (count($parts) < 2) {
            return null;
        }
        return base64_decode($parts[1]);
    }
}
