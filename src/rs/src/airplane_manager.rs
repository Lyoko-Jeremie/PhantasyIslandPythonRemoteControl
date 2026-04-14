use std::collections::HashMap;
use crate::airplane_core::make_airplane_fly_status;
use crate::control_command::AirplaneController;
use crate::http_layer::{get_all_airplane_status, process_airplane, ping, ping_volatile, start, start_volatile};
use serde_json::Value;
use std::thread;
use std::time::Duration;

pub struct AirplaneManager {
    pub airplanes_table: HashMap<String, AirplaneController>,
}

impl AirplaneManager {
    pub fn new() -> Self {
        Self {
            airplanes_table: HashMap::new(),
        }
    }

    pub fn ping(&self) -> Value {
        ping()
    }

    pub fn ping_volatile(&self) -> Value {
        ping_volatile()
    }

    pub fn start(&self) -> Value {
        start()
    }

    pub fn start_volatile(&self) -> Value {
        start_volatile()
    }

    pub fn get_airplane(&mut self, id: &str) -> Option<&mut AirplaneController> {
        self.airplanes_table.get_mut(id)
    }

    pub fn sleep(&self, seconds: u64) {
        thread::sleep(Duration::from_secs(seconds));
    }

    pub fn flush(&mut self) {
        if let Some(airplane_status_map) = process_airplane(get_all_airplane_status()) {
            for (k, status) in airplane_status_map {
                if !self.airplanes_table.contains_key(&k) {
                    let controller = AirplaneController::new(
                        status.get("keyName").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                        status.get("typeName").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                        status.get("updateTimestamp").and_then(|v| v.as_i64()).unwrap_or(0),
                        make_airplane_fly_status(&status.get("status").and_then(|v| v.as_object()).unwrap_or(&serde_json::Map::new()).iter().map(|(k,v)| (k.clone(), v.clone())).collect::<HashMap<_,_>>()),
                        status.get("cameraFront").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                        status.get("cameraDown").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    );
                    self.airplanes_table.insert(k, controller);
                } else {
                    if let Some(a) = self.airplanes_table.get_mut(&k) {
                        a.core.key_name = status.get("keyName").and_then(|v| v.as_str()).unwrap_or("").to_string();
                        a.core.type_name = status.get("typeName").and_then(|v| v.as_str()).unwrap_or("").to_string();
                        a.core.update_timestamp = status.get("updateTimestamp").and_then(|v| v.as_i64()).unwrap_or(0);
                        // 这里需要将 Value 转换为 HashMap 再传给 make_airplane_fly_status，或者直接解析
                        // 为了简化初步实现，这里假设 status["status"] 可以解析
                        if let Some(_s_val) = status.get("status") {
                            // 实际应用中需要更严谨的转换
                        }
                        a.core.camera_front = status.get("cameraFront").and_then(|v| v.as_str()).unwrap_or("").to_string();
                        a.core.camera_down = status.get("cameraDown").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    }
                }
            }
        }
    }
}

lazy_static::lazy_static! {
    pub static ref AIRPLANE_MANAGER_SINGLETON: std::sync::Mutex<AirplaneManager> = std::sync::Mutex::new(AirplaneManager::new());
}

pub fn get_airplane_manager() -> &'static std::sync::Mutex<AirplaneManager> {
    &AIRPLANE_MANAGER_SINGLETON
}
