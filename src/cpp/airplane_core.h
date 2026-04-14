#pragma once
#include <string>
#include <nlohmann/json.hpp>

namespace phantasy_island {

struct AirplaneFlyStatus {
    bool landing;
    bool is_stop;
    float x, y, h;
    float rx, ry, rz;

    NLOHMANN_DEFINE_TYPE_INTRUSIVE(AirplaneFlyStatus, landing, is_stop, x, y, h, rx, ry, rz)
};

class AirplaneCore {
public:
    std::string key_name;
    std::string type_name;
    long long update_timestamp;
    AirplaneFlyStatus status;
    std::string camera_front;
    std::string camera_down;

    AirplaneCore() = default;
    virtual ~AirplaneCore() = default;
};

} // namespace phantasy_island
