#pragma once
#include <string>
#include <map>
#include <functional>
#include <mutex>
#include <atomic>
#include <sio_client.h>
#include <nlohmann/json.hpp>
#include "wait_token.h"

namespace phantasy_island {

class RadioManager {
public:
    static RadioManager& instance() {
        static RadioManager _instance;
        return _instance;
    }

    void connect(const std::string& url = "http://127.0.0.1:60002", const std::string& ns = "/UserSide") {
        std::lock_guard<std::mutex> lock(client_mutex);
        _namespace = ns;
        client.connect(url);
        _init_listener();
    }

    void reset() {
        _send("ResetScene");
    }

    void ping() {
        _send("Ping");
    }

    void _send(const std::string& cmd, const nlohmann::json& data = nullptr) {
        nlohmann::json payload;
        payload["cmd"] = cmd;
        payload["data"] = data;
        payload["msgTimestampId"] = _create_msg_timestamp_id();
        client.socket(_namespace)->emit("message", payload.dump());
    }

    nlohmann::json send_and_wait_sync(const std::string& cmd, const nlohmann::json& data, const std::string& wait_cmd, float timeout = 3.0f) {
        auto token = std::make_shared<WaitToken<nlohmann::json>>();
        std::string msg_id = _create_msg_timestamp_id();
        
        {
            std::lock_guard<std::mutex> lock(waiters_mutex);
            waiters[wait_cmd + "_" + msg_id] = token;
        }

        nlohmann::json payload;
        payload["cmd"] = cmd;
        payload["data"] = data;
        payload["msgTimestampId"] = msg_id;
        client.socket(_namespace)->emit("message", payload.dump());

        return token->wait(timeout);
    }

private:
    RadioManager() {
        client.set_open_listener([this]() {
            connected = true;
        });
        client.set_close_listener([this](sio::client::close_reason const& reason) {
            connected = false;
        });
    }

    std::string _create_msg_timestamp_id() {
        auto now = std::chrono::system_clock::now();
        return std::to_string(std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count());
    }

    void _init_listener() {
        client.socket(_namespace)->on("message", [this](sio::event& ev) {
            if (ev.get_messages().size() > 0) {
                auto data = nlohmann::json::parse(ev.get_message()->get_string());
                _notify_waiters(data);
            }
        });
    }

    void _notify_waiters(const nlohmann::json& data) {
        std::string cmd = data.value("cmd", "");
        std::string msg_id = data.value("msgTimestampId", "");
        std::string key = cmd + "_" + msg_id;

        std::lock_guard<std::mutex> lock(waiters_mutex);
        if (waiters.count(key)) {
            waiters[key]->set_value(data["data"]);
            waiters.erase(key);
        }
    }

    sio::client client;
    std::string _namespace;
    std::mutex client_mutex;
    std::mutex waiters_mutex;
    std::map<std::string, std::shared_ptr<WaitToken<nlohmann::json>>> waiters;
    std::atomic<bool> connected{false};
};

} // namespace phantasy_island
