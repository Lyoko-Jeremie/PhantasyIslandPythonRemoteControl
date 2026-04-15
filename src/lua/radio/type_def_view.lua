-- View material command definitions in Lua

local type_def_view = {}

-- ---------------------------------------------------------------------------
-- ViewMaterialChangeCommand
-- ---------------------------------------------------------------------------
local ViewMaterialChangeCommand = {}
ViewMaterialChangeCommand.__index = ViewMaterialChangeCommand

function ViewMaterialChangeCommand.new(data)
    local self = setmetatable({}, ViewMaterialChangeCommand)
    data = data or {}
    
    -- Material type
    self.materialType = data.materialType
    
    -- Basic properties
    self.color = data.color
    self.opacity = data.opacity
    self.transparent = data.transparent
    self.visible = data.visible
    self.wireframe = data.wireframe
    self.side = data.side
    self.depthTest = data.depthTest
    self.depthWrite = data.depthWrite
    self.alphaTest = data.alphaTest
    self.blending = data.blending
    self.vertexColors = data.vertexColors
    self.fog = data.fog
    
    -- Emissive
    self.emissive = data.emissive
    self.emissiveIntensity = data.emissiveIntensity
    
    -- PBR
    self.metalness = data.metalness
    self.roughness = data.roughness
    self.envMapIntensity = data.envMapIntensity
    self.flatShading = data.flatShading
    
    -- Phong
    self.shininess = data.shininess
    self.specular = data.specular
    
    -- Physical
    self.clearcoat = data.clearcoat
    self.clearcoatRoughness = data.clearcoatRoughness
    self.transmission = data.transmission
    self.ior = data.ior
    self.thickness = data.thickness
    self.sheen = data.sheen
    self.sheenRoughness = data.sheenRoughness
    self.sheenColor = data.sheenColor
    self.attenuationColor = data.attenuationColor
    self.attenuationDistance = data.attenuationDistance
    self.iridescence = data.iridescence
    self.iridescenceIOR = data.iridescenceIOR
    self.iridescenceThicknessRange = data.iridescenceThicknessRange
    self.specularIntensity = data.specularIntensity
    self.specularColor = data.specularColor
    self.reflectivity = data.reflectivity
    self.dispersion = data.dispersion
    self.anisotropy = data.anisotropy
    self.anisotropyRotation = data.anisotropyRotation
    
    -- Maps
    self.mapUrl = data.mapUrl
    self.normalMapUrl = data.normalMapUrl
    self.roughnessMapUrl = data.roughnessMapUrl
    self.metalnessMapUrl = data.metalnessMapUrl
    self.emissiveMapUrl = data.emissiveMapUrl
    self.aoMapUrl = data.aoMapUrl
    self.alphaMapUrl = data.alphaMapUrl
    self.bumpMapUrl = data.bumpMapUrl
    self.displacementMapUrl = data.displacementMapUrl
    
    -- Map params
    self.normalScale = data.normalScale
    self.bumpScale = data.bumpScale
    self.displacementScale = data.displacementScale
    self.displacementBias = data.displacementBias
    self.aoMapIntensity = data.aoMapIntensity
    
    -- Transform
    self.mapRepeat = data.mapRepeat
    self.mapOffset = data.mapOffset
    self.mapRotation = data.mapRotation
    
    return self
end

function ViewMaterialChangeCommand:to_dict()
    local d = {}
    for k, v in pairs(self) do
        if v ~= nil then
            d[k] = v
        end
    end
    return d
end

-- ---------------------------------------------------------------------------
-- ViewMaterialChangeCommandSimple
-- ---------------------------------------------------------------------------
local ViewMaterialChangeCommandSimple = {}
ViewMaterialChangeCommandSimple.__index = ViewMaterialChangeCommandSimple

function ViewMaterialChangeCommandSimple.new(data)
    local self = setmetatable({}, ViewMaterialChangeCommandSimple)
    data = data or {}
    self.color = data.color
    self.opacity = data.opacity
    self.transparent = data.transparent
    self.visible = data.visible
    self.wireframe = data.wireframe
    self.side = data.side
    self.fog = data.fog
    self.emissive = data.emissive
    self.emissiveIntensity = data.emissiveIntensity
    return self
end

function ViewMaterialChangeCommandSimple:to_dict()
    local d = {}
    for k, v in pairs(self) do
        if v ~= nil then
            d[k] = v
        end
    end
    return d
end

-- Module exports
type_def_view.ViewMaterialChangeCommand = ViewMaterialChangeCommand
type_def_view.ViewMaterialChangeCommandSimple = ViewMaterialChangeCommandSimple

function type_def_view.view_material_change_command_from_dict(data)
    return ViewMaterialChangeCommand.new(data)
end

function type_def_view.view_material_change_command_simple_from_dict(data)
    return ViewMaterialChangeCommandSimple.new(data)
end

return type_def_view
