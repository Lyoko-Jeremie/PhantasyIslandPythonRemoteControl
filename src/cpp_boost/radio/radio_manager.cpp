#include "radio_manager.h"
#include <iostream>
#include <boost/json/serialize.hpp>
#include <boost/json/parse.hpp>

namespace PhantasyIsland {
namespace Radio {

// ApiModule 默认实现
std::optional<boost::json::value> ApiModule::send_sync(const std::string& cmd, boost::json::object data, const std::string& wait_cmd, float timeout, WaitToken::PostProcessor post_processor) {
    return _rm->_send_and_wait_sync(cmd, std::move(data), wait_cmd, timeout, post_processor);
}

std::shared_ptr<WaitToken> ApiModule::send_token(const std::string& cmd, boost::json::object data, const std::string& wait_cmd, WaitToken::PostProcessor post_processor) {
    return _rm->_send_with_token(cmd, std::move(data), wait_cmd, post_processor);
}

// 辅助：将 sio::message 转为 boost::json::value
boost::json::value sio_to_json(const sio::message::ptr& msg) {
    if (msg->get_flag() == sio::message::flag_string) return msg->get_string();
    if (msg->get_flag() == sio::message::flag_double) return msg->get_double();
    if (msg->get_flag() == sio::message::flag_boolean) return msg->get_bool();
    if (msg->get_flag() == sio::message::flag_integer) return msg->get_int();
    if (msg->get_flag() == sio::message::flag_object) {
        boost::json::object obj;
        for (auto const& pair : msg->get_map()) {
            obj[pair.first] = sio_to_json(pair.second);
        }
        return obj;
    }
    if (msg->get_flag() == sio::message::flag_array) {
        boost::json::array arr;
        for (auto const& item : msg->get_vector()) {
            arr.push_back(sio_to_json(item));
        }
        return arr;
    }
    return nullptr;
}

// 辅助：将 boost::json::value 转为 sio::message
sio::message::ptr json_to_sio(const boost::json::value& val) {
    if (val.is_string()) return sio::string_message::create(std::string(val.as_string()));
    if (val.is_double()) return sio::double_message::create(val.as_double());
    if (val.is_bool()) return sio::bool_message::create(val.as_bool());
    if (val.is_int64()) return sio::int_message::create(val.as_int64());
    if (val.is_object()) {
        auto obj = sio::object_message::create();
        for (auto const& pair : val.as_object()) {
            obj->get_map()[pair.key()] = json_to_sio(pair.value());
        }
        return obj;
    }
    if (val.is_array()) {
        auto arr = sio::array_message::create();
        for (auto const& item : val.as_array()) {
            arr->get_vector().push_back(json_to_sio(item));
        }
        return arr;
    }
    return nullptr;
}

RadioManager::RadioManager() {
    debugApi = std::make_unique<DebugApi>(this);
    sceneApi = std::make_unique<SceneApi>(this);
    flyApi = std::make_unique<FlyApi>(this);
    radioApi = std::make_unique<RadioApi>(this);
}

RadioManager::~RadioManager() {
    reset();
}

void RadioManager::connect(const std::string& url, const std::string& ns) {
    _namespace = ns;
    _init_listener();
    _client.connect(url);
}

void RadioManager::reset() {
    if (_client.opened()) {
        _client.close();
    }
    scene_is_init = false;
}

long long RadioManager::create_msg_timestamp_id() {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()
    ).count() * 100;
}

void RadioManager::_init_listener() {
    _client.socket(_namespace)->on("connect", sio::client::event_listener_aux([&](std::string const& name, sio::message::ptr const& data, bool isAck, sio::message::list &ack_resp) {
        std::cout << "[RadioManager] connected" << std::endl;
        _send("ping");
        sceneApi->getInitState();
    }));

    _client.socket(_namespace)->on("message", sio::client::event_listener_aux([&](std::string const& name, sio::message::ptr const& data, bool isAck, sio::message::list &ack_resp) {
        msg_dispatch(name, data);
    }));
}

void RadioManager::_send(const std::string& cmd, boost::json::object data) {
    data["cmd"] = cmd;
    _client.socket(_namespace)->emit("message", json_to_sio(data));
}

std::shared_ptr<WaitToken> RadioManager::_send_with_token(const std::string& cmd, boost::json::object data, std::string wait_cmd, WaitToken::PostProcessor post_processor) {
    if (wait_cmd.empty()) wait_cmd = cmd;
    long long time_id = create_msg_timestamp_id();
    auto token = std::make_shared<WaitToken>(wait_cmd, time_id);
    if (post_processor) token->set_post_processor(post_processor);

    {
        std::lock_guard<std::mutex> lock(_waiters_lock);
        _pending_waiters[wait_cmd].push_back(token);
    }

    data["timestampIdPython"] = time_id; // 保持与 Python 端一致的键名
    _send(cmd, std::move(data));
    return token;
}

std::optional<boost::json::value> RadioManager::_send_and_wait_sync(const std::string& cmd, boost::json::object data, std::string wait_cmd, float timeout, WaitToken::PostProcessor post_processor) {
    auto token = _send_with_token(cmd, std::move(data), wait_cmd, post_processor);
    return token->wait(timeout);
}

void RadioManager::msg_dispatch(const std::string& name, const sio::message::ptr& data) {
    auto j_val = sio_to_json(data);
    if (!j_val.is_object()) return;
    auto const& obj = j_val.as_object();

    std::string cmd;
    if (obj.contains("cmd") && obj.at("cmd").is_string()) {
        cmd = std::string(obj.at("cmd").as_string());
    } else {
        return;
    }

    if (_notify_waiters(cmd, obj)) return;

    if (cmd == "sceneInit" || cmd == "sceneIsInit") {
        scene_is_init = true;
    } else if (cmd == "sceneReset" || cmd == "sceneNotInit") {
        scene_is_init = false;
    }
}

bool RadioManager::_notify_waiters(const std::string& cmd, const boost::json::object& data) {
    long long timestamp_id = -1;
    if (data.contains("timestampIdPython")) {
        timestamp_id = data.at("timestampIdPython").as_int64();
    }

    std::lock_guard<std::mutex> lock(_waiters_lock);
    auto it = _pending_waiters.find(cmd);
    if (it == _pending_waiters.end()) return false;

    auto& refs = it->second;
    bool matched = false;
    for (auto vit = refs.begin(); vit != refs.end(); ) {
        if (auto token = vit->lock()) {
            if (!matched && timestamp_id != -1 && token->time_base_id == timestamp_id) {
                token->complete(data);
                matched = true;
                vit = refs.erase(vit);
            } else {
                ++vit;
            }
        } else {
            vit = refs.erase(vit);
        }
    }
    return matched;
}

}
}
