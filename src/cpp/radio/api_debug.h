#pragma once
#include <nlohmann/json.hpp>
#include "api_module.h"

namespace phantasy_island {

class ApiDebug : public ApiModule {
public:
    using ApiModule::ApiModule;

    nlohmann::json ping() {
        return send_and_wait("ping", nullptr, "pong");
    }
};

} // namespace phantasy_island
