#pragma once
#include <string>
#include <future>
#include <chrono>

namespace phantasy_island {

template<typename T>
class WaitToken {
public:
    WaitToken() {
        promise = std::make_shared<std::promise<T>>();
        future = promise->get_future();
    }

    void set_value(const T& val) {
        promise->set_value(val);
    }

    T wait(float timeout_seconds = 3.0f) {
        auto status = future.wait_for(std::chrono::duration<float>(timeout_seconds));
        if (status == std::future_status::ready) {
            return future.get();
        }
        throw std::runtime_error("Wait timeout");
    }

    std::shared_future<T> get_future() {
        return future;
    }

private:
    std::shared_ptr<std::promise<T>> promise;
    std::shared_future<T> future;
};

} // namespace phantasy_island
