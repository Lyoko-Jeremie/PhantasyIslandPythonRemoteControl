#pragma once
#include <string>
#include <memory>
#include <functional>
#include <optional>
#include <boost/json.hpp>
#include "wait_token.h"

namespace PhantasyIsland {
namespace Radio {

    class RadioManager;

    class ApiModule {
    public:
        enum class Mode { Sync, Token };

        ApiModule(RadioManager* rm) : _rm(rm), _mode(Mode::Sync) {}

        void mode(Mode m) { _mode = m; }

        // 发送并返回 JsonValue (Sync 模式) 或 WaitToken (Token 模式)
        // 在 C++ 中，为了类型安全，提供两种显式调用
        std::optional<boost::json::value> send_sync(
            const std::string& cmd, 
            boost::json::object data = {}, 
            const std::string& wait_cmd = "", 
            float timeout = 3.0f,
            WaitToken::PostProcessor post_processor = nullptr
        );

        std::shared_ptr<WaitToken> send_token(
            const std::string& cmd, 
            boost::json::object data = {}, 
            const std::string& wait_cmd = "",
            WaitToken::PostProcessor post_processor = nullptr
        );

    protected:
        RadioManager* _rm;
        Mode _mode;
    };

}
}
