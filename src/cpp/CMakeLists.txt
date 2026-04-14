cmake_minimum_required(VERSION 3.10)
project(PhantasyIslandRemoteControl LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 引入 FetchContent 模块
include(FetchContent)

# 声明 nlohmann_json 库的来源和版本
FetchContent_Declare(
        nlohmann_json
        GIT_REPOSITORY https://github.com/nlohmann/json.git
        GIT_TAG v3.12.0 # 建议指定一个稳定的 release 版本
)
# 获取并使其可用
FetchContent_MakeAvailable(nlohmann_json)
# 声明 libcpr 来源 (建议使用较新的 release 版本，比如 1.10.x)
FetchContent_Declare(
        cpr
        GIT_REPOSITORY https://github.com/libcpr/cpr.git
        GIT_TAG        1.14.2
)
# 关闭 libpsl，避免在 Windows 上触发 Meson 依赖
set(CPR_CURL_USE_LIBPSL OFF CACHE BOOL "Disable libpsl build for cpr/curl" FORCE)
set(CPR_USE_SYSTEM_LIB_PSL OFF CACHE BOOL "Do not use system libpsl" FORCE)
set(CPR_USE_SYSTEM_CURL OFF CACHE BOOL "Use cpr bundled curl" FORCE)
# 获取并使其可用
FetchContent_MakeAvailable(cpr)

# 查找依赖项
#find_package(nlohmann_json REQUIRED)
#find_package(cpr REQUIRED)

# sioclient 通常没有标准的 CMake 配置文件，可能需要通过外部项目或手动指定
# 假设 sioclient 在系统中已安装或通过其他方式可用
find_package(sioclient QUIET)
if(NOT sioclient_FOUND)
    message(WARNING "socket.io-client-cpp not found via find_package. You might need to add it manually or as a submodule.")
endif()

# 源文件列表
set(PROJECT_HEADERS
    airplane_core.h
    airplane_manager.h
    config.h
    control_command.h
    http_layer.h
    image_process.h
    ph0apy.h
    uav.h
    radio/api_debug.h
    radio/api_fly.h
    radio/api_module.h
    radio/api_radio.h
    radio/api_scene.h
    radio/radio_manager.h
    radio/type_def.h
    radio/type_def_view.h
    radio/wait_token.h
)

# 定义库目标
# 由于项目大多是头文件，可以定义为接口库，或者如果未来有 .cpp，定义为普通库
add_library(PhantasyIsland INTERFACE)

# 配置包含目录
target_include_directories(PhantasyIsland INTERFACE
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
    $<INSTALL_INTERFACE:include>
)

# 链接依赖
target_link_libraries(PhantasyIsland INTERFACE
    nlohmann_json::nlohmann_json
    cpr::cpr
)

# 如果找到了 sioclient，链接它
if(sioclient_FOUND)
    target_link_libraries(PhantasyIsland INTERFACE socket.io-client-cpp)
endif()

# 示例：如果您需要一个示例程序来测试
# add_executable(example main.cpp)
# target_link_libraries(example PRIVATE PhantasyIsland)
