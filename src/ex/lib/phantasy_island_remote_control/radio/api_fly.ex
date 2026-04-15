defmodule PhantasyIslandRemoteControl.Radio.ApiFly do
  @moduledoc """
  飞行器相关 API 模块。
  """
  use PhantasyIslandRemoteControl.Radio.ApiModule

  def list_fly_object(api), do: send_cmd(api, "fly.listFlyObject")

  def get_fly_object_info(api, key_name) do
    send_cmd(api, "fly.getFlyObjectInfo", %{"keyName" => key_name})
  end

  def get_fly_object_camera_image_down(api, key_name) do
    send_cmd(api, "fly.getFlyObjectCameraImageDown", %{"keyName" => key_name})
  end

  def get_fly_object_camera_image_front(api, key_name) do
    send_cmd(api, "fly.getFlyObjectCameraImageFront", %{"keyName" => key_name})
  end
end
