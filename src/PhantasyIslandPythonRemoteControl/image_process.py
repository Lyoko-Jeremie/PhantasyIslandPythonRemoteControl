"""
这个文件在 PhantasyIslandPythonRemoteControl 库中负责解析从仿真平台发回的无人机相机图像
"""
import base64
import cv2
import numpy as np


# https://jdhao.github.io/2020/03/17/base64_opencv_pil_image_conversion/
def read_b64_img(uri: str | None) -> cv2.Mat | None:
    """
    从仿真平台中返回的无人机相机图像是一个标准html编码的png/jpg图像
    本函数使用opencv的cv::imdecode函数将其解析为cv::Mat图像数据
    格式通常为：
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAADElEQVQImWNgoBMAAABpAAFEI8ARAAAAAElFTkSuQmCC"
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ…9oADAMBAAIRAxEAPwD/AD/6AP/Z"

    详见 https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
    :param uri: 来自仿真平台的无人机相机图像数据字符串
    :return: cv::Mat图像数据
    """
    if uri is None:
        return None
    im_b64 = uri.split(',')[1]
    im_bytes = base64.b64decode(im_b64)
    im_arr = np.frombuffer(im_bytes, dtype=np.uint8)  # im_arr is one-dim Numpy array
    img = cv2.imdecode(im_arr, flags=cv2.IMREAD_COLOR)
    return img

def decode_base64_float32(uri: str | None) -> np.ndarray | None:
    """
    // --- DESERIALIZE ---
    // 1. Decode Base64 back to a binary string
    const binarySign = atob(base64String);
    // 2. Re-populate a Uint8Array
    const decodedBytes = new Uint8Array(binarySign.length);
    for (let i = 0; i < binarySign.length; i++) {
        decodedBytes[i] = binarySign.charCodeAt(i);
    }
    // 3. Create the Float32Array pointing to the same buffer
    const finalFloatArray = new Float32Array(decodedBytes.buffer);
    """
    if uri is None:
        return None
    if ',' in uri:
        im_b64 = uri.split(',')[1]
    else:
        im_b64 = uri
    im_bytes = base64.b64decode(im_b64)
    im_arr = np.frombuffer(im_bytes, dtype=np.float32)
    return im_arr

