use std::fmt;
use std::sync::{Arc, Mutex, Condvar};
use std::time::Duration;
use serde_json::Value;

pub struct WaitTokenInner {
    pub wait_cmd: String,
    pub time_base_id: i64,
    pub response: Option<Value>,
    pub done: bool,
}

pub struct WaitToken {
    pub inner: Arc<(Mutex<WaitTokenInner>, Condvar)>,
    pub post_processor: Option<Box<dyn Fn(Value) -> Value + Send + Sync>>,
}

impl fmt::Debug for WaitToken {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let inner = self.inner.0.lock().unwrap();
        f.debug_struct("WaitToken")
            .field("wait_cmd", &inner.wait_cmd)
            .field("time_base_id", &inner.time_base_id)
            .field("done", &inner.done)
            .finish()
    }
}

impl WaitToken {
    pub fn new(wait_cmd: &str, time_base_id: i64) -> Self {
        let inner = WaitTokenInner {
            wait_cmd: wait_cmd.to_string(),
            time_base_id,
            response: None,
            done: false,
        };
        Self {
            inner: Arc::new((Mutex::new(inner), Condvar::new())),
            post_processor: None,
        }
    }

    pub fn set_post_processor<F>(&mut self, processor: F)
    where
        F: Fn(Value) -> Value + Send + Sync + 'static,
    {
        self.post_processor = Some(Box::new(processor));
    }

    pub fn complete(&self, data: Value) {
        let (lock, cvar) = &*self.inner;
        let mut inner = lock.lock().unwrap();
        
        let processed_data = if let Some(ref processor) = self.post_processor {
            processor(data.clone())
        } else {
            data.clone()
        };

        inner.response = Some(processed_data);
        inner.done = true;
        cvar.notify_all();
    }

    pub fn wait(&self, timeout: Duration) -> Option<Value> {
        let (lock, cvar) = &*self.inner;
        let mut inner = lock.lock().unwrap();
        
        let result = cvar.wait_timeout_while(inner, timeout, |inner| !inner.done).unwrap();
        inner = result.0;
        
        inner.response.clone()
    }

    pub fn is_done(&self) -> bool {
        self.inner.0.lock().unwrap().done
    }
}
