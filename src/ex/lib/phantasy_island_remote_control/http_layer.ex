defmodule PhantasyIslandRemoteControl.HttpLayer do
  @moduledoc """
  这个文件是 PhantasyIslandPythonRemoteControl 库与仿真平台的核心通信协议部分
  """

  alias PhantasyIslandRemoteControl.Config

  def ping, do: send_cmd("ping")

  def ping_volatile, do: send_cmd_volatile("ping")

  def start, do: send_cmd("start")

  def start_volatile, do: send_cmd_volatile("start")

  def send_cmd(s) do
    url = "http://#{Config.remote_location()}/ECU_HTTP/sendStringCmd?c=#{s}"
    try do
      response = HTTPoison.get!(url, [], [timeout: 10000, recv_timeout: 10000])
      Jason.decode!(response.body)
    rescue
      e ->
        IO.puts("send_cmd #{s} Error: #{inspect(e)}")
        %{"ok" => false, "r" => "Error"}
    end
  end

  def send_cmd_volatile(s) do
    url = "http://#{Config.remote_location()}/ECU_HTTP/sendStringCmd?cc=#{s}"
    try do
      response = HTTPoison.get!(url, [], [timeout: 10000, recv_timeout: 10000])
      Jason.decode!(response.body)
    rescue
      e ->
        IO.puts("send_cmd_volatile #{s} Error: #{inspect(e)}")
        %{"ok" => false, "r" => "Error"}
    end
  end

  def get_all_airplane_status do
    url = "http://#{Config.remote_location()}/ECU_HTTP/requestPullAllAirplaneState"
    try do
      response = HTTPoison.get!(url, [], [timeout: 10000, recv_timeout: 10000])
      Jason.decode!(response.body)
    rescue
      e ->
        IO.puts("get_all_airplane_status Error: #{inspect(e)}")
        raise "ConnectionError Cannot Connect to PhantasyIsland"
    end
  end

  def get_airplane_camera_image(port, camera) do
    url = "http://#{Config.remote_location()}/ECU_HTTP/requestPullImage?flyPort=#{port}&imageType=#{camera}"
    try do
      response = HTTPoison.get!(url, [], [timeout: 10000, recv_timeout: 10000])
      j = Jason.decode!(response.body)
      if j["ok"] == true do
        j["imgDataString"]
      else
        nil
      end
    rescue
      _ -> nil
    end
  end

  def process_airplane(j) do
    if j["ok"] == true do
      airplanes = j["airplanes"]
      Enum.reduce(airplanes, %{}, fn air, acc ->
        status = %{
          "keyName" => air["keyName"],
          "typeName" => air["typeName"],
          "updateTimestamp" => air["updateTimestamp"],
          "status" => air["status"],
          "cameraFront" => Map.get(air["cameraFront"] || %{}, "imgDataString"),
          "cameraDown" => Map.get(air["cameraDown"] || %{}, "imgDataString")
        }
        Map.put(acc, status["keyName"], status)
      end)
    else
      nil
    end
  end

  # 辅助方法
end
