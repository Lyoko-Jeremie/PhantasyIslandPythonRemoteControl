#include "http_layer.h"
#include "config.h"
#include <boost/beast/core.hpp>
#include <boost/beast/http.hpp>
#include <boost/beast/version.hpp>
#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <iostream>

namespace beast = boost::beast;
namespace http = beast::http;
namespace net = boost::asio;
using tcp = net::ip::tcp;

namespace PhantasyIsland {
namespace HttpLayer {

HttpResponse internal_request(const std::string& path) {
    HttpResponse response;
    try {
        size_t colon_pos = remote_location.find(':');
        std::string host = remote_location.substr(0, colon_pos);
        std::string port = remote_location.substr(colon_pos + 1);

        net::io_context ioc;
        tcp::resolver resolver(ioc);
        beast::tcp_stream stream(ioc);

        auto const results = resolver.resolve(host, port);
        stream.connect(results);

        http::request<http::string_body> req{http::verb::get, path, 11};
        req.set(http::field::host, host);
        req.set(http::field::user_agent, BOOST_BEAST_VERSION_STRING);

        http::write(stream, req);

        beast::flat_buffer buffer;
        http::response<http::string_body> res;
        http::read(stream, buffer, res);

        response.data = boost::json::parse(res.body());
        response.ok = true;

        beast::error_code ec;
        stream.socket().shutdown(tcp::socket::shutdown_both, ec);
    } catch (std::exception const& e) {
        response.ok = false;
        response.r = std::string("Error: ") + e.what();
    }
    return response;
}

HttpResponse send_cmd(const std::string& s) {
    return internal_request("/ECU_HTTP/sendStringCmd?c=" + s);
}

HttpResponse send_cmd_volatile(const std::string& s) {
    return internal_request("/ECU_HTTP/sendStringCmd?cc=" + s);
}

HttpResponse ping() { return send_cmd("ping"); }
HttpResponse ping_volatile() { return send_cmd_volatile("ping"); }
HttpResponse start() { return send_cmd("start"); }
HttpResponse start_volatile() { return send_cmd_volatile("start"); }

JsonValue get_all_airplane_status() {
    auto res = internal_request("/ECU_HTTP/requestPullAllAirplaneState");
    return res.data;
}

std::optional<std::string> get_airplane_camera_image(const std::string& port, const std::string& camera) {
    auto res = internal_request("/ECU_HTTP/requestPullImage?flyPort=" + port + "&imageType=" + camera);
    if (!res.ok || !res.data.is_object()) return std::nullopt;
    auto& obj = res.data.as_object();
    if (obj.contains("ok") && obj.at("ok").is_bool() && obj.at("ok").as_bool()) {
        if (obj.contains("imgDataString") && obj.at("imgDataString").is_string()) {
            return std::string(obj.at("imgDataString").as_string());
        }
    }
    return std::nullopt;
}

std::map<std::string, JsonObject> process_airplane(const JsonValue& j) {
    std::map<std::string, JsonObject> airplaneStatus;
    if (!j.is_object()) return airplaneStatus;
    auto& root = j.as_object();
    if (root.contains("ok") && root.at("ok").as_bool()) {
        auto& airplanes = root.at("airplanes").as_array();
        for (auto& air_val : airplanes) {
            auto& air = air_val.as_object();
            JsonObject status;
            status["keyName"] = air.at("keyName");
            status["typeName"] = air.at("typeName");
            status["updateTimestamp"] = air.at("updateTimestamp");
            status["status"] = air.at("status");
            
            auto& cameraFront = air.at("cameraFront").as_object();
            if (cameraFront.contains("imgDataString"))
                status["cameraFront"] = cameraFront.at("imgDataString");
            else
                status["cameraFront"] = nullptr;

            auto& cameraDown = air.at("cameraDown").as_object();
            if (cameraDown.contains("imgDataString"))
                status["cameraDown"] = cameraDown.at("imgDataString");
            else
                status["cameraDown"] = nullptr;

            airplaneStatus[std::string(air.at("keyName").as_string())] = status;
        }
    }
    return airplaneStatus;
}

} // namespace HttpLayer
} // namespace PhantasyIsland
