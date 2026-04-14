#pragma once
#include "api_module.h"
#include "type_def.h"

namespace PhantasyIsland {
namespace Radio {

    class RadioApi : public ApiModule {
    public:
        using ApiModule::ApiModule;

        auto checkReachability(const CheckReachabilityRequest& req) {
            return send_sync("radio.checkReachability", req.to_json());
        }

        auto getAllRadioMaterial() {
            auto proc = [](const boost::json::object& data) -> boost::json::value {
                boost::json::array materials;
                if (data.contains("materials")) {
                    return data.at("materials");
                }
                return materials;
            };
            return send_sync("radio.getAllRadioMaterial", {}, "radio.getAllRadioMaterial", 3.0f, proc);
        }

        auto listRadioLocalObjects() {
            return send_sync("radio.listLocalObjects");
        }

        auto updateObjectPos(const UpdateObjectPosRequest& req) {
            return send_sync("radio.updateObjectPos", req.to_json());
        }
    };

    class FlyApi : public ApiModule {
    public:
        using ApiModule::ApiModule;

        auto setJoyStickInput(const std::string& uavId, const JoyStickInput& input) {
            boost::json::object data = input.to_json();
            data["uavId"] = uavId;
            return send_sync("fly.setJoyStickInput", data);
        }
    };

    class SceneApi : public ApiModule {
    public:
        using ApiModule::ApiModule;

        auto getInitState() {
            return send_sync("scene.getInitState");
        }

        auto resetScene() {
            return send_sync("scene.resetScene");
        }
    };

    class DebugApi : public ApiModule {
    public:
        using ApiModule::ApiModule;

        auto echo(const std::string& msg) {
            return send_sync("debug.echo", {{"msg", msg}});
        }
    };

}
}
