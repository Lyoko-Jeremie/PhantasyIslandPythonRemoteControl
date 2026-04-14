#pragma once
#include <string>
#include <vector>
#include <nlohmann/json.hpp>

namespace phantasy_island {

struct Vector3 {
    float x, y, z;
    NLOHMANN_DEFINE_TYPE_INTRUSIVE(Vector3, x, y, z)
};

struct RadioCheckOptions {
    bool check_terrain = true;
    bool check_building = true;
    bool check_foliage = true;
    bool check_mesh = true;
    bool check_water = true;

    nlohmann::json to_json() const {
        return {
            {"checkTerrain", check_terrain},
            {"checkBuilding", check_building},
            {"checkFoliage", check_foliage},
            {"checkMesh", check_mesh},
            {"checkWater", check_water}
        };
    }
};

struct CheckReachabilityRequest {
    Vector3 start;
    Vector3 end;
    RadioCheckOptions options;

    nlohmann::json to_json() const {
        return {
            {"start", start},
            {"end", end},
            {"options", options.to_json()}
        };
    }
};

struct UpdateObjectPosRequest {
    std::string name;
    Vector3 pos;
    Vector3 rot;

    nlohmann::json to_json() const {
        return {
            {"name", name},
            {"pos", pos},
            {"rot", rot}
        };
    }
};

struct RadioMaterialProperties {
    float frequency = 2.4e9f;
    float conductivity = 0.0f;
    float permittivity = 1.0f;
    float thickness = 0.0f;

    nlohmann::json to_json() const {
        return {
            {"frequency", frequency},
            {"conductivity", conductivity},
            {"permittivity", permittivity},
            {"thickness", thickness}
        };
    }
};

struct UpdateMeshRadioMaterialRequest {
    std::string mesh_name;
    RadioMaterialProperties properties;

    nlohmann::json to_json() const {
        return {
            {"meshName", mesh_name},
            {"properties", properties.to_json()}
        };
    }
};

struct JoyStickInput {
    float left_x = 0.0f;
    float left_y = 0.0f;
    float right_x = 0.0f;
    float right_y = 0.0f;

    nlohmann::json to_json() const {
        return {
            {"leftX", left_x},
            {"leftY", left_y},
            {"rightX", right_x},
            {"rightY", right_y}
        };
    }
};

} // namespace phantasy_island
