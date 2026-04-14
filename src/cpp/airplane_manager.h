#pragma once
#include <map>
#include <memory>
#include <string>
#include <thread>
#include <chrono>
#include "control_command.h"
#include "http_layer.h"

namespace phantasy_island {

class AirplaneManager {
public:
    static AirplaneManager& instance() {
        static AirplaneManager _instance;
        return _instance;
    }

    void ping() {
        HttpLayer::send_cmd("ping");
    }

    void start() {
        HttpLayer::send_cmd("start");
    }

    std::shared_ptr<AirplaneController> get_airplane(const std::string& id) {
        if (airplanes_table.find(id) == airplanes_table.end()) {
            flush(); // 尝试刷新以获取新加入的无人机
        }
        if (airplanes_table.count(id)) {
            return airplanes_table[id];
        }
        return nullptr;
    }

    void flush() {
        try {
            auto status_resp = HttpLayer::get_all_airplane_status();
            if (status_resp.value("ok", false)) {
                auto airplanes = status_resp["airplanes"];
                for (auto& air_data : airplanes) {
                    std::string key = air_data["keyName"];
                    if (airplanes_table.find(key) == airplanes_table.end()) {
                        airplanes_table[key] = std::make_shared<AirplaneController>();
                    }
                    auto& controller = airplanes_table[key];
                    controller->key_name = key;
                    controller->type_name = air_data["typeName"];
                    controller->update_timestamp = air_data["updateTimestamp"];
                    controller->status = air_data["status"].get<AirplaneFlyStatus>();
                    controller->camera_front = air_data["cameraFront"].value("imgDataString", "");
                    controller->camera_down = air_data["cameraDown"].value("imgDataString", "");
                }
            }
        } catch (...) {
            // Log or handle error
        }
    }

    void sleep(int milliseconds) {
        std::this_thread::sleep_for(std::chrono::milliseconds(milliseconds));
    }

private:
    AirplaneManager() = default;
    std::map<std::string, std::shared_ptr<AirplaneController>> airplanes_table;
};

inline AirplaneManager& get_airplane_manager() {
    return AirplaneManager::instance();
}

} // namespace phantasy_island
