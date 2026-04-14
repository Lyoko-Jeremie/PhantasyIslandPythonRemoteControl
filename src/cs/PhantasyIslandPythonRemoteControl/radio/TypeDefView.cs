using System;
using System.Collections.Generic;

namespace PhantasyIslandPythonRemoteControl.Radio
{
    public class ViewMaterialChangeCommand
    {
        public string MaterialType { get; set; }
        public string Color { get; set; }
        public float? Opacity { get; set; }
        public bool? Transparent { get; set; }
        public bool? Visible { get; set; }
        public bool? Wireframe { get; set; }
        public int? Side { get; set; }
        public bool? DepthTest { get; set; }
        public bool? DepthWrite { get; set; }
        public float? AlphaTest { get; set; }
        public int? Blending { get; set; }
        public bool? VertexColors { get; set; }
        public bool? Fog { get; set; }
        public string Emissive { get; set; }
        public float? EmissiveIntensity { get; set; }
        public float? Metalness { get; set; }
        public float? Roughness { get; set; }
        public float? EnvMapIntensity { get; set; }
        public bool? FlatShading { get; set; }
        public float? Shininess { get; set; }
        public string Specular { get; set; }
        public float? Clearcoat { get; set; }
        public float? ClearcoatRoughness { get; set; }
        public float? Transmission { get; set; }
        public float? Ior { get; set; }
        public float? Thickness { get; set; }
        public float? Sheen { get; set; }
        public float? SheenRoughness { get; set; }
        public string SheenColor { get; set; }
        public string AttenuationColor { get; set; }
        public float? AttenuationDistance { get; set; }
        public float? Iridescence { get; set; }
        public float? IridescenceIOR { get; set; }
        public List<float> IridescenceThicknessRange { get; set; }
        public float? SpecularIntensity { get; set; }
        public string SpecularColor { get; set; }
        public float? Reflectivity { get; set; }
        public float? Dispersion { get; set; }
        public float? Anisotropy { get; set; }
        public float? AnisotropyRotation { get; set; }
        public string MapUrl { get; set; }
        public string NormalMapUrl { get; set; }
        public string RoughnessMapUrl { get; set; }
        public string MetalnessMapUrl { get; set; }
        public string EmissiveMapUrl { get; set; }
        public string AoMapUrl { get; set; }
        public string AlphaMapUrl { get; set; }
        public string BumpMapUrl { get; set; }
        public string DisplacementMapUrl { get; set; }
        public List<float> NormalScale { get; set; }
        public float? BumpScale { get; set; }
        public float? DisplacementScale { get; set; }
        public float? DisplacementBias { get; set; }
        public float? AoMapIntensity { get; set; }
        public List<float> MapRepeat { get; set; }
        public List<float> MapOffset { get; set; }
        public float? MapRotation { get; set; }

        public Dictionary<string, object> ToDict()
        {
            var dict = new Dictionary<string, object>();
            foreach (var prop in GetType().GetProperties())
            {
                var val = prop.GetValue(this);
                if (val != null)
                {
                    string name = char.ToLower(prop.Name[0]) + prop.Name.Substring(1);
                    dict[name] = val;
                }
            }

            return dict;
        }
    }

    public class ViewMaterialChangeCommandSimple
    {
        public string Color { get; set; }
        public float? Opacity { get; set; }
        public bool? Transparent { get; set; }
        public bool? Visible { get; set; }
        public bool? Wireframe { get; set; }
        public int? Side { get; set; }
        public bool? Fog { get; set; }
        public string Emissive { get; set; }
        public float? EmissiveIntensity { get; set; }

        public Dictionary<string, object> ToDict()
        {
            var dict = new Dictionary<string, object>();
            foreach (var prop in GetType().GetProperties())
            {
                var val = prop.GetValue(this);
                if (val != null)
                {
                    string name = char.ToLower(prop.Name[0]) + prop.Name.Substring(1);
                    dict[name] = val;
                }
            }

            return dict;
        }
    }
}