#pragma once
#include <string>
#include <functional>
#include <memory>
#include <nlohmann/json.hpp>
#include "radio_manager.h"

namespace phantasy_island {

enum class ApiMode {
    Sync,
    Token
};

class ApiModule {
public:
    explicit ApiModule(RadioManager& rm) : _rm(rm), _mode(ApiMode::Sync) {}

    void set_mode(ApiMode mode) {
        _mode = mode;
    }

    nlohmann::json send_and_wait(const std::string& cmd, const nlohmann::json& data, const std::string& wait_cmd, float timeout = 3.0f) {
        if (_mode == ApiMode::Sync) {
            return _rm.send_and_wait_sync(cmd, data, wait_cmd, timeout);
        } else {
            // 这里为了简化，Token 模式在 C++ 中可以通过返回 std::shared_future 实现
            // 但为了保持接口简单，我们主要实现同步
            return _rm.send_and_wait_sync(cmd, data, wait_cmd, timeout);
        }
    }

protected:
    RadioManager& _rm;
    ApiMode _mode;
};

} // namespace phantasy_island
