use crate::radio::api_module::{ApiModule, SendResult};
use crate::radio::type_def_view::{ViewMaterialChangeCommand, ViewMaterialChangeCommandSimple};
use serde_json::json;

pub struct SceneApi {
    pub base: ApiModule,
}

impl SceneApi {
    pub fn new(base: ApiModule) -> Self {
        Self { base }
    }

    pub fn list_all_mesh_object_in_scene(&self) -> SendResult {
        self.base.send("scene.listAllMeshObjectInScene", None, None)
    }

    pub fn get_object_info_by_id(&self, object_id: &str) -> SendResult {
        self.base.send("scene.getObjectInfoById", Some(json!({ "objectId": object_id })), None)
    }

    pub fn remove_object_by_id(&self, object_id: &str) -> SendResult {
        self.base.send("scene.removeObjectById", Some(json!({ "objectId": object_id })), None)
    }

    pub fn move_object_by_id(&self, object_id: &str, position: (f64, f64, f64)) -> SendResult {
        self.base.send("scene.moveObjectById", Some(json!({
            "objectId": object_id,
            "position": [position.0, position.1, position.2]
        })), None)
    }

    pub fn set_object_radio_material(&self, object_id: &str, material_id: Option<String>, thickness_m: Option<f64>) -> SendResult {
        self.base.send("scene.setObjectRadioMaterial", Some(json!({
            "objectId": object_id,
            "materialId": material_id,
            "thickness_m": thickness_m
        })), None)
    }

    pub fn update_mesh_view_material(&self, mesh_id: &str, view_material_change_command: ViewMaterialChangeCommand) -> SendResult {
        self.base.send("scene.updateMeshViewMaterial", Some(json!({
            "meshId": mesh_id,
            "viewMaterialChangeCommand": view_material_change_command
        })), None)
    }

    pub fn update_mesh_view_material_simple(&self, mesh_id: &str, view_material_change_command_simple: ViewMaterialChangeCommandSimple) -> SendResult {
        self.base.send("scene.updateMeshViewMaterialSimple", Some(json!({
            "meshId": mesh_id,
            "viewMaterialChangeCommandSimple": view_material_change_command_simple
        })), None)
    }
}

impl Default for SceneApi {
    fn default() -> Self {
        Self { base: ApiModule::default() }
    }
}
