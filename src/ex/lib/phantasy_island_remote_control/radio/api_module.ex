defmodule PhantasyIslandRemoteControl.Radio.ApiModule do
  @moduledoc """
  API 模块基类。
  """

  # 在 Elixir 中，由于没有类继承，我们使用宏（__using__）或简单的模块组合。
  # 这里的 ApiModule 更多是作为一个协议或者通用的函数集。

  defmacro __using__(_opts) do
    quote do
      defstruct [:rm, mode: :sync]

      def new(rm) do
        %__MODULE__{rm: rm}
      end

      def set_mode(api, mode) when mode in [:sync, :async, :token] do
        %{api | mode: mode}
      end

      def send_cmd(api, cmd, data \\ %{}, opts \\ []) do
        case api.mode do
          :sync ->
            apply(api.rm.__struct__, :send_and_wait_sync, [api.rm, cmd, data, opts])
          :token ->
            apply(api.rm.__struct__, :send_and_wait_token, [api.rm, cmd, data, opts])
          :async ->
            # 在 Elixir 中 async 通常返回一个 Task
            Task.async(fn ->
              apply(api.rm.__struct__, :send_and_wait_sync, [api.rm, cmd, data, opts])
            end)
        end
      end
    end
  end
end
