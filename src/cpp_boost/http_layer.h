#pragma once
#include <string>
#include <vector>
#include <map>
#include <optional>
#include <boost/json.hpp>

namespace PhantasyIsland {

    // 常用类型定义
    using JsonValue = boost::json::value;
    using JsonObject = boost::json::object;

    // HTTP 响应统一格式
    struct HttpResponse {
        bool ok = false;
        std::string r;
        boost::json::value data;
    };

    namespace HttpLayer {
        HttpResponse ping();
        HttpResponse ping_volatile();
        HttpResponse start();
        HttpResponse start_volatile();
        
        HttpResponse send_cmd(const std::string& s);
        HttpResponse send_cmd_volatile(const std::string& s);
        
        JsonValue get_all_airplane_status();
        std::optional<std::string> get_airplane_camera_image(const std::string& port, const std::string& camera);
        
        std::map<std::string, JsonObject> process_airplane(const JsonValue& j);
    }
}
