use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use crate::http_layer::get_airplane_camera_image;
use crate::image_process::read_b64_img;

#[derive(Clone, Default)]
pub struct ImageInfo {
    pub img: Vec<u8>,
    pub id: i32,
    pub total_count: i32,
    pub progress_count: i32,
    pub ok: bool,
}

pub struct ImageReceiver {
    pub key_name: String,
    pub image_instance: Arc<Mutex<Option<ImageInfo>>>,
    pub cmd_id_counter: Arc<Mutex<i32>>,
    pub now_loading_id: Arc<Mutex<i32>>,
}

impl Default for ImageReceiver {
    fn default() -> Self {
        Self {
            key_name: String::new(),
            image_instance: Arc::new(Mutex::new(None)),
            cmd_id_counter: Arc::new(Mutex::new(1)),
            now_loading_id: Arc::new(Mutex::new(0)),
        }
    }
}

impl ImageReceiver {
    pub fn new(key_name: &str) -> Self {
        Self {
            key_name: key_name.to_string(),
            ..Default::default()
        }
    }

    pub fn send_cap_image<F1, F2>(
        &self,
        user_receive_callback: Option<F1>,
        user_progress_callback: Option<F2>,
    ) where
        F1: Fn(Vec<u8>) + Send + 'static,
        F2: Fn(i32, i32) + Send + 'static,
    {
        let key_name = self.key_name.clone();
        let image_instance_arc = Arc::clone(&self.image_instance);
        let cmd_id_counter_arc = Arc::clone(&self.cmd_id_counter);
        let now_loading_id_arc = Arc::clone(&self.now_loading_id);

        thread::spawn(move || {
            let current_id;
            {
                let mut counter = cmd_id_counter_arc.lock().unwrap();
                *counter += 1;
                current_id = *counter;
                let mut now_loading = now_loading_id_arc.lock().unwrap();
                *now_loading = current_id;
            }

            // 获取图片数据
            let img_data = read_b64_img(&get_airplane_camera_image(&key_name, "down")).unwrap_or_default();
            let total_count = 300; // 3 seconds * 100

            {
                let mut instance = image_instance_arc.lock().unwrap();
                *instance = Some(ImageInfo {
                    img: img_data,
                    id: current_id,
                    total_count,
                    progress_count: 0,
                    ok: false,
                });
            }

            loop {
                thread::sleep(Duration::from_millis(10));
                let mut done = false;
                let mut progress = 0;
                let mut total = 0;

                {
                    let mut instance_opt = image_instance_arc.lock().unwrap();
                    if let Some(instance) = instance_opt.as_mut() {
                        let now_loading = now_loading_id_arc.lock().unwrap();
                        if instance.id != *now_loading {
                            break;
                        }
                        instance.progress_count += 1;
                        progress = instance.progress_count;
                        total = instance.total_count;
                        if progress >= total {
                            instance.ok = true;
                            done = true;
                        }
                    }
                }

                if let Some(ref cb) = user_progress_callback {
                    cb(progress, total);
                }

                if done {
                    if let Some(ref cb) = user_receive_callback {
                        let instance_opt = image_instance_arc.lock().unwrap();
                        if let Some(instance) = instance_opt.as_ref() {
                            cb(instance.img.clone());
                        }
                    }
                    break;
                }
            }
        });
    }

    pub fn get_latest_image(&self) -> Option<Vec<u8>> {
        let instance = self.image_instance.lock().unwrap();
        instance.as_ref().filter(|i| i.ok).map(|i| i.img.clone())
    }

    pub fn get_transfer_progress(&self) -> (i32, i32) {
        let instance = self.image_instance.lock().unwrap();
        instance.as_ref().map(|i| (i.progress_count, i.total_count)).unwrap_or((0, 0))
    }

    pub fn is_transfer_in_progress(&self) -> bool {
        let instance = self.image_instance.lock().unwrap();
        instance.as_ref().map(|i| !i.ok).unwrap_or(false)
    }
}
