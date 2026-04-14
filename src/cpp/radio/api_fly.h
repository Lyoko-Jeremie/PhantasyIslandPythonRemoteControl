#pragma once
#include <string>
#include <nlohmann/json.hpp>
#include "api_module.h"

namespace phantasy_island {

class ApiFly : public ApiModule {
public:
    using ApiModule::ApiModule;

    nlohmann::json list_fly_object() {
        return send_and_wait("fly.listFlyObject", nullptr, "ReceiveFlyListObject"); // 假设对应的返回指令
    }

    nlohmann::json get_fly_object_info(const std::string& keyName) {
        return send_and_wait("fly.getFlyObjectInfo", {{"keyName", keyName}}, "ReceiveFlyObjectInfo");
    }

    nlohmann::json get_fly_object_camera_image_down(const std::string& keyName) {
        return send_and_wait("fly.getFlyObjectCameraImageDown", {{"keyName", keyName}}, "ReceiveFlyObjectCameraImageDown");
    }

    nlohmann::json get_fly_object_camera_image_front(const std::string& keyName) {
        return send_and_wait("fly.getFlyObjectCameraImageFront", {{"keyName", keyName}}, "ReceiveFlyObjectCameraImageFront");
    }
};

} // namespace phantasy_island
