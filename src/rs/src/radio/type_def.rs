use serde::{Deserialize, Serialize};

/// 三维坐标，单位米，格式 (x, y, z)
pub type XYZ = (f64, f64, f64);

/// 链路可达性检查的可选参数
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RadioCheckOptions {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_mhz: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tx_power_dbm: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rx_sensitivity_dbm: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fresnel_zone_ratio: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub skip_fresnel_zone_check: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enable_multipath: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_reflection_paths: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_reflection_path_length_ratio: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_tx_antenna_gain_d_bi: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_rx_antenna_gain_d_bi: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enable_antenna_pattern: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enable_mutual_coupling: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub coupling_negligible_threshold_wavelengths: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enable_sinr: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub receiver_bandwidth_hz: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min_sinr_db: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enable_frequency_isolation: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enable_near_field_correction: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enable_node_body_occlusion: Option<bool>,
}

/// 链路可达性检查请求消息
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckReachabilityRequest {
    pub a_tx: XYZ,
    pub b_rx: XYZ,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub options: Option<RadioCheckOptions>,
}

/// 更新对象位置的消息
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateObjectPosRequest {
    pub object_id: String,
    pub position: XYZ,
}

/// 更新对象的电磁属性
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateMeshRadioMaterialRequest {
    pub mesh_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub material_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thickness_m: Option<f64>,
}

/// 电磁材料属性定义
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RadioMaterialProperties {
    pub id: String,
    pub display_name: String,
    pub penetration_loss_d_b_per_meter: f64,
    pub reflection_coefficient: f64,
    pub default_thickness_m: f64,
}

/// 摇杆输入消息
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct JoyStickInput {
    pub vx: f64,
    pub vy: f64,
    pub vz: f64,
    pub yaw_rate: f64,
}
