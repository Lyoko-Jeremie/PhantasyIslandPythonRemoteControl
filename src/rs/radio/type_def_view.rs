use serde::{Deserialize, Serialize};

/// 修改 mesh 的可视化材质的指令（完整版）
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ViewMaterialChangeCommand {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub material_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub opacity: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transparent: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub visible: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wireframe: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub side: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub depth_test: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub depth_write: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alpha_test: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub blending: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub vertex_colors: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fog: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub emissive: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub emissive_intensity: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metalness: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub roughness: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub env_map_intensity: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub flat_shading: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shininess: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub specular: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub clearcoat: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub clearcoat_roughness: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transmission: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ior: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thickness: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sheen: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sheen_roughness: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sheen_color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attenuation_color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub attenuation_distance: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub iridescence: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub iridescence_ior: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub iridescence_thickness_range: Option<(f64, f64)>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub specular_intensity: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub specular_color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reflectivity: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dispersion: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub anisotropy: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub anisotropy_rotation: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub map_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub normal_map_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub roughness_map_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metalness_map_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub emissive_map_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ao_map_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alpha_map_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bump_map_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub displacement_map_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub normal_scale: Option<(f64, f64)>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bump_scale: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub displacement_scale: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub displacement_bias: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ao_map_intensity: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub map_repeat: Option<(f64, f64)>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub map_offset: Option<(f64, f64)>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub map_rotation: Option<f64>,
}

/// 修改 mesh 的可视化材质的指令（简化版）
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ViewMaterialChangeCommandSimple {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub opacity: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transparent: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub visible: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub wireframe: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub side: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub fog: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub emissive: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub emissive_intensity: Option<f64>,
}
