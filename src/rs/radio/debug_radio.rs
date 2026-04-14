use crate::radio::radio_manager::RadioManager;
use crate::radio::api_module::SendResult;
use std::time::Duration;

pub fn debug_radio() {
    let rm = RadioManager::new();
    // rm.connect("http://127.0.0.1:60002"); // 这是一个示例，实际中可能需要处理 Arc

    println!("{}", rm.create_msg_timestamp_id());

    match rm.ping() {
        Some(res) => println!("Ping result: {:?}", res),
        None => println!("Ping timeout"),
    }

    match rm.radio_api.list_radio_local_objects_ids() {
        SendResult::Sync(Some(data)) => println!("Local objects: {:?}", data),
        _ => println!("Failed to list objects"),
    }

    println!("is_scene_init: {:?}", rm.radio_api.is_scene_init());
}
