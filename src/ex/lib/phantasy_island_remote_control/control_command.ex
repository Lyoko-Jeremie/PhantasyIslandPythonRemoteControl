defmodule PhantasyIslandRemoteControl.AirplaneController do
  @moduledoc """
  无人机控制，包含控制单个无人机的所有指令
  """

  alias PhantasyIslandRemoteControl.HttpLayer

  # 在 Elixir 中，由于是函数式语言，我们将 controller 作为一个状态传给函数
  # 或者将 key_name 作为第一个参数

  defp next_count(count), do: count + 2

  defp prepare_command(key_name, count, command) do
    "#{key_name} #{next_count(count)} #{command}"
  end

  defp send_cmd(key_name, count, command, opts) do
    full_cmd = prepare_command(key_name, count, command)
    case Keyword.get(opts, :fast_mode, false) do
      true -> HttpLayer.send_cmd_volatile(full_cmd)
      false -> HttpLayer.send_cmd(full_cmd)
    end
  end

  def takeoff(key_name, count, high, opts \\ []), do: send_cmd(key_name, count, "takeoff #{high}", opts)
  def land(key_name, count, opts \\ []), do: send_cmd(key_name, count, "land", opts)
  def emergency(key_name, count, opts \\ []), do: send_cmd(key_name, count, "emergency", opts)
  def up(key_name, count, distance, opts \\ []), do: send_cmd(key_name, count, "up #{distance}", opts)
  def down(key_name, count, distance, opts \\ []), do: send_cmd(key_name, count, "down #{distance}", opts)
  def forward(key_name, count, distance, opts \\ []), do: send_cmd(key_name, count, "forward #{distance}", opts)
  def back(key_name, count, distance, opts \\ []), do: send_cmd(key_name, count, "back #{distance}", opts)
  def left(key_name, count, distance, opts \\ []), do: send_cmd(key_name, count, "left #{distance}", opts)
  def right(key_name, count, distance, opts \\ []), do: send_cmd(key_name, count, "right #{distance}", opts)

  def goto(key_name, count, x, y, h, opts \\ []), do: send_cmd(key_name, count, "goto #{x} #{y} #{h}", opts)

  def flip(key_name, count, direction, opts \\ []), do: send_cmd(key_name, count, "flip #{direction} 1", opts)

  def rotate(key_name, count, degree, opts \\ []), do: send_cmd(key_name, count, "rotate #{degree}", opts)
  def cw(key_name, count, degree, opts \\ []), do: send_cmd(key_name, count, "cw #{degree}", opts)
  def ccw(key_name, count, degree, opts \\ []), do: send_cmd(key_name, count, "ccw #{degree}", opts)

  def high(key_name, count, high, opts \\ []), do: send_cmd(key_name, count, "high #{high}", opts)
  def speed(key_name, count, speed, opts \\ []), do: send_cmd(key_name, count, "setSpeed #{speed}", opts)

  def led(key_name, count, r, g, b, opts \\ []), do: send_cmd(key_name, count, "light #{r} #{g} #{b}", opts)
  def bln(key_name, count, r, g, b, opts \\ []), do: send_cmd(key_name, count, "bln #{r} #{g} #{b}", opts)
  def rainbow(key_name, count, r, g, b, opts \\ []), do: send_cmd(key_name, count, "rainbow #{r} #{g} #{b}", opts)

  def airplane_mode(key_name, count, mode, opts \\ []), do: send_cmd(key_name, count, "airplane_mode #{mode}", opts)
  def hover(key_name, count, opts \\ []), do: send_cmd(key_name, count, "hover", opts)
end
