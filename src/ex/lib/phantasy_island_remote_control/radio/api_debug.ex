defmodule PhantasyIslandRemoteControl.Radio.ApiDebug do
  @moduledoc """
  调试 / 连通性 相关 API 模块。
  """
  use PhantasyIslandRemoteControl.Radio.ApiModule

  def ping(api), do: send_cmd(api, "ping", %{}, wait_cmd: "pong")
end
