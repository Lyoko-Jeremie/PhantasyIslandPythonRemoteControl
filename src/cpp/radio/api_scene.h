#pragma once
#include <string>
#include <vector>
#include <nlohmann/json.hpp>
#include "api_module.h"

namespace phantasy_island {

class ApiScene : public ApiModule {
public:
    using ApiModule::ApiModule;

    nlohmann::json list_all_mesh_object_in_scene() {
        return send_and_wait("scene.listAllMeshObjectInScene", nullptr, "ReceiveSceneListAllMeshObjectInScene");
    }

    nlohmann::json get_object_info_by_id(const std::string& objectId) {
        return send_and_wait("scene.getObjectInfoById", {{"objectId", objectId}}, "ReceiveSceneGetObjectInfoById");
    }

    nlohmann::json remove_object_by_id(const std::string& objectId) {
        return send_and_wait("scene.removeObjectById", {{"objectId", objectId}}, "ReceiveSceneRemoveObjectById");
    }

    nlohmann::json move_object_by_id(const std::string& objectId, float x, float y, float z) {
        return send_and_wait("scene.moveObjectById", 
            {{"objectId", objectId}, {"position", {x, y, z}}}, 
            "ReceiveSceneMoveObjectById");
    }

    nlohmann::json set_object_radio_material(const std::string& objectId, const std::string& materialId, float thickness_m) {
        return send_and_wait("scene.setObjectRadioMaterial",
            {{"objectId", objectId}, {"materialId", materialId}, {"thickness_m", thickness_m}},
            "ReceiveSceneSetObjectRadioMaterial");
    }
};

} // namespace phantasy_island
