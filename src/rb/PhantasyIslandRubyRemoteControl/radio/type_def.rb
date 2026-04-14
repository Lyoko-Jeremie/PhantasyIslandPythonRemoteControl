# Ruby 等价类型定义，对应 TypeScript TypeBox 定义的类型。

# XYZ — 三维坐标，单位米，格式 [x, y, z]
# 在 Ruby 中直接使用数组表示即可

class RadioCheckOptions
  attr_accessor :frequencyMHz, :txPowerDbm, :rxSensitivityDbm, :fresnelZoneRatio,
                :skipFresnelZoneCheck, :enableMultipath, :maxReflectionPaths,
                :maxReflectionPathLengthRatio, :defaultTxAntennaGain_dBi,
                :defaultRxAntennaGain_dBi, :enableAntennaPattern, :enableMutualCoupling,
                :couplingNegligibleThresholdWavelengths, :enableSINR, :receiverBandwidthHz,
                :minSINR_dB, :enableFrequencyIsolation, :enableNearFieldCorrection,
                :enableNodeBodyOcclusion

  def initialize(options = {})
    options.each { |k, v| send("#{k}=", v) if respond_to?("#{k}=") }
  end

  def to_h
    hash = {}
    instance_variables.each do |var|
      val = instance_variable_get(var)
      hash[var.to_s.delete('@')] = val unless val.nil?
    end
    hash
  end

  def self.from_h(data)
    new(data)
  end
end

class CheckReachabilityRequest
  attr_accessor :aTx, :bRx, :options

  def initialize(aTx:, bRx:, options: nil)
    @aTx = aTx
    @bRx = bRx
    @options = options
  end

  def to_h
    h = {
      'aTx' => @aTx,
      'bRx' => @bRx
    }
    h['options'] = @options.to_h if @options
    h
  end

  def self.from_h(data)
    opts = data['options'] ? RadioCheckOptions.from_h(data['options']) : nil
    new(
      aTx: data['aTx'],
      bRx: data['bRx'],
      options: opts
    )
  end
end

class UpdateObjectPosRequest
  attr_accessor :objectId, :position

  def initialize(objectId:, position:)
    @objectId = objectId
    @position = position
  end

  def to_h
    {
      'objectId' => @objectId,
      'position' => @position
    }
  end

  def self.from_h(data)
    new(
      objectId: data['objectId'],
      position: data['position']
    )
  end
end

class UpdateMeshRadioMaterialRequest
  attr_accessor :meshId, :materialId, :thickness_m

  def initialize(meshId:, materialId: nil, thickness_m: nil)
    @meshId = meshId
    @materialId = materialId
    @thickness_m = thickness_m
  end

  def to_h
    h = { 'meshId' => @meshId }
    h['materialId'] = @materialId unless @materialId.nil?
    h['thickness_m'] = @thickness_m unless @thickness_m.nil?
    h
  end

  def self.from_h(data)
    new(
      meshId: data['meshId'],
      materialId: data['materialId'],
      thickness_m: data['thickness_m']
    )
  end
end

class RadioMaterialProperties
  attr_accessor :id, :displayName, :penetrationLoss_dBPerMeter, :reflectionCoefficient, :defaultThickness_m

  def initialize(id:, displayName:, penetrationLoss_dBPerMeter:, reflectionCoefficient:, defaultThickness_m:)
    @id = id
    @displayName = displayName
    @penetrationLoss_dBPerMeter = penetrationLoss_dBPerMeter
    @reflectionCoefficient = reflectionCoefficient
    @defaultThickness_m = defaultThickness_m
  end

  def to_h
    {
      'id' => @id,
      'displayName' => @displayName,
      'penetrationLoss_dBPerMeter' => @penetrationLoss_dBPerMeter,
      'reflectionCoefficient' => @reflectionCoefficient,
      'defaultThickness_m' => @defaultThickness_m
    }
  end

  def self.from_h(data)
    new(
      id: data['id'],
      displayName: data['displayName'],
      penetrationLoss_dBPerMeter: data['penetrationLoss_dBPerMeter'],
      reflectionCoefficient: data['reflectionCoefficient'],
      defaultThickness_m: data['defaultThickness_m']
    )
  end
end

class JoyStickInput
  attr_accessor :vx, :vy, :vz, :yawRate

  def initialize(vx: 0.0, vy: 0.0, vz: 0.0, yawRate: 0.0)
    @vx = vx
    @vy = vy
    @vz = vz
    @yawRate = yawRate
  end

  def to_h
    {
      'vx' => @vx,
      'vy' => @vy,
      'vz' => @vz,
      'yawRate' => @yawRate
    }
  end

  def self.from_h(data)
    new(
      vx: data.fetch('vx', 0.0),
      vy: data.fetch('vy', 0.0),
      vz: data.fetch('vz', 0.0),
      yawRate: data.fetch('yawRate', 0.0)
    )
  end
end
