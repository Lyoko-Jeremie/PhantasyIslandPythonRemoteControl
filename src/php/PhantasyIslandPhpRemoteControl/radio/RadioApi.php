<?php

namespace PhantasyIslandPhpRemoteControl\Radio;

class RadioApi extends ApiModule
{
    public function isSceneInit()
    {
        return $this->send('radio.isSceneInit', null, null, 3.0, function($d) {
            return $d['init'] ?? null;
        });
    }

    public function isRadioReachabilityCheckerInit()
    {
        return $this->send('radio.isRadioReachabilityCheckerInit', null, null, 3.0, function($d) {
            return $d['init'] ?? null;
        });
    }

    public function checkReachability($aTx, $bRx, $options = null)
    {
        return $this->send('radio.checkReachability', [
            'aTx' => $aTx,
            'bRx' => $bRx,
            'options' => ($options && method_exists($options, 'to_dict')) ? $options->to_dict() : $options,
        ]);
    }

    public function updateObjectPos($objectId, $position)
    {
        return $this->send('radio.updateObjectPos', [
            'objectId' => $objectId,
            'position' => $position,
        ]);
    }

    public function getObjectPos($objectId)
    {
        return $this->send('radio.updateObjectPos', [ // Note: Python original uses updateObjectPos here too, might be a typo in original or intentional
            'objectId' => $objectId,
        ], null, 3.0, function($d) {
            return $d['position'] ?? null;
        });
    }

    public function updateMeshRadioMaterial($meshId, $materialId = null, $thickness_m = null)
    {
        return $this->send('radio.updateMeshRadioMaterial', [
            'meshId' => $meshId,
            'materialId' => $materialId,
            'thickness_m' => $thickness_m,
        ]);
    }

    public function getAllRadioMaterial()
    {
        return $this->send('radio.getAllRadioMaterial', null, null, 3.0, function($d) {
            $meshIds = $d['meshIds'] ?? [];
            return array_map(function($n) { return TypeDef::radio_material_properties_from_dict($n); }, $meshIds);
        });
    }

    public function localRadioMaterial()
    {
        return $this->send('radio.localRadioMaterial', null, null, 3.0, function($d) {
            $meshIds = $d['meshIds'] ?? [];
            return array_map(function($n) { return TypeDef::radio_material_properties_from_dict($n); }, $meshIds);
        });
    }

    public function getBuildingRadioMaterial()
    {
        return $this->send('radio.getBuildingRadioMaterial');
    }

    public function addRadioMaterial($material)
    {
        $data = ($material && method_exists($material, 'to_dict')) ? $material->to_dict() : $material;
        return $this->send('radio.addRadioMaterial', $data);
    }

    public function listRadioLocalObjectsIds()
    {
        return $this->send('radio.listRadioLocalObjects', null, null, 3.0, function($d) {
            return $d['localObjectIds'] ?? [];
        });
    }
}
