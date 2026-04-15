defmodule PhantasyIslandRemoteControl.AirplaneManager do
  @moduledoc """
  管理并更新所有飞机状态的管理器
  """

  alias PhantasyIslandRemoteControl.HttpLayer
  alias PhantasyIslandRemoteControl.AirplaneCore

  # 在 Elixir 中，通常使用 Agent 或 GenServer 来维护单例状态
  # 这里为了初步实现，我们定义一个函数式接口

  def ping, do: HttpLayer.ping()
  def ping_volatile, do: HttpLayer.ping_volatile()
  def start, do: HttpLayer.start()
  def start_volatile, do: HttpLayer.start_volatile()

  def flush(airplanes_table) do
    case HttpLayer.get_all_airplane_status() |> HttpLayer.process_airplane() do
      nil -> airplanes_table
      airplane_status ->
        Enum.reduce(airplane_status, airplanes_table, fn {k, status}, acc ->
          fly_status = AirplaneCore.make_airplane_fly_status(status["status"])
          
          updated_airplane = %{
            key_name: status["keyName"],
            type_name: status["typeName"],
            update_timestamp: status["updateTimestamp"],
            status: fly_status,
            camera_front: status["cameraFront"],
            camera_down: status["cameraDown"]
          }

          Map.put(acc, k, updated_airplane)
        end)
    end
  end

  def get_airplane(airplanes_table, id) do
    Map.get(airplanes_table, id)
  end

  def sleep(time) do
    :timer.sleep(round(time * 1000))
  end
end
