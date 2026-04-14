use crate::http_layer::get_airplane_camera_image;
use crate::image_process::read_b64_img;
use crate::image_receiver_mook::ImageReceiver;
use std::collections::HashMap;

/// 每个飞机的飞行状态
#[derive(Debug, Clone, Default)]
pub struct AirplaneFlyStatus {
    pub landing: bool,
    pub is_stop: bool,
    pub x: f64,
    pub y: f64,
    pub h: f64,
    pub rx: f64,
    pub ry: f64,
    pub rz: f64,
}

pub fn make_airplane_fly_status(fly_status: &HashMap<String, serde_json::Value>) -> AirplaneFlyStatus {
    AirplaneFlyStatus {
        landing: fly_status.get("landing").and_then(|v| v.as_bool()).unwrap_or(false),
        is_stop: fly_status.get("isStop").and_then(|v| v.as_bool()).unwrap_or(false),
        x: fly_status.get("x").and_then(|v| v.as_f64()).unwrap_or(0.0),
        y: fly_status.get("y").and_then(|v| v.as_f64()).unwrap_or(0.0),
        h: fly_status.get("h").and_then(|v| v.as_f64()).unwrap_or(0.0),
        rx: fly_status.get("rX").and_then(|v| v.as_f64()).unwrap_or(0.0),
        ry: fly_status.get("rY").and_then(|v| v.as_f64()).unwrap_or(0.0),
        rz: fly_status.get("rZ").and_then(|v| v.as_f64()).unwrap_or(0.0),
    }
}

/// 每个飞机的基本信息
pub struct AirplaneCore {
    pub key_name: String,
    pub type_name: String,
    pub update_timestamp: i64,
    pub status: AirplaneFlyStatus,
    pub camera_front: String,
    pub camera_down: String,
    pub image_receiver: ImageReceiver,
}

impl AirplaneCore {
    pub fn new(
        key_name: String,
        type_name: String,
        update_timestamp: i64,
        status: AirplaneFlyStatus,
        camera_front: String,
        camera_down: String,
    ) -> Self {
        // 在 Python 中，ImageReceiver 是在 __post_init__ 中实例化的，并传入了 self
        // 在 Rust 中我们需要处理循环引用或者调整所有权。
        // 这里暂时初步实现，假设 ImageReceiver 可以独立存在或稍后初始化。
        let mut core = Self {
            key_name,
            type_name,
            update_timestamp,
            status,
            camera_front,
            camera_down,
            image_receiver: ImageReceiver::default(),
        };
        // 模拟 Python 的 post_init
        core.image_receiver = ImageReceiver::new(&core.key_name);
        core
    }

    /// 拍照
    pub fn cap_image<F1, F2>(&self, user_receive_callback: Option<F1>, user_progress_callback: Option<F2>)
    where
        F1: Fn(Vec<u8>) + Send + 'static,
        F2: Fn(i32, i32) + Send + 'static,
    {
        self.image_receiver.send_cap_image(user_receive_callback, user_progress_callback);
    }

    pub fn get_image_transfer_progress(&self) -> (i32, i32) {
        self.image_receiver.get_transfer_progress()
    }

    pub fn is_image_transfer_in_progress(&self) -> bool {
        self.image_receiver.is_transfer_in_progress()
    }

    pub fn get_latest_image(&self) -> Option<Vec<u8>> {
        self.image_receiver.get_latest_image()
    }

    /// 获取前置摄像头图像
    pub fn get_camera_front_img(&self) -> Option<Vec<u8>> {
        read_b64_img(&get_airplane_camera_image(&self.key_name, "front"))
    }

    /// 获取下置摄像头图像
    pub fn get_camera_down_img(&self) -> Option<Vec<u8>> {
        read_b64_img(&get_airplane_camera_image(&self.key_name, "down"))
    }
}
