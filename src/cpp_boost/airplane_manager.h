#pragma once
#include "control_command.h"
#include "http_layer.h"
#include <map>
#include <memory>
#include <mutex>

namespace PhantasyIsland {

    class AirplaneManager {
    public:
        static AirplaneManager& getInstance() {
            static AirplaneManager instance;
            return instance;
        }

        HttpResponse ping() { return HttpLayer::ping(); }
        HttpResponse ping_volatile() { return HttpLayer::ping_volatile(); }
        HttpResponse start() { return HttpLayer::start(); }
        HttpResponse start_volatile() { return HttpLayer::start_volatile(); }

        std::shared_ptr<AirplaneController> get_airplane(const std::string& id) {
            std::lock_guard<std::mutex> lock(_mutex);
            auto it = airplanes_table.find(id);
            if (it != airplanes_table.end()) return it->second;
            return nullptr;
        }

        void flush() {
            auto status_data = HttpLayer::get_all_airplane_status();
            auto airplane_status = HttpLayer::process_airplane(status_data);
            
            std::lock_guard<std::mutex> lock(_mutex);
            for (auto const& [k, status] : airplane_status) {
                auto fly_status = make_AirplaneFlyStatus(status.at("status").as_object());
                std::string cf = status.at("cameraFront").is_string() ? std::string(status.at("cameraFront").as_string()) : "";
                std::string cd = status.at("cameraDown").is_string() ? std::string(status.at("cameraDown").as_string()) : "";

                if (airplanes_table.find(k) == airplanes_table.end()) {
                    airplanes_table[k] = std::make_shared<AirplaneController>(
                        std::string(status.at("keyName").as_string()),
                        std::string(status.at("typeName").as_string()),
                        status.at("updateTimestamp").as_int64(),
                        fly_status,
                        cf,
                        cd
                    );
                } else {
                    auto a = airplanes_table[k];
                    a->keyName = std::string(status.at("keyName").as_string());
                    a->typeName = std::string(status.at("typeName").as_string());
                    a->updateTimestamp = status.at("updateTimestamp").as_int64();
                    a->status = fly_status;
                    a->cameraFront = cf;
                    a->cameraDown = cd;
                }
            }
        }

    private:
        AirplaneManager() = default;
        std::map<std::string, std::shared_ptr<AirplaneController>> airplanes_table;
        std::mutex _mutex;
    };

    inline AirplaneManager& get_airplane_manager() {
        return AirplaneManager::getInstance();
    }

}
