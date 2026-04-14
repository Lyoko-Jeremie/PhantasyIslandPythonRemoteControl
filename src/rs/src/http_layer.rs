use crate::config::REMOTE_LOCATION;
use std::collections::HashMap;
use serde_json::Value;

pub fn ping() -> Value {
    send_cmd("ping")
}

pub fn ping_volatile() -> Value {
    send_cmd_volatile("ping")
}

pub fn start() -> Value {
    send_cmd("start")
}

pub fn start_volatile() -> Value {
    send_cmd_volatile("start")
}

pub fn send_cmd(s: &str) -> Value {
    let url = format!("http://{}/ECU_HTTP/sendStringCmd?c={}", REMOTE_LOCATION, s);
    match reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .and_then(|c| c.get(&url).send()) {
        Ok(r) => r.json().unwrap_or(serde_json::json!({"ok": false, "r": "ParseError"})),
        Err(_) => serde_json::json!({"ok": false, "r": "Timeout or ConnectionError"}),
    }
}

pub fn send_cmd_volatile(s: &str) -> Value {
    let url = format!("http://{}/ECU_HTTP/sendStringCmd?cc={}", REMOTE_LOCATION, s);
    match reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .and_then(|c| c.get(&url).send()) {
        Ok(r) => r.json().unwrap_or(serde_json::json!({"ok": false, "r": "ParseError"})),
        Err(_) => serde_json::json!({"ok": false, "r": "Timeout or ConnectionError"}),
    }
}

pub fn get_all_airplane_status() -> Value {
    let url = format!("http://{}/ECU_HTTP/requestPullAllAirplaneState", REMOTE_LOCATION);
    match reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .and_then(|c| c.get(&url).send()) {
        Ok(r) => r.json().unwrap_or(serde_json::json!({"ok": false, "r": "ParseError"})),
        Err(_) => serde_json::json!({"ok": false, "r": "ConnectionError"}),
    }
}

pub fn get_airplane_camera_image(port: &str, camera: &str) -> String {
    let url = format!("http://{}/ECU_HTTP/requestPullImage?flyPort={}&imageType={}", REMOTE_LOCATION, port, camera);
    match reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .and_then(|c| c.get(&url).send()) {
        Ok(r) => {
            let j: Value = r.json().unwrap_or(serde_json::json!({"ok": false}));
            if j["ok"].as_bool().unwrap_or(false) {
                j["imgDataString"].as_str().unwrap_or("").to_string()
            } else {
                "".to_string()
            }
        },
        Err(_) => "".to_string(),
    }
}

pub fn process_airplane(j: Value) -> Option<HashMap<String, HashMap<String, Value>>> {
    if j["ok"].as_bool().unwrap_or(false) {
        let mut airplane_status = HashMap::new();
        if let Some(airplanes) = j["airplanes"].as_array() {
            for air in airplanes {
                let mut status = HashMap::new();
                let key_name = air["keyName"].as_str().unwrap_or("").to_string();
                status.insert("keyName".to_string(), Value::String(key_name.clone()));
                status.insert("typeName".to_string(), air["typeName"].clone());
                status.insert("updateTimestamp".to_string(), air["updateTimestamp"].clone());
                status.insert("status".to_string(), air["status"].clone());
                
                let camera_front = &air["cameraFront"];
                status.insert("cameraFront".to_string(), camera_front["imgDataString"].clone());
                
                let camera_down = &air["cameraDown"];
                status.insert("cameraDown".to_string(), camera_down["imgDataString"].clone());
                
                airplane_status.insert(key_name, status);
            }
        }
        Some(airplane_status)
    } else {
        None
    }
}
