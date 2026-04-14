#pragma once
#include "airplane_core.h"
#include "http_layer.h"
#include <future>

namespace PhantasyIsland {

    class AirplaneController : public AirplaneCore {
    public:
        using AirplaneCore::AirplaneCore;

        void use_fast_mode(bool fast_mode = true, bool future_mode = true) {
            this->fast_mode = fast_mode;
            this->future_mode = future_mode;
        }

        HttpResponse takeoff(int high) { return _send_cmd("takeoff " + std::to_string(high)); }
        HttpResponse land() { return _send_cmd("land"); }
        HttpResponse emergency() { return _send_cmd("emergency"); }
        HttpResponse up(int distance) { return _send_cmd("up " + std::to_string(distance)); }
        HttpResponse down(int distance) { return _send_cmd("down " + std::to_string(distance)); }
        HttpResponse forward(int distance) { return _send_cmd("forward " + std::to_string(distance)); }
        HttpResponse back(int distance) { return _send_cmd("back " + std::to_string(distance)); }
        HttpResponse left(int distance) { return _send_cmd("left " + std::to_string(distance)); }
        HttpResponse right(int distance) { return _send_cmd("right " + std::to_string(distance)); }
        HttpResponse goto_pos(int x, int y, int h) { return _send_cmd("goto " + std::to_string(x) + " " + std::to_string(y) + " " + std::to_string(h)); }
        HttpResponse rotate(int degree) { return _send_cmd("rotate " + std::to_string(degree)); }
        HttpResponse speed(int s) { return _send_cmd("setSpeed " + std::to_string(s)); }
        HttpResponse led(int r, int g, int b) { return _send_cmd("light " + std::to_string(r) + " " + std::to_string(g) + " " + std::to_string(b)); }
        HttpResponse hover() { return _send_cmd("hover"); }

    private:
        int count = 1;
        bool fast_mode = false;
        bool future_mode = false;

        int _next_count() {
            count += 2;
            return count;
        }

        std::string _prepare_command(const std::string& command) {
            return keyName + " " + std::to_string(_next_count()) + " " + command;
        }

        HttpResponse _send_cmd(const std::string& command) {
            std::string full_cmd = _prepare_command(command);
            if (fast_mode) {
                return HttpLayer::send_cmd_volatile(full_cmd);
            } else {
                return HttpLayer::send_cmd(full_cmd);
            }
        }
    };

}
