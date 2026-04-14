package radio

// ViewMaterialChangeCommand — 修改 mesh 可视化材质的指令（完整版）
type ViewMaterialChangeCommand struct {
	MaterialType              *string     `json:"materialType,omitempty"`
	Color                     *string     `json:"color,omitempty"`
	Opacity                   *float64    `json:"opacity,omitempty"`
	Transparent               *bool       `json:"transparent,omitempty"`
	Visible                   *bool       `json:"visible,omitempty"`
	Wireframe                 *bool       `json:"wireframe,omitempty"`
	Side                      *int        `json:"side,omitempty"`
	DepthTest                 *bool       `json:"depthTest,omitempty"`
	DepthWrite                *bool       `json:"depthWrite,omitempty"`
	AlphaTest                 *float64    `json:"alphaTest,omitempty"`
	Blending                  *int        `json:"blending,omitempty"`
	VertexColors              *bool       `json:"vertexColors,omitempty"`
	Fog                       *bool       `json:"fog,omitempty"`
	Emissive                  *string     `json:"emissive,omitempty"`
	EmissiveIntensity         *float64    `json:"emissiveIntensity,omitempty"`
	Metalness                 *float64    `json:"metalness,omitempty"`
	Roughness                 *float64    `json:"roughness,omitempty"`
	EnvMapIntensity           *float64    `json:"envMapIntensity,omitempty"`
	FlatShading               *bool       `json:"flatShading,omitempty"`
	Shininess                 *float64    `json:"shininess,omitempty"`
	Specular                  *string     `json:"specular,omitempty"`
	Clearcoat                 *float64    `json:"clearcoat,omitempty"`
	ClearcoatRoughness        *float64    `json:"clearcoatRoughness,omitempty"`
	Transmission              *float64    `json:"transmission,omitempty"`
	Ior                       *float64    `json:"ior,omitempty"`
	Thickness                 *float64    `json:"thickness,omitempty"`
	Sheen                     *float64    `json:"sheen,omitempty"`
	SheenRoughness            *float64    `json:"sheenRoughness,omitempty"`
	SheenColor                *string     `json:"sheenColor,omitempty"`
	AttenuationColor          *string     `json:"attenuationColor,omitempty"`
	AttenuationDistance       *float64    `json:"attenuationDistance,omitempty"`
	Iridescence               *float64    `json:"iridescence,omitempty"`
	IridescenceIOR            *float64    `json:"iridescenceIOR,omitempty"`
	IridescenceThicknessRange *[2]float64 `json:"iridescenceThicknessRange,omitempty"`
	SpecularIntensity         *float64    `json:"specularIntensity,omitempty"`
	SpecularColor             *string     `json:"specularColor,omitempty"`
	Reflectivity              *float64    `json:"reflectivity,omitempty"`
	Dispersion                *float64    `json:"dispersion,omitempty"`
	Anisotropy                *float64    `json:"anisotropy,omitempty"`
	AnisotropyRotation        *float64    `json:"anisotropyRotation,omitempty"`
	MapURL                    *string     `json:"mapUrl,omitempty"`
	NormalMapURL              *string     `json:"normalMapUrl,omitempty"`
	RoughnessMapURL           *string     `json:"roughnessMapUrl,omitempty"`
	MetalnessMapURL           *string     `json:"metalnessMapUrl,omitempty"`
	EmissiveMapURL            *string     `json:"emissiveMapUrl,omitempty"`
	AoMapURL                  *string     `json:"aoMapUrl,omitempty"`
	AlphaMapURL               *string     `json:"alphaMapUrl,omitempty"`
	BumpMapURL                *string     `json:"bumpMapUrl,omitempty"`
	DisplacementMapURL        *string     `json:"displacementMapUrl,omitempty"`
	NormalScale               *[2]float64 `json:"normalScale,omitempty"`
	BumpScale                 *float64    `json:"bumpScale,omitempty"`
	DisplacementScale         *float64    `json:"displacementScale,omitempty"`
	DisplacementBias          *float64    `json:"displacementBias,omitempty"`
	AoMapIntensity            *float64    `json:"aoMapIntensity,omitempty"`
	MapRepeat                 *[2]float64 `json:"mapRepeat,omitempty"`
	MapOffset                 *[2]float64 `json:"mapOffset,omitempty"`
	MapRotation               *float64    `json:"mapRotation,omitempty"`
}

// ViewMaterialChangeCommandSimple — 修改 mesh 可视化材质的指令（简化版）
type ViewMaterialChangeCommandSimple struct {
	Color             *string  `json:"color,omitempty"`
	Opacity           *float64 `json:"opacity,omitempty"`
	Transparent       *bool    `json:"transparent,omitempty"`
	Visible           *bool    `json:"visible,omitempty"`
	Wireframe         *bool    `json:"wireframe,omitempty"`
	Side              *int     `json:"side,omitempty"`
	Fog               *bool    `json:"fog,omitempty"`
	Emissive          *string  `json:"emissive,omitempty"`
	EmissiveIntensity *float64 `json:"emissiveIntensity,omitempty"`
}
