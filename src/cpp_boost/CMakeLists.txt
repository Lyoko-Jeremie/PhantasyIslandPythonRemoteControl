cmake_minimum_required(VERSION 3.10)
project(PhantasyIslandRemoteControlCpp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 查找 Boost 库
find_package(Boost REQUIRED COMPONENTS json)

# 包含路径
include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${Boost_INCLUDE_DIRS}
)

# 假设 socket.io-client-cpp 已经安装或在路径中
# include_directories(/path/to/socket.io-client-cpp/include)

# 源文件列表
set(SOURCES
    http_layer.cpp
    airplane_core.cpp
    radio/radio_manager.cpp
)

# 头文件列表 (供参考)
set(HEADERS
    config.h
    http_layer.h
    airplane_core.h
    control_command.h
    airplane_manager.h
    uav.h
    radio/wait_token.h
    radio/api_module.h
    radio/type_def.h
    radio/apis.h
    radio/radio_manager.h
)

# 创建库
add_library(PhantasyIslandRemoteControl STATIC ${SOURCES} ${HEADERS})

# 链接库
target_link_libraries(PhantasyIslandRemoteControl
    PUBLIC
    Boost::json
    # sioclient (根据实际安装情况添加)
)

# 如果是 Windows，可能需要链接 ws2_32 等
if(WIN32)
    target_link_libraries(PhantasyIslandRemoteControl PUBLIC ws2_32 mswsock)
endif()
