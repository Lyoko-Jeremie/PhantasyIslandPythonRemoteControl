defmodule PhantasyIslandRemoteControl.ImageProcess do
  @moduledoc """
  这个文件在 PhantasyIslandRemoteControl 库中负责解析从仿真平台发回的无人机相机图像
  """

  def read_b64_img(nil), do: nil

  def read_b64_img(uri) do
    # "data:image/png;base64,..."
    case String.split(uri, ",") do
      [_, b64_data] ->
        Base.decode64!(b64_data)
        # 在 Elixir 中，通常返回二进制数据。如果需要进一步处理，可能需要 OpenCV 的 NIFs (如 Evision)
      _ ->
        nil
    end
  end
end
