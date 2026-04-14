<?php

namespace PhantasyIslandPhpRemoteControl\Radio;

class ViewMaterialChangeCommand
{
    public $materialType = null;
    public $color = null;
    public $opacity = null;
    public $transparent = null;
    public $visible = null;
    public $wireframe = null;
    public $side = null;
    public $depthTest = null;
    public $depthWrite = null;
    public $alphaTest = null;
    public $blending = null;
    public $vertexColors = null;
    public $fog = null;
    public $emissive = null;
    public $emissiveIntensity = null;
    public $metalness = null;
    public $roughness = null;
    public $envMapIntensity = null;
    public $flatShading = null;
    public $shininess = null;
    public $specular = null;
    public $clearcoat = null;
    public $clearcoatRoughness = null;
    public $transmission = null;
    public $ior = null;
    public $thickness = null;
    public $sheen = null;
    public $sheenRoughness = null;
    public $sheenColor = null;
    public $attenuationColor = null;
    public $attenuationDistance = null;
    public $iridescence = null;
    public $iridescenceIOR = null;
    public $iridescenceThicknessRange = null;
    public $specularIntensity = null;
    public $specularColor = null;
    public $reflectivity = null;
    public $dispersion = null;
    public $anisotropy = null;
    public $anisotropyRotation = null;
    public $mapUrl = null;
    public $normalMapUrl = null;
    public $roughnessMapUrl = null;
    public $metalnessMapUrl = null;
    public $emissiveMapUrl = null;
    public $aoMapUrl = null;
    public $alphaMapUrl = null;
    public $bumpMapUrl = null;
    public $displacementMapUrl = null;
    public $normalScale = null;
    public $bumpScale = null;
    public $displacementScale = null;
    public $displacementBias = null;
    public $aoMapIntensity = null;
    public $mapRepeat = null;
    public $mapOffset = null;
    public $mapRotation = null;

    public function to_dict()
    {
        $d = [];
        foreach (get_object_vars($this) as $k => $v) {
            if ($v !== null) $d[$k] = $v;
        }
        return $d;
    }
}

class ViewMaterialChangeCommandSimple
{
    public $color = null;
    public $opacity = null;
    public $transparent = null;
    public $visible = null;
    public $wireframe = null;
    public $side = null;
    public $fog = null;
    public $emissive = null;
    public $emissiveIntensity = null;

    public function to_dict()
    {
        $d = [];
        foreach (get_object_vars($this) as $k => $v) {
            if ($v !== null) $d[$k] = $v;
        }
        return $d;
    }
}
