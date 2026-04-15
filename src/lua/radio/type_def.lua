-- Radio related type definitions in Lua

local type_def = {}

-- Helper functions
local function xyz_from_list(data)
    return { tonumber(data[1]), tonumber(data[2]), tonumber(data[3]) }
end

-- ---------------------------------------------------------------------------
-- RadioCheckOptions
-- ---------------------------------------------------------------------------
local RadioCheckOptions = {}
RadioCheckOptions.__index = RadioCheckOptions

function RadioCheckOptions.new(data)
    local self = setmetatable({}, RadioCheckOptions)
    data = data or {}
    self.frequencyMHz = data.frequencyMHz
    self.txPowerDbm = data.txPowerDbm
    self.rxSensitivityDbm = data.rxSensitivityDbm
    self.fresnelZoneRatio = data.fresnelZoneRatio
    self.skipFresnelZoneCheck = data.skipFresnelZoneCheck
    self.enableMultipath = data.enableMultipath
    self.maxReflectionPaths = data.maxReflectionPaths
    self.maxReflectionPathLengthRatio = data.maxReflectionPathLengthRatio
    self.defaultTxAntennaGain_dBi = data.defaultTxAntennaGain_dBi
    self.defaultRxAntennaGain_dBi = data.defaultRxAntennaGain_dBi
    self.enableAntennaPattern = data.enableAntennaPattern
    self.enableMutualCoupling = data.enableMutualCoupling
    self.couplingNegligibleThresholdWavelengths = data.couplingNegligibleThresholdWavelengths
    self.enableSINR = data.enableSINR
    self.receiverBandwidthHz = data.receiverBandwidthHz
    self.minSINR_dB = data.minSINR_dB
    self.enableFrequencyIsolation = data.enableFrequencyIsolation
    self.enableNearFieldCorrection = data.enableNearFieldCorrection
    self.enableNodeBodyOcclusion = data.enableNodeBodyOcclusion
    return self
end

function RadioCheckOptions:to_dict()
    local d = {}
    for k, v in pairs(self) do
        if v ~= nil then
            d[k] = v
        end
    end
    return d
end

-- ---------------------------------------------------------------------------
-- CheckReachabilityRequest
-- ---------------------------------------------------------------------------
local CheckReachabilityRequest = {}
CheckReachabilityRequest.__index = CheckReachabilityRequest

function CheckReachabilityRequest.new(aTx, bRx, options)
    local self = setmetatable({}, CheckReachabilityRequest)
    self.aTx = aTx
    self.bRx = bRx
    self.options = options
    return self
end

function CheckReachabilityRequest:to_dict()
    local d = {
        aTx = self.aTx,
        bRx = self.bRx
    }
    if self.options then
        d.options = self.options:to_dict()
    end
    return d
end

-- ---------------------------------------------------------------------------
-- UpdateObjectPosRequest
-- ---------------------------------------------------------------------------
local UpdateObjectPosRequest = {}
UpdateObjectPosRequest.__index = UpdateObjectPosRequest

function UpdateObjectPosRequest.new(objectId, position)
    local self = setmetatable({}, UpdateObjectPosRequest)
    self.objectId = objectId
    self.position = position
    return self
end

function UpdateObjectPosRequest:to_dict()
    return {
        objectId = self.objectId,
        position = self.position
    }
end

-- ---------------------------------------------------------------------------
-- UpdateMeshRadioMaterialRequest
-- ---------------------------------------------------------------------------
local UpdateMeshRadioMaterialRequest = {}
UpdateMeshRadioMaterialRequest.__index = UpdateMeshRadioMaterialRequest

function UpdateMeshRadioMaterialRequest.new(meshId, materialId, thickness_m)
    local self = setmetatable({}, UpdateMeshRadioMaterialRequest)
    self.meshId = meshId
    self.materialId = materialId
    self.thickness_m = thickness_m
    return self
end

function UpdateMeshRadioMaterialRequest:to_dict()
    local d = { meshId = self.meshId }
    if self.materialId then d.materialId = self.materialId end
    if self.thickness_m then d.thickness_m = self.thickness_m end
    return d
end

-- ---------------------------------------------------------------------------
-- RadioMaterialProperties
-- ---------------------------------------------------------------------------
local RadioMaterialProperties = {}
RadioMaterialProperties.__index = RadioMaterialProperties

function RadioMaterialProperties.new(data)
    local self = setmetatable({}, RadioMaterialProperties)
    self.id = data.id
    self.displayName = data.displayName
    self.penetrationLoss_dBPerMeter = data.penetrationLoss_dBPerMeter
    self.reflectionCoefficient = data.reflectionCoefficient
    self.defaultThickness_m = data.defaultThickness_m
    return self
end

function RadioMaterialProperties:to_dict()
    return {
        id = self.id,
        displayName = self.displayName,
        penetrationLoss_dBPerMeter = self.penetrationLoss_dBPerMeter,
        reflectionCoefficient = self.reflectionCoefficient,
        defaultThickness_m = self.defaultThickness_m
    }
end

-- ---------------------------------------------------------------------------
-- JoyStickInput
-- ---------------------------------------------------------------------------
local JoyStickInput = {}
JoyStickInput.__index = JoyStickInput

function JoyStickInput.new(data)
    local self = setmetatable({}, JoyStickInput)
    data = data or {}
    self.vx = data.vx or 0.0
    self.vy = data.vy or 0.0
    self.vz = data.vz or 0.0
    self.yawRate = data.yawRate or 0.0
    return self
end

function JoyStickInput:to_dict()
    return {
        vx = self.vx,
        vy = self.vy,
        vz = self.vz,
        yawRate = self.yawRate
    }
end

-- Module exports
type_def.RadioCheckOptions = RadioCheckOptions
type_def.CheckReachabilityRequest = CheckReachabilityRequest
type_def.UpdateObjectPosRequest = UpdateObjectPosRequest
type_def.UpdateMeshRadioMaterialRequest = UpdateMeshRadioMaterialRequest
type_def.RadioMaterialProperties = RadioMaterialProperties
type_def.JoyStickInput = JoyStickInput

function type_def.radio_check_options_from_dict(data)
    return RadioCheckOptions.new(data)
end

function type_def.check_reachability_request_from_dict(data)
    local opts = nil
    if data.options then
        opts = RadioCheckOptions.new(data.options)
    end
    return CheckReachabilityRequest.new(xyz_from_list(data.aTx), xyz_from_list(data.bRx), opts)
end

function type_def.update_object_pos_request_from_dict(data)
    return UpdateObjectPosRequest.new(tostring(data.objectId), xyz_from_list(data.position))
end

function type_def.update_mesh_radio_material_request_from_dict(data)
    return UpdateMeshRadioMaterialRequest.new(tostring(data.meshId), data.materialId, data.thickness_m)
end

function type_def.radio_material_properties_from_dict(data)
    return RadioMaterialProperties.new(data)
end

function type_def.joystick_input_from_dict(data)
    return JoyStickInput.new(data)
end

return type_def
