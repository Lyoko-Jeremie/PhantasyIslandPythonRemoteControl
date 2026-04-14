use std::sync::{Arc, Weak};
use std::time::Duration;
use serde_json::Value;
use crate::radio::radio_manager::RadioManager;
use crate::radio::wait_token::WaitToken;

pub enum SendResult {
    Sync(Option<Value>),
    Token(Arc<WaitToken>),
}

pub struct ApiModule {
    pub rm: Weak<RadioManager>,
    pub mode: String, // "sync", "token"
}

impl ApiModule {
    pub fn new(rm: Weak<RadioManager>) -> Self {
        Self {
            rm,
            mode: "sync".to_string(),
        }
    }

    pub fn set_mode(&mut self, mode: &str) {
        self.mode = mode.to_string();
    }

    pub fn send(&self, cmd: &str, data: Option<Value>, wait_cmd: Option<&str>) -> SendResult {
        if let Some(rm) = self.rm.upgrade() {
            match self.mode.as_str() {
                "token" => {
                    let token = rm.send_with_token(cmd, data, wait_cmd);
                    SendResult::Token(token)
                },
                _ => {
                    let res = rm.send_and_wait_sync(cmd, data, wait_cmd, Duration::from_secs(3));
                    SendResult::Sync(res)
                }
            }
        } else {
            SendResult::Sync(None)
        }
    }
}

impl Default for ApiModule {
    fn default() -> Self {
        Self {
            rm: Weak::new(),
            mode: "sync".to_string(),
        }
    }
}
