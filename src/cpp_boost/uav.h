#pragma once
#include "airplane_manager.h"
#include <thread>
#include <chrono>

namespace PhantasyIsland {

    class UAV {
    public:
        UAV() {
            auto& airs = get_airplane_manager();
            airs.flush();
            airs.start();
            airs.flush();
        }

        void sleep(double seconds) {
            std::this_thread::sleep_for(std::chrono::milliseconds(static_cast<int>(seconds * 1000)));
        }

        void destroy() {}

        void add_uav(const std::string& port) {
            get_airplane_manager().get_airplane(port);
        }

        std::shared_ptr<AirplaneController> p(const std::string& port) {
            return get_airplane_manager().get_airplane(port);
        }

        void land(const std::string& port) { if (auto u = p(port)) u->land(); }
        void emergency(const std::string& port) { if (auto u = p(port)) u->emergency(); }
        void takeoff(const std::string& port, int high) { if (auto u = p(port)) u->takeoff(high); }
        void up(const std::string& port, int distance) { if (auto u = p(port)) u->up(distance); }
        void down(const std::string& port, int distance) { if (auto u = p(port)) u->down(distance); }
        void forward(const std::string& port, int distance) { if (auto u = p(port)) u->forward(distance); }
        void back(const std::string& port, int distance) { if (auto u = p(port)) u->back(distance); }
        void left(const std::string& port, int distance) { if (auto u = p(port)) u->left(distance); }
        void right(const std::string& port, int distance) { if (auto u = p(port)) u->right(distance); }
        void goto_pos(const std::string& port, int x, int y, int h) { if (auto u = p(port)) u->goto_pos(x, y, h); }
        void rotate(const std::string& port, int degree) { if (auto u = p(port)) u->rotate(degree); }
        void speed(const std::string& port, int s) { if (auto u = p(port)) u->speed(s); }
        void led(const std::string& port, int r, int g, int b) { if (auto u = p(port)) u->led(r, g, b); }
        void stop(const std::string& port) { if (auto u = p(port)) u->hover(); }
        void hover(const std::string& port) { if (auto u = p(port)) u->hover(); }
    };

}
