defmodule PhantasyIslandRemoteControl.Radio.TypeDefView do
  @moduledoc """
  Python 等价类型定义，对应 TypeScript TypeBox 定义的视图材质指令类型。
  """

  defmodule ViewMaterialChangeCommand do
    defstruct [
      :materialType, :color, :opacity, :transparent, :visible, :wireframe, :side,
      :depthTest, :depthWrite, :alphaTest, :blending, :vertexColors, :fog,
      :emissive, :emissiveIntensity, :metalness, :roughness, :envMapIntensity,
      :flatShading, :shininess, :specular, :clearcoat, :clearcoatRoughness,
      :transmission, :ior, :thickness, :sheen, :sheenRoughness, :sheenColor,
      :attenuationColor, :attenuationDistance, :iridescence, :iridescenceIOR,
      :iridescenceThicknessRange, :specularIntensity, :specularColor,
      :reflectivity, :dispersion, :anisotropy, :anisotropyRotation, :mapUrl,
      :normalMapUrl, :roughnessMapUrl, :metalnessMapUrl, :emissiveMapUrl,
      :aoMapUrl, :alphaMapUrl, :bumpMapUrl, :displacementMapUrl, :normalScale,
      :bumpScale, :displacementScale, :displacementBias, :aoMapIntensity,
      :mapRepeat, :mapOffset, :mapRotation
    ]

    def to_map(struct) do
      struct
      |> Map.from_struct()
      |> Enum.reject(fn {_, v} -> is_nil(v) end)
      |> Enum.map(fn {k, v} ->
        case v do
          {a, b} -> {to_string(k), [a, b]}
          _ -> {to_string(k), v}
        end
      end)
      |> Map.new()
    end
  end

  defmodule ViewMaterialChangeCommandSimple do
    defstruct [:color, :opacity, :transparent, :visible, :wireframe, :side, :fog, :emissive, :emissiveIntensity]

    def to_map(struct) do
      struct
      |> Map.from_struct()
      |> Enum.reject(fn {_, v} -> is_nil(v) end)
      |> Enum.map(fn {k, v} -> {to_string(k), v} end)
      |> Map.new()
    end
  end

  def view_material_change_command_from_map(data) do
    tuple_fields = [:iridescenceThicknessRange, :normalScale, :mapRepeat, :mapOffset]
    
    fields = Enum.map(data, fn {k, v} ->
      key = String.to_atom(k)
      if key in tuple_fields and is_list(v) do
        {key, List.to_tuple(v)}
      else
        {key, v}
      end
    end)
    
    struct(ViewMaterialChangeCommand, fields)
  end
end
