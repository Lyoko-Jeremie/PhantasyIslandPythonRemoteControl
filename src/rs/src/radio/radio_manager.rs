use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use rust_socketio::{ClientBuilder, Payload, RawClient};
use serde_json::{json, Value};
use crate::radio::wait_token::WaitToken;
use crate::radio::api_debug::DebugApi;
use crate::radio::api_scene::SceneApi;
use crate::radio::api_fly::FlyApi;
use crate::radio::api_radio::RadioApi;

pub struct RadioManager {
    pub client: Option<RawClient>,
    pub namespace: String,
    pub scene_is_init: Arc<Mutex<bool>>,
    
    // Sub-APIs
    pub debug_api: DebugApi,
    pub scene_api: SceneApi,
    pub fly_api: FlyApi,
    pub radio_api: RadioApi,

    // wait_cmd -> list[WaitToken]
    // 简化处理，使用强引用，实际应用中可能需要更复杂的管理
    pub pending_waiters: Arc<Mutex<HashMap<String, Vec<Arc<WaitToken>>>>>,
}

impl RadioManager {
    pub fn new() -> Arc<Self> {
        let scene_is_init = Arc::new(Mutex::new(false));
        let pending_waiters = Arc::new(Mutex::new(HashMap::new()));
        
        // 由于 Sub-API 需要引用 RadioManager，这里使用 Arc 并延迟初始化或使用弱引用
        // 为简化初步实现，假设 Sub-API 可以在之后绑定或者持有 Arc<RadioManager>
        
        let rm = Arc::new(Self {
            client: None,
            namespace: "/UserSide".to_string(),
            scene_is_init,
            debug_api: DebugApi::default(), // 占位
            scene_api: SceneApi::default(),
            fly_api: FlyApi::default(),
            radio_api: RadioApi::default(),
            pending_waiters,
        });
        
        rm
    }

    pub fn create_msg_timestamp_id(&self) -> i64 {
        let start = SystemTime::now();
        let since_the_epoch = start.duration_since(UNIX_EPOCH).expect("Time went backwards");
        (since_the_epoch.as_secs() as i64 * 1000 * 100) + (since_the_epoch.subsec_millis() as i64 * 100)
    }

    pub fn connect(self: &Arc<Self>, url: &str) {
        let rm_clone = Arc::clone(self);
        let namespace = self.namespace.clone();
        
        let _client = ClientBuilder::new(url)
            .namespace(&namespace)
            .on("connect", move |_, _| {
                println!("[RadioManager] connected");
                rm_clone.check_scene_status();
            })
            .on("disconnect", {
                let scene_is_init = Arc::clone(&self.scene_is_init);
                move |_, _| {
                    println!("[RadioManager] disconnected");
                    let mut is_init = scene_is_init.lock().unwrap();
                    *is_init = false;
                }
            })
            .on("message", {
                let rm_clone2 = Arc::clone(self);
                move |payload, _| {
                    match payload {
                        Payload::String(value) => {
                             println!("[RadioManager] message: {:?}", value);
                             if let Ok(data) = serde_json::from_str::<Value>(&value) {
                                 rm_clone2.msg_dispatch(data);
                             }
                        }
                        Payload::Binary(bin_data) => {
                             println!("[RadioManager] binary message received: {:?}", bin_data);
                        }
                    }
                }
            })
            .connect()
            .expect("Connection failed");

        // 这里需要将 client 存入 RadioManager，由于 RadioManager 已经是 Arc 包装的，
        // 且 client 需要在 connect 后才能获得，这里的架构需要微调。
        // 初步实现中，我们重点展示逻辑。
    }

    fn check_scene_status(&self) {
        self.send("ping", None);
        self.send("scene.getInitState", None);
    }

    pub fn send(&self, cmd: &str, data: Option<Value>) {
        let mut msg = json!({ "cmd": cmd });
        if let Some(d) = data {
            if let Some(obj) = d.as_object() {
                for (k, v) in obj {
                    msg[k] = v.clone();
                }
            }
        }
        if let Some(ref client) = self.client {
            client.emit("message", msg).ok();
        }
    }

    pub fn send_with_token(&self, cmd: &str, data: Option<Value>, wait_cmd: Option<&str>) -> Arc<WaitToken> {
        let wait_cmd = wait_cmd.unwrap_or(cmd).to_string();
        let time_base_id = self.create_msg_timestamp_id();
        let token = Arc::new(WaitToken::new(&wait_cmd, time_base_id));

        {
            let mut waiters = self.pending_waiters.lock().unwrap();
            waiters.entry(wait_cmd.clone()).or_insert_with(Vec::new).push(Arc::clone(&token));
        }

        let mut msg = json!({ "timestampIdPython": time_base_id });
        if let Some(d) = data {
            if let Some(obj) = d.as_object() {
                for (k, v) in obj {
                    msg[k] = v.clone();
                }
            }
        }

        self.send(cmd, Some(msg));
        token
    }

    pub fn send_and_wait_sync(&self, cmd: &str, data: Option<Value>, wait_cmd: Option<&str>, timeout: Duration) -> Option<Value> {
        let token = self.send_with_token(cmd, data, wait_cmd);
        token.wait(timeout)
    }

    fn msg_dispatch(&self, data: Value) {
        let cmd = data["cmd"].as_str().unwrap_or("");
        
        if self.notify_waiters(cmd, data.clone()) {
            return;
        }

        match cmd {
            "pong" => {},
            "sceneReset" | "sceneNotInit" => {
                let mut is_init = self.scene_is_init.lock().unwrap();
                *is_init = false;
            },
            "sceneInit" | "sceneIsInit" => {
                let mut is_init = self.scene_is_init.lock().unwrap();
                *is_init = true;
            },
            _ => {
                println!("[RadioManager] unknown cmd: {}, data: {:?}", cmd, data);
            }
        }
    }

    fn notify_waiters(&self, cmd: &str, data: Value) -> bool {
        let timestamp_id = data["timestampIdPython"].as_i64();
        let mut waiters_map = self.pending_waiters.lock().unwrap();
        
        if let Some(waiters) = waiters_map.get_mut(cmd) {
            let mut matched_idx = None;
            for (idx, token) in waiters.iter().enumerate() {
                let inner = token.inner.0.lock().unwrap();
                if let Some(tid) = timestamp_id {
                    if inner.time_base_id == tid {
                        matched_idx = Some(idx);
                        break;
                    }
                }
            }

            if let Some(idx) = matched_idx {
                let token = waiters.remove(idx);
                token.complete(data);
                return true;
            }
        }
        false
    }
}
