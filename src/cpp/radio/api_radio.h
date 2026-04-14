#pragma once
#include <string>
#include <nlohmann/json.hpp>
#include "radio_manager.h"
#include "type_def.h"

namespace phantasy_island {

class ApiRadio {
public:
    static nlohmann::json check_reachability(const CheckReachabilityRequest& req) {
        return RadioManager::instance().send_and_wait_sync(
            "RequestRadioCheckReachability",
            req.to_json(),
            "ReceiveRadioCheckReachability"
        );
    }

    static void update_object_pos(const UpdateObjectPosRequest& req) {
        RadioManager::instance()._send("RequestUpdateObjectPos", req.to_json());
    }

    static void update_mesh_radio_material(const UpdateMeshRadioMaterialRequest& req) {
        RadioManager::instance()._send("RequestUpdateMeshRadioMaterial", req.to_json());
    }
};

} // namespace phantasy_island
