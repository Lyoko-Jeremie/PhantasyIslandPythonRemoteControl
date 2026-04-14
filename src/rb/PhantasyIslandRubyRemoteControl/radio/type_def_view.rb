# Ruby 等价类型定义，对应 TypeScript TypeBox 定义的视图材质指令类型。

class ViewMaterialChangeCommand
  attr_accessor :materialType, :color, :opacity, :transparent, :visible, :wireframe, :side,
                :depthTest, :depthWrite, :alphaTest, :blending, :vertexColors, :fog,
                :emissive, :emissiveIntensity, :metalness, :roughness, :envMapIntensity,
                :flatShading, :shininess, :specular, :clearcoat, :clearcoatRoughness,
                :transmission, :ior, :thickness, :sheen, :sheenRoughness, :sheenColor,
                :attenuationColor, :attenuationDistance, :iridescence, :iridescenceIOR,
                :iridescenceThicknessRange, :specularIntensity, :specularColor,
                :reflectivity, :dispersion, :anisotropy, :anisotropyRotation,
                :mapUrl, :normalMapUrl, :roughnessMapUrl, :metalnessMapUrl, :emissiveMapUrl,
                :aoMapUrl, :alphaMapUrl, :bumpMapUrl, :displacementMapUrl,
                :normalScale, :bumpScale, :displacementScale, :displacementBias,
                :aoMapIntensity, :mapRepeat, :mapOffset, :mapRotation

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

class ViewMaterialChangeCommandSimple
  attr_accessor :color, :opacity, :transparent, :visible, :wireframe, :side, :fog,
                :emissive, :emissiveIntensity

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
