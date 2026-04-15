defmodule PhantasyIslandRemoteControl.Ph0apy do
  @moduledoc """
  此类是到FH0A库的适配器，是对AirplaneManager的wrapper
  """

  alias PhantasyIslandRemoteControl.AirplaneManager
  alias PhantasyIslandRemoteControl.AirplaneController

  # 在 Elixir 中，我们不推荐使用全局可变状态的类。
  # 这里提供一个函数式接口，假设用户持有一个状态。

  def init do
    # 模拟 Python 的 __init__
    airplanes_table = AirplaneManager.flush(%{})
    AirplaneManager.start()
    airplanes_table = AirplaneManager.flush(airplanes_table)
    airplanes_table
  end

  def sleep(time), do: AirplaneManager.sleep(time)

  def p(airplanes_table, port), do: AirplaneManager.get_airplane(airplanes_table, port)

  def land(airplanes_table, port) do
    airplane = p(airplanes_table, port)
    AirplaneController.land(airplane.key_name, 0) # 假设 count 从 0 开始，或者由外部管理
  end

  def takeoff(airplanes_table, port, high) do
    airplane = p(airplanes_table, port)
    AirplaneController.takeoff(airplane.key_name, 0, high)
  end

  def up(airplanes_table, port, distance) do
    airplane = p(airplanes_table, port)
    AirplaneController.up(airplane.key_name, 0, distance)
  end

  def down(airplanes_table, port, distance) do
    airplane = p(airplanes_table, port)
    AirplaneController.down(airplane.key_name, 0, distance)
  end

  def forward(airplanes_table, port, distance) do
    airplane = p(airplanes_table, port)
    AirplaneController.forward(airplane.key_name, 0, distance)
  end

  def back(airplanes_table, port, distance) do
    airplane = p(airplanes_table, port)
    AirplaneController.back(airplane.key_name, 0, distance)
  end

  def left(airplanes_table, port, distance) do
    airplane = p(airplanes_table, port)
    AirplaneController.left(airplane.key_name, 0, distance)
  end

  def right(airplanes_table, port, distance) do
    airplane = p(airplanes_table, port)
    AirplaneController.right(airplane.key_name, 0, distance)
  end

  def goto(airplanes_table, port, x, y, h) do
    airplane = p(airplanes_table, port)
    AirplaneController.goto(airplane.key_name, 0, x, y, h)
  end

  def flip(airplanes_table, port, direction) do
    airplane = p(airplanes_table, port)
    AirplaneController.flip(airplane.key_name, 0, direction)
  end

  def rotate(airplanes_table, port, degree) do
    airplane = p(airplanes_table, port)
    AirplaneController.rotate(airplane.key_name, 0, degree)
  end

  def cw(airplanes_table, port, degree) do
    airplane = p(airplanes_table, port)
    AirplaneController.cw(airplane.key_name, 0, degree)
  end

  def ccw(airplanes_table, port, degree) do
    airplane = p(airplanes_table, port)
    AirplaneController.ccw(airplane.key_name, 0, degree)
  end

  def speed(airplanes_table, port, speed) do
    airplane = p(airplanes_table, port)
    AirplaneController.speed(airplane.key_name, 0, speed)
  end

  def high(airplanes_table, port, high) do
    airplane = p(airplanes_table, port)
    AirplaneController.high(airplane.key_name, 0, high)
  end

  def led(airplanes_table, port, r, g, b) do
    airplane = p(airplanes_table, port)
    AirplaneController.led(airplane.key_name, 0, r, g, b)
  end

  def bln(airplanes_table, port, r, g, b) do
    airplane = p(airplanes_table, port)
    AirplaneController.bln(airplane.key_name, 0, r, g, b)
  end

  def rainbow(airplanes_table, port, r, g, b) do
    airplane = p(airplanes_table, port)
    AirplaneController.rainbow(airplane.key_name, 0, r, g, b)
  end

  def mode(airplanes_table, port, mode) do
    airplane = p(airplanes_table, port)
    AirplaneController.airplane_mode(airplane.key_name, 0, mode)
  end

  def stop(airplanes_table, port) do
    airplane = p(airplanes_table, port)
    AirplaneController.hover(airplane.key_name, 0)
  end

  def hover(airplanes_table, port) do
    airplane = p(airplanes_table, port)
    AirplaneController.hover(airplane.key_name, 0)
  end
end
