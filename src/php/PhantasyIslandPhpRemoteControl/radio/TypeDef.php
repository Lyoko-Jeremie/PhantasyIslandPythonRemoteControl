<?php

namespace PhantasyIslandPhpRemoteControl\Radio;

class RadioCheckOptions
{
    public $frequencyMHz = null;
    public $txPowerDbm = null;
    public $rxSensitivityDbm = null;
    public $fresnelZoneRatio = null;
    public $skipFresnelZoneCheck = null;
    public $enableMultipath = null;
    public $maxReflectionPaths = null;
    public $maxReflectionPathLengthRatio = null;
    public $defaultTxAntennaGain_dBi = null;
    public $defaultRxAntennaGain_dBi = null;
    public $enableAntennaPattern = null;
    public $enableMutualCoupling = null;
    public $couplingNegligibleThresholdWavelengths = null;
    public $enableSINR = null;
    public $receiverBandwidthHz = null;
    public $minSINR_dB = null;
    public $enableFrequencyIsolation = null;
    public $enableNearFieldCorrection = null;
    public $enableNodeBodyOcclusion = null;

    public function to_dict()
    {
        $d = [];
        foreach (get_object_vars($this) as $k => $v) {
            if ($v !== null) $d[$k] = $v;
        }
        return $d;
    }
}

class RadioMaterialProperties
{
    public $id;
    public $displayName;
    public $penetrationLoss_dBPerMeter;
    public $reflectionCoefficient;
    public $defaultThickness_m;

    public function __construct($id, $displayName, $penetrationLoss, $reflection, $thickness)
    {
        $this->id = $id;
        $this->displayName = $displayName;
        $this->penetrationLoss_dBPerMeter = $penetrationLoss;
        $this->reflectionCoefficient = $reflection;
        $this->defaultThickness_m = $thickness;
    }

    public function to_dict()
    {
        return get_object_vars($this);
    }
}

class TypeDef
{
    public static function radio_check_options_from_dict($data)
    {
        $obj = new RadioCheckOptions();
        foreach ($data as $k => $v) {
            if (property_exists($obj, $k)) $obj->$k = $v;
        }
        return $obj;
    }

    public static function radio_material_properties_from_dict($data)
    {
        return new RadioMaterialProperties(
            $data['id'],
            $data['displayName'],
            $data['penetrationLoss_dBPerMeter'],
            $data['reflectionCoefficient'],
            $data['defaultThickness_m']
        );
    }
}
