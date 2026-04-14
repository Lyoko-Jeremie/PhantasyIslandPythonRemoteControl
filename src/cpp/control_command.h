#pragma once
#include <string>
#include "airplane_core.h"
#include "http_layer.h"

namespace phantasy_island {

class AirplaneController : public AirplaneCore {
public:
    using AirplaneCore::AirplaneCore;

    void takeoff(int high) {
        _send_cmd("takeoff " + std::to_string(high));
    }

    void land() {
        _send_cmd("land");
    }

    void emergency() {
        _send_cmd("emergency");
    }

    void up(int distance) {
        _send_cmd("up " + std::to_string(distance));
    }

    void down(int distance) {
        _send_cmd("down " + std::to_string(distance));
    }

    void forward(int distance) {
        _send_cmd("forward " + std::to_string(distance));
    }

    void back(int distance) {
        _send_cmd("back " + std::to_string(distance));
    }

    void left(int distance) {
        _send_cmd("left " + std::to_string(distance));
    }

    void right(int distance) {
        _send_cmd("right " + std::to_string(distance));
    }

    void goto_pos(int x, int y, int h) {
        _send_cmd("goto " + std::to_string(x) + " " + std::to_string(y) + " " + std::to_string(h));
    }

    void rotate(int degree) {
        _send_cmd("rotate " + std::to_string(degree));
    }

    void speed(int speed_val) {
        _send_cmd("speed " + std::to_string(speed_val));
    }

    void stop() {
        _send_cmd("stop");
    }

    void hover() {
        _send_cmd("hover");
    }

private:
    void _send_cmd(const std::string& command) {
        HttpLayer::send_cmd(key_name + " " + command);
    }
};

} // namespace phantasy_island
