defmodule PhantasyIslandRemoteControl.AirplaneCore do
  @moduledoc """
  每个飞机的基本信息和飞行状态
  """

  defmodule AirplaneFlyStatus do
    defstruct [:landing, :is_stop, :x, :y, :h, :rx, :ry, :rz]
  end

  defstruct [:key_name, :type_name, :update_timestamp, :status, :camera_front, :camera_down, :image_receiver]

  alias PhantasyIslandRemoteControl.HttpLayer
  alias PhantasyIslandRemoteControl.ImageProcess

  def new(fields) do
    struct(__MODULE__, fields)
    # 在 Elixir 中，ImageReceiver 可能是个进程或者简单的结构
  end

  def make_airplane_fly_status(fly_status) do
    %AirplaneFlyStatus{
      landing: fly_status["landing"],
      is_stop: fly_status["isStop"],
      x: fly_status["x"],
      y: fly_status["y"],
      h: fly_status["h"],
      rx: fly_status["rX"],
      ry: fly_status["rY"],
      rz: fly_status["rZ"]
    }
  end

  def get_camera_front_img(airplane) do
    img_data = HttpLayer.get_airplane_camera_image(airplane.key_name, "front")
    ImageProcess.read_b64_img(img_data)
  end

  def get_camera_down_img(airplane) do
    img_data = HttpLayer.get_airplane_camera_image(airplane.key_name, "down")
    ImageProcess.read_b64_img(img_data)
  end
end
