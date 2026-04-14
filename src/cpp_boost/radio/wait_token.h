#pragma once
#include <string>
#include <vector>
#include <functional>
#include <mutex>
#include <condition_variable>
#include <optional>
#include <chrono>
#include <boost/json.hpp>

namespace PhantasyIsland {
namespace Radio {

    class WaitToken {
    public:
        using PostProcessor = std::function<boost::json::value(const boost::json::object&)>;

        std::string wait_cmd;
        long long time_base_id;
        std::optional<boost::json::object> response;
        boost::json::value processed_response;

        WaitToken(const std::string& cmd, long long id) 
            : wait_cmd(cmd), time_base_id(id) {}

        void set_post_processor(PostProcessor processor) {
            _post_processor = processor;
        }

        void complete(const boost::json::object& data) {
            std::lock_guard<std::mutex> lock(_mutex);
            response = data;
            if (_post_processor) {
                processed_response = _post_processor(data);
            } else {
                processed_response = data;
            }
            _done = true;
            _cv.notify_all();
        }

        std::optional<boost::json::value> wait(float timeout_seconds = 3.0f) {
            std::unique_lock<std::mutex> lock(_mutex);
            if (!_done) {
                auto timeout = std::chrono::milliseconds(static_cast<int>(timeout_seconds * 1000));
                _cv.wait_for(lock, timeout, [this] { return _done; });
            }
            if (!response) return std::nullopt;
            return processed_response;
        }

        bool is_done() const {
            return _done;
        }

    private:
        std::mutex _mutex;
        std::condition_variable _cv;
        bool _done = false;
        PostProcessor _post_processor;
    };

}
}
