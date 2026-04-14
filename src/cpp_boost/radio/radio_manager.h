#pragma once
#include <string>
#include <memory>
#include <map>
#include <vector>
#include <mutex>
#include <chrono>
#include <boost/json.hpp>

// 假设使用 socket.io-client-cpp
#include <sio_client.h>

#include "wait_token.h"
#include "apis.h"

namespace PhantasyIsland {
namespace Radio {

    class RadioManager {
    public:
        RadioManager();
        ~RadioManager();

        void connect(const std::string& url = "http://127.0.0.1:60002", const std::string& ns = "/UserSide");
        void reset();

        // 子 API
        std::unique_ptr<DebugApi> debugApi;
        std::unique_ptr<SceneApi> sceneApi;
        std::unique_ptr<FlyApi> flyApi;
        std::unique_ptr<RadioApi> radioApi;

        // 内部发送接口
        void _send(const std::string& cmd, boost::json::object data = {});
        
        std::shared_ptr<WaitToken> _send_with_token(
            const std::string& cmd, 
            boost::json::object data = {}, 
            std::string wait_cmd = "", 
            WaitToken::PostProcessor post_processor = nullptr
        );

        std::optional<boost::json::value> _send_and_wait_sync(
            const std::string& cmd, 
            boost::json::object data = {}, 
            std::string wait_cmd = "", 
            float timeout = 3.0f,
            WaitToken::PostProcessor post_processor = nullptr
        );

    private:
        sio::client _client;
        std::string _namespace;
        bool scene_is_init = false;

        std::mutex _waiters_lock;
        std::map<std::string, std::vector<std::weak_ptr<WaitToken>>> _pending_waiters;

        long long create_msg_timestamp_id();
        void _init_listener();
        void msg_dispatch(const std::string& name, const sio::message::ptr& data);
        bool _notify_waiters(const std::string& cmd, const boost::json::object& data);
    };

}
}
