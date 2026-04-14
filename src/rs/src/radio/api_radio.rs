use crate::radio::api_module::{ApiModule, SendResult};
use crate::radio::type_def::{XYZ, RadioCheckOptions, RadioMaterialProperties};
use serde_json::json;

pub struct RadioApi {
    pub base: ApiModule,
}

impl RadioApi {
    pub fn new(base: ApiModule) -> Self {
        Self { base }
    }

    pub fn is_scene_init(&self) -> SendResult {
        // 在 Rust 中，post_processor 需要在 RadioManager 层处理或在此处处理结果
        self.base.send("radio.isSceneInit", None, None)
    }

    pub fn is_radio_reachability_checker_init(&self) -> SendResult {
        self.base.send("radio.isRadioReachabilityCheckerInit", None, None)
    }

    pub fn check_reachability(&self, a_tx: XYZ, b_rx: XYZ, options: Option<RadioCheckOptions>) -> SendResult {
        self.base.send("radio.checkReachability", Some(json!({
            "aTx": a_tx,
            "bRx": b_rx,
            "options": options
        })), None)
    }

    pub fn update_object_pos(&self, object_id: &str, position: XYZ) -> SendResult {
        self.base.send("radio.updateObjectPos", Some(json!({
            "objectId": object_id,
            "position": position
        })), None)
    }

    pub fn get_object_pos(&self, object_id: &str) -> SendResult {
        self.base.send("radio.updateObjectPos", Some(json!({
            "objectId": object_id
        })), None)
    }

    pub fn update_mesh_radio_material(&self, mesh_id: &str, material_id: Option<String>, thickness_m: Option<f64>) -> SendResult {
        self.base.send("radio.updateMeshRadioMaterial", Some(json!({
            "meshId": mesh_id,
            "materialId": material_id,
            "thickness_m": thickness_m
        })), None)
    }

    pub fn get_all_radio_material(&self) -> SendResult {
        self.base.send("radio.getAllRadioMaterial", None, None)
    }

    pub fn local_radio_material(&self) -> SendResult {
        self.base.send("radio.localRadioMaterial", None, None)
    }

    pub fn get_building_radio_material(&self) -> SendResult {
        self.base.send("radio.getBuildingRadioMaterial", None, None)
    }

    pub fn add_radio_material(&self, material: RadioMaterialProperties) -> SendResult {
        self.base.send("radio.addRadioMaterial", Some(json!(material)), None)
    }

    pub fn list_radio_local_objects_ids(&self) -> SendResult {
        self.base.send("radio.listRadioLocalObjects", None, None)
    }
}

impl Default for RadioApi {
    fn default() -> Self {
        Self { base: ApiModule::default() }
    }
}
