defmodule PhantasyIslandRemoteControl.Radio.ApiRadio do
  @moduledoc """
  无线电相关 API 模块。
  """
  use PhantasyIslandRemoteControl.Radio.ApiModule

  def is_scene_init(api), do: send_cmd(api, "radio.isSceneInit")

  def is_radio_reachability_checker_init(api), do: send_cmd(api, "radio.isRadioReachabilityCheckerInit")

  def check_reachability(api, a_tx, b_rx, options \\ nil) do
    data = %{
      "aTx" => Tuple.to_list(a_tx),
      "bRx" => Tuple.to_list(b_rx),
      "options" => if(options, do: options.__struct__.to_map(options), else: nil)
    }
    send_cmd(api, "radio.checkReachability", data)
  end

  def update_object_pos(api, object_id, position) do
    send_cmd(api, "radio.updateObjectPos", %{"objectId" => object_id, "position" => Tuple.to_list(position)})
  end

  def get_object_pos(api, object_id) do
    send_cmd(api, "radio.updateObjectPos", %{"objectId" => object_id})
  end

  def update_mesh_radio_material(api, mesh_id, material_id, thickness_m) do
    send_cmd(api, "radio.updateMeshRadioMaterial", %{
      "meshId" => mesh_id,
      "materialId" => material_id,
      "thickness_m" => thickness_m
    })
  end

  def get_all_radio_material(api), do: send_cmd(api, "radio.getAllRadioMaterial")

  def local_radio_material(api), do: send_cmd(api, "radio.localRadioMaterial")

  def get_building_radio_material(api), do: send_cmd(api, "radio.getBuildingRadioMaterial")

  def add_radio_material(api, material) do
    send_cmd(api, "radio.addRadioMaterial", material.__struct__.to_map(material))
  end

  def list_radio_local_objects_ids(api), do: send_cmd(api, "radio.listRadioLocalObjects")
end
