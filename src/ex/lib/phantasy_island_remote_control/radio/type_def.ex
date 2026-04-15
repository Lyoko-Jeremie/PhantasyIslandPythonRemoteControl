defmodule PhantasyIslandRemoteControl.Radio.TypeDef do
  @moduledoc """
  Python 等价类型定义，对应 TypeScript TypeBox 定义的类型。
  """

  # XYZ — 三维坐标，单位米，格式 {x, y, z}
  # 在 Elixir 中可以使用元组或 Map。这里采用 Map 结构以对应 Python 的 dataclass 转换。

  defmodule RadioCheckOptions do
    defstruct [
      :frequencyMHz, :txPowerDbm, :rxSensitivityDbm, :fresnelZoneRatio,
      :skipFresnelZoneCheck, :enableMultipath, :maxReflectionPaths,
      :maxReflectionPathLengthRatio, :defaultTxAntennaGain_dBi,
      :defaultRxAntennaGain_dBi, :enableAntennaPattern, :enableMutualCoupling,
      :couplingNegligibleThresholdWavelengths, :enableSINR, :receiverBandwidthHz,
      :minSINR_dB, :enableFrequencyIsolation, :enableNearFieldCorrection,
      :enableNodeBodyOcclusion
    ]

    def to_map(struct) do
      struct
      |> Map.from_struct()
      |> Enum.reject(fn {_, v} -> is_nil(v) end)
      |> Map.new()
    end
  end

  defmodule CheckReachabilityRequest do
    defstruct [:aTx, :bRx, :options]

    def to_map(struct) do
      %{
        "aTx" => Tuple.to_list(struct.aTx),
        "bRx" => Tuple.to_list(struct.bRx)
      }
      |> then(fn map ->
        if struct.options, do: Map.put(map, "options", RadioCheckOptions.to_map(struct.options)), else: map
      end)
    end
  end

  defmodule UpdateObjectPosRequest do
    defstruct [:objectId, :position]

    def to_map(struct) do
      %{
        "objectId" => struct.objectId,
        "position" => Tuple.to_list(struct.position)
      }
    end
  end

  defmodule UpdateMeshRadioMaterialRequest do
    defstruct [:meshId, :materialId, :thickness_m]

    def to_map(struct) do
      struct
      |> Map.from_struct()
      |> Enum.reject(fn {_, v} -> is_nil(v) end)
      |> Map.new()
    end
  end

  defmodule RadioMaterialProperties do
    defstruct [:id, :displayName, :penetrationLoss_dBPerMeter, :reflectionCoefficient, :defaultThickness_m]

    def to_map(struct), do: Map.from_struct(struct)
  end

  defmodule JoyStickInput do
    defstruct [vx: 0.0, vy: 0.0, vz: 0.0, yawRate: 0.0]

    def to_map(struct), do: Map.from_struct(struct)
  end

  # 辅助方法：从 Map 构造
  def xyz_from_list([x, y, z]), do: {Float.parse("#{x}") |> elem(0), Float.parse("#{y}") |> elem(0), Float.parse("#{z}") |> elem(0)}

  def radio_check_options_from_map(data) do
    struct(RadioCheckOptions, Enum.map(data, fn {k, v} -> {String.to_atom(to_string(k)), v} end))
  end

  def check_reachability_request_from_map(data) do
    %CheckReachabilityRequest{
      aTx: xyz_from_list(data["aTx"]),
      bRx: xyz_from_list(data["bRx"]),
      options: if(data["options"], do: radio_check_options_from_map(data["options"]), else: nil)
    }
  end
end
