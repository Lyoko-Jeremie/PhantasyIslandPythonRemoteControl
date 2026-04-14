#pragma once
#include <string>
#include <vector>
#include <nlohmann/json.hpp>

namespace phantasy_island {

struct ViewMaterialChangeCommandSimple {
    std::string material_name;
    nlohmann::json to_json() const {
        return {{"materialName", material_name}};
    }
};

struct ViewMaterialChangeCommand {
    // 包含大量字段，这里简化移植
    std::string base_color;
    float roughness;
    float metallic;

    nlohmann::json to_json() const {
        return {
            {"baseColor", base_color},
            {"roughness", roughness},
            {"metallic", metallic}
        };
    }
};

} // namespace phantasy_island
