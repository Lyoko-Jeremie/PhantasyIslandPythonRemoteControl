#pragma once
#include <string>
#include <memory>
#include "airplane_manager.h"

namespace phantasy_island {

class UAV {
public:
    UAV() : airs(get_airplane_manager()) {
        airs.flush();
        airs.start();
        airs.flush();
    }

    void sleep(float seconds) {
        airs.sleep(static_cast<int>(seconds * 1000));
    }

    void add_uav(const std::string& port) {
        airs.get_airplane(port);
    }

    std::shared_ptr<AirplaneController> p(const std::string& port) {
        return airs.get_airplane(port);
    }

    void land(const std::string& port) {
        auto air = p(port);
        if (air) air->land();
    }

    void takeoff(const std::string& port, int high) {
        auto air = p(port);
        if (air) air->takeoff(high);
    }

    void up(const std::string& port, int distance) {
        auto air = p(port);
        if (air) air->up(distance);
    }

    void down(const std::string& port, int distance) {
        auto air = p(port);
        if (air) air->down(distance);
    }

    void forward(const std::string& port, int distance) {
        auto air = p(port);
        if (air) air->forward(distance);
    }

    void back(const std::string& port, int distance) {
        auto air = p(port);
        if (air) air->back(distance);
    }

    void left(const std::string& port, int distance) {
        auto air = p(port);
        if (air) air->left(distance);
    }

    void right(const std::string& port, int distance) {
        auto air = p(port);
        if (air) air->right(distance);
    }

    void goto_pos(const std::string& port, int x, int y, int h) {
        auto air = p(port);
        if (air) air->goto_pos(x, y, h);
    }

    void rotate(const std::string& port, int degree) {
        auto air = p(port);
        if (air) air->rotate(degree);
    }

    void stop(const std::string& port) {
        auto air = p(port);
        if (air) air->stop();
    }

    void hover(const std::string& port) {
        auto air = p(port);
        if (air) air->hover();
    }

private:
    AirplaneManager& airs;
};

} // namespace phantasy_island
