#pragma once
#include <string>
#include <nlohmann/json.hpp>
#include <cpr/cpr.h>
#include "config.h"

namespace phantasy_island {

class HttpLayer {
public:
    static nlohmann::json send_cmd(const std::string& cmd) {
        auto url = "http://" + Config::remote_location + "/ECU_HTTP/sendStringCmd";
        auto r = cpr::Get(cpr::Url{url}, cpr::Parameters{{"c", cmd}}, cpr::Timeout{10000});
        if (r.status_code == 200) {
            return nlohmann::json::parse(r.text);
        }
        return {{"ok", false}, {"r", "Error"}};
    }

    static nlohmann::json get_all_airplane_status() {
        auto url = "http://" + Config::remote_location + "/ECU_HTTP/requestPullAllAirplaneState";
        auto r = cpr::Get(cpr::Url{url}, cpr::Timeout{5000});
        if (r.status_code == 200) {
            return nlohmann::json::parse(r.text);
        }
        throw std::runtime_error("ConnectionError");
    }

    static std::string get_airplane_camera_image(const std::string& port, const std::string& camera) {
        auto url = "http://" + Config::remote_location + "/ECU_HTTP/requestPullImage";
        auto r = cpr::Get(cpr::Url{url}, cpr::Parameters{{"flyPort", port}, {"imageType", camera}}, cpr::Timeout{5000});
        if (r.status_code == 200) {
            auto j = nlohmann::json::parse(r.text);
            if (j.value("ok", false)) {
                return j.value("imgDataString", "");
            }
        }
        return "";
    }
};

} // namespace phantasy_island
