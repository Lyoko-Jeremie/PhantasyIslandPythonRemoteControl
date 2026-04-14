use crate::radio::api_module::{ApiModule, SendResult};
use serde_json::json;

pub struct FlyApi {
    pub base: ApiModule,
}

impl FlyApi {
    pub fn new(base: ApiModule) -> Self {
        Self { base }
    }

    pub fn list_fly_object(&self) -> SendResult {
        self.base.send("fly.listFlyObject", None, None)
    }

    pub fn get_fly_object_info(&self, key_name: &str) -> SendResult {
        self.base.send("fly.getFlyObjectInfo", Some(json!({ "keyName": key_name })), None)
    }

    pub fn get_fly_object_camera_image_down(&self, key_name: &str) -> SendResult {
        self.base.send("fly.getFlyObjectCameraImageDown", Some(json!({ "keyName": key_name })), None)
    }

    pub fn get_fly_object_camera_image_front(&self, key_name: &str) -> SendResult {
        self.base.send("fly.getFlyObjectCameraImageFront", Some(json!({ "keyName": key_name })), None)
    }
}

impl Default for FlyApi {
    fn default() -> Self {
        Self { base: ApiModule::default() }
    }
}
