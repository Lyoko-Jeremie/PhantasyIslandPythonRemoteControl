/// 这个文件在 PhantasyIslandPythonRemoteControl 库中负责解析从仿真平台发回的无人机相机图像
use base64::{Engine as _, engine::general_purpose};

/// 从仿真平台中返回的无人机相机图像是一个标准html编码的png/jpg图像
/// 本函数将其解析为字节数组 (Vec<u8>)
/// 格式通常为：
/// "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAADElEQVQImWNgoBMAAABpAAFEI8ARAAAAAElFTkSuQmCC"
pub fn read_b64_img(uri: &str) -> Option<Vec<u8>> {
    if uri.is_empty() {
        return None;
    }
    let parts: Vec<&str> = uri.split(',').collect();
    if parts.len() < 2 {
        return None;
    }
    let im_b64 = parts[1];
    general_purpose::STANDARD.decode(im_b64).ok()
}
