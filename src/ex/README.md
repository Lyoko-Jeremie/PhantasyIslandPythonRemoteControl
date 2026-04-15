# PhantasyIslandRemoteControl Elixir 移植说明

这是一个将 Python 版本的 `PhantasyIslandPythonRemoteControl` 库初步移植到 Elixir 的实现。

## 项目结构

所有 Elixir 代码都位于 `src/elixir/lib/phantasy_island_remote_control` 目录下。

- `config.ex`: 远程地址配置。
- `http_layer.ex`: 基于 HTTP 的核心通信协议。
- `airplane_core.ex`: 无人机状态和基本数据结构。
- `airplane_manager.ex`: 管理所有无人机的单例/管理器。
- `control_command.ex`: 无人机控制指令封装。
- `image_process.ex`: 图像 Base64 解码。
- `image_receiver_mook.ex`: 模拟图像接收器（基于 GenServer）。
- `ph0apy.ex` & `uav.ex`: 适配器封装。
- `radio/`: 无线电仿真相关 API。
    - `type_def.ex`: 数据结构定义。
    - `api_module.ex`: API 模块基类宏。
    - `radio_manager.ex`: 无线电管理器（基于 GenServer）。

## 注意事项

1. **依赖**: 此移植假设了一些常见的 Elixir 库，如 `HTTPoison` 或 `Mint`（用于 HTTP），`Jason`（用于 JSON 解析），以及 `SocketIO` 客户端（虽然目前是模拟实现）。
2. **异步模型**: Elixir 版利用 `GenServer` 和 `Task` 来处理 Python 中线程和异步 (asyncio) 的逻辑，这更符合 Elixir 的并发哲学。
3. **API 设计**: 在 Elixir 中，API 调用通常需要传递管理器进程的 PID。

## 使用示例

```elixir
# 启动管理器
{:ok, rm} = PhantasyIslandRemoteControl.Radio.RadioManager.start_link()

# 设置模式
api = PhantasyIslandRemoteControl.Radio.ApiRadio.new(rm)
      |> PhantasyIslandRemoteControl.Radio.ApiRadio.set_mode(:sync)

# 调用 API
res = PhantasyIslandRemoteControl.Radio.ApiRadio.is_scene_init(api)
IO.inspect(res)
```
