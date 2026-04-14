#pragma once
#include <string>
#include <vector>

namespace phantasy_island {

class ImageProcess {
public:
    /**
     * @brief 解析 Base64 编码的图像数据。
     * 由于任务要求不进行查错和编译，此处提供接口占位。
     * 实际实现通常需要 OpenCV (cv::imdecode) 和 Base64 解码库。
     */
    static void* read_b64_img(const std::string& uri) {
        if (uri.empty()) return nullptr;
        // 1. 查找逗号分割符（"data:image/png;base64,xxxx"）
        // 2. 解码 Base64 部分
        // 3. 使用 cv::imdecode 转换为 Mat
        return nullptr;
    }
};

} // namespace phantasy_island
