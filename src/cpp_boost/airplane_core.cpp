#include "airplane_core.h"
#include "http_layer.h"
#include <iostream>
#include <chrono>

namespace PhantasyIsland {

// 辅助函数，处理 base64（占位，实际实现需要引入 base64 库）
std::vector<uint8_t> read_b64_img(const std::optional<std::string>& b64) {
    if (!b64) return {};
    // TODO: 实现 base64 解码为 bytes
    return std::vector<uint8_t>(b64->begin(), b64->end()); 
}

// ImageReceiver 实现
ImageReceiver::ImageReceiver(AirplaneCore* airplane) : airplane(airplane) {}
ImageReceiver::~ImageReceiver() {}

void ImageReceiver::send_cap_image(
    std::function<void(const std::vector<uint8_t>&)> receive_cb,
    std::function<void(int, int)> progress_cb
) {
    this->user_receive_callback = receive_cb;
    this->user_progress_callback = progress_cb;

    std::thread([this]() {
        std::shared_ptr<ImageInfo> inst;
        {
            std::lock_guard<std::mutex> lock(this->_lock);
            this->_cmd_id_counter++;
            this->now_loading_id = this->_cmd_id_counter;
            this->image_instance = std::make_shared<ImageInfo>();
            this->image_instance->img = this->airplane->get_camera_down_img();
            this->image_instance->id = this->_cmd_id_counter;
            this->image_instance->total_count = this->mook_time * 100;
            inst = this->image_instance;
        }

        while (inst->progress_count < inst->total_count) {
            std::this_thread::sleep_for(std::chrono::milliseconds(10));
            {
                std::lock_guard<std::mutex> lock(this->_lock);
                if (inst->id != this->now_loading_id) break;
                inst->progress_count++;
            }
            if (this->user_progress_callback) {
                this->user_progress_callback(inst->progress_count, inst->total_count);
            }
        }

        {
            std::lock_guard<std::mutex> lock(this->_lock);
            if (inst->id == this->now_loading_id) {
                inst->ok = true;
            }
        }

        if (inst->id == this->now_loading_id && inst->progress_count >= inst->total_count && this->user_receive_callback) {
            this->user_receive_callback(inst->img);
        }
    }).detach();
}

std::vector<uint8_t> ImageReceiver::get_latest_image() {
    std::lock_guard<std::mutex> lock(_lock);
    if (image_instance && image_instance->ok) return image_instance->img;
    return {};
}

int ImageReceiver::get_transfer_progress() {
    std::lock_guard<std::mutex> lock(_lock);
    return image_instance ? image_instance->progress_count : 0;
}

bool ImageReceiver::is_transfer_in_progress() {
    std::lock_guard<std::mutex> lock(_lock);
    return image_instance ? !image_instance->ok : false;
}

// AirplaneCore 实现
AirplaneCore::AirplaneCore(const std::string& key, const std::string& type, long long ts, AirplaneFlyStatus s, const std::string& cf, const std::string& cd)
    : keyName(key), typeName(type), updateTimestamp(ts), status(s), cameraFront(cf), cameraDown(cd) {
    image_receiver = std::make_unique<ImageReceiver>(this);
}

AirplaneCore::~AirplaneCore() {}

void AirplaneCore::cap_image(std::function<void(const std::vector<uint8_t>&)> r_cb, std::function<void(int, int)> p_cb) {
    image_receiver->send_cap_image(r_cb, p_cb);
}

int AirplaneCore::get_image_transfer_progress() { return image_receiver->get_transfer_progress(); }
bool AirplaneCore::is_image_transfer_in_progress() { return image_receiver->is_transfer_in_progress(); }
std::vector<uint8_t> AirplaneCore::get_latest_image() { return image_receiver->get_latest_image(); }

std::vector<uint8_t> AirplaneCore::get_camera_front_img() {
    return read_b64_img(HttpLayer::get_airplane_camera_image(keyName, "front"));
}

std::vector<uint8_t> AirplaneCore::get_camera_down_img() {
    return read_b64_img(HttpLayer::get_airplane_camera_image(keyName, "down"));
}

AirplaneFlyStatus make_AirplaneFlyStatus(const boost::json::object& obj) {
    AirplaneFlyStatus s;
    s.landing = obj.at("landing").as_bool();
    s.isStop = obj.at("isStop").as_bool();
    s.x = obj.at("x").as_double();
    s.y = obj.at("y").as_double();
    s.h = obj.at("h").as_double();
    s.rX = obj.at("rX").as_double();
    s.rY = obj.at("rY").as_double();
    s.rZ = obj.at("rZ").as_double();
    return s;
}

} // namespace PhantasyIsland
