use crate::radio::api_module::{ApiModule, SendResult};

pub struct DebugApi {
    pub base: ApiModule,
}

impl DebugApi {
    pub fn new(base: ApiModule) -> Self {
        Self { base }
    }

    pub fn ping(&self) -> SendResult {
        self.base.send("ping", None, Some("pong"))
    }
}

impl Default for DebugApi {
    fn default() -> Self {
        Self { base: ApiModule::default() }
    }
}
