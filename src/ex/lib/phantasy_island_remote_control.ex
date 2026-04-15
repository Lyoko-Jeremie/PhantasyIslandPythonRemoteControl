defmodule PhantasyIslandRemoteControl do
  @moduledoc """
  PhantasyIslandRemoteControl Elixir 移植版。
  """

  # 导出主要的模块方便用户调用
  alias PhantasyIslandRemoteControl.AirplaneManager
  alias PhantasyIslandRemoteControl.Radio.RadioManager

  defdelegate get_airplane_manager, to: AirplaneManager, as: :start
  defdelegate get_radio_manager, to: RadioManager, as: :start_link
end
