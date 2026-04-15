defmodule PhantasyIslandRemoteControl.Radio.ApiScene do
  @moduledoc """
  场景相关 API 模块。
  """
  use PhantasyIslandRemoteControl.Radio.ApiModule

  def list_all_mesh_object_in_scene(api), do: send_cmd(api, "scene.listAllMeshObjectInScene")

  def get_object_info_by_id(api, object_id) do
    send_cmd(api, "scene.getObjectInfoById", %{"objectId" => object_id})
  end

  def remove_object_by_id(api, object_id) do
    send_cmd(api, "scene.removeObjectById", %{"objectId" => object_id})
  end

  def move_object_by_id(api, object_id, {x, y, z}) do
    send_cmd(api, "scene.moveObjectById", %{"objectId" => object_id, "position" => [x, y, z]})
  end

  def set_object_radio_material(api, object_id, material_id, thickness_m) do
    send_cmd(api, "scene.setObjectRadioMaterial", %{
      "objectId" => object_id,
      "materialId" => material_id,
      "thickness_m" => thickness_m
    })
  end

  def update_mesh_view_material(api, mesh_id, view_material_change_command) do
    send_cmd(api, "scene.updateMeshViewMaterial", %{
      "meshId" => mesh_id,
      "viewMaterialChangeCommand" => PhantasyIslandRemoteControl.Radio.TypeDefView.ViewMaterialChangeCommand.to_map(view_material_change_command)
    })
  end

  def update_mesh_view_material_simple(api, mesh_id, view_material_change_command_simple) do
    send_cmd(api, "scene.updateMeshViewMaterialSimple", %{
      "meshId" => mesh_id,
      "viewMaterialChangeCommandSimple" => PhantasyIslandRemoteControl.Radio.TypeDefView.ViewMaterialChangeCommandSimple.to_map(view_material_change_command_simple)
    })
  end
end
