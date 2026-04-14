#pragma once
#include <string>
#include <vector>
#include <functional>
#include <memory>
#include <thread>
#include <mutex>
#include <atomic>
#include <boost/json.hpp>

namespace PhantasyIsland {

    class AirplaneCore;

    struct ImageInfo {
        std::vector<uint8_t> img;
        int id;
        int total_count;
        int progress_count = 0;
        bool ok = false;
    };

    class ImageReceiver {
    public:
        ImageReceiver(AirplaneCore* airplane);
        ~ImageReceiver();

        void send_cap_image(
            std::function<void(const std::vector<uint8_t>&)> user_receive_callback = nullptr,
            std::function<void(int, int)> user_progress_callback = nullptr
        );

        std::vector<uint8_t> get_latest_image();
        int get_transfer_progress();
        bool is_transfer_in_progress();

    private:
        AirplaneCore* airplane;
        std::shared_ptr<ImageInfo> image_instance;
        int _cmd_id_counter = 1;
        int now_loading_id = 0;
        std::mutex _lock;
        
        std::function<void(const std::vector<uint8_t>&)> user_receive_callback;
        std::function<void(int, int)> user_progress_callback;

        int mook_time = 3;
    };

    struct AirplaneFlyStatus {
        bool landing;
        bool isStop;
        double x, y, h;
        double rX, rY, rZ;
    };

    class AirplaneCore {
    public:
        std::string keyName;
        std::string typeName;
        long long updateTimestamp;
        AirplaneFlyStatus status;
        std::string cameraFront;
        std::string cameraDown;

        std::unique_ptr<ImageReceiver> image_receiver;

        AirplaneCore(const std::string& key, const std::string& type, long long ts, AirplaneFlyStatus s, const std::string& cf, const std::string& cd);
        virtual ~AirplaneCore();

        void cap_image(
            std::function<void(const std::vector<uint8_t>&)> user_receive_callback = nullptr,
            std::function<void(int, int)> user_progress_callback = nullptr
        );

        int get_image_transfer_progress();
        bool is_image_transfer_in_progress();
        std::vector<uint8_t> get_latest_image();

        std::vector<uint8_t> get_camera_front_img();
        std::vector<uint8_t> get_camera_down_img();
    };

    AirplaneFlyStatus make_AirplaneFlyStatus(const boost::json::object& obj);
}
