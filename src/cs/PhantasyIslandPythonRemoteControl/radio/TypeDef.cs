using System;
using System.Collections.Generic;
using System.Linq;

namespace PhantasyIslandPythonRemoteControl.Radio
{
    public class XYZ
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Z { get; set; }

        public XYZ(double x, double y, double z)
        {
            X = x;
            Y = y;
            Z = z;
        }

        public List<double> ToList() => new List<double> { X, Y, Z };
        public static XYZ FromList(IList<double> list) => new XYZ(list[0], list[1], list[2]);
    }

    public class RadioCheckOptions
    {
        public double? FrequencyMHz { get; set; }
        public double? TxPowerDbm { get; set; }
        public double? RxSensitivityDbm { get; set; }
        public double? FresnelZoneRatio { get; set; }
        public bool? SkipFresnelZoneCheck { get; set; }
        public bool? EnableMultipath { get; set; }
        public double? MaxReflectionPaths { get; set; }
        public double? MaxReflectionPathLengthRatio { get; set; }
        public double? DefaultTxAntennaGain_dBi { get; set; }
        public double? DefaultRxAntennaGain_dBi { get; set; }
        public bool? EnableAntennaPattern { get; set; }
        public bool? EnableMutualCoupling { get; set; }
        public double? CouplingNegligibleThresholdWavelengths { get; set; }
        public bool? EnableSINR { get; set; }
        public double? ReceiverBandwidthHz { get; set; }
        public double? MinSINR_dB { get; set; }
        public bool? EnableFrequencyIsolation { get; set; }
        public bool? EnableNearFieldCorrection { get; set; }
        public bool? EnableNodeBodyOcclusion { get; set; }

        public Dictionary<string, object> ToDict()
        {
            var dict = new Dictionary<string, object>();
            foreach (var prop in GetType().GetProperties())
            {
                var val = prop.GetValue(this);
                if (val != null && prop.Name != "ToDict")
                {
                    string name = char.ToLower(prop.Name[0]) + prop.Name.Substring(1);
                    if (val is XYZ xyz) dict[name] = xyz.ToList();
                    else dict[name] = val;
                }
            }

            return dict;
        }
    }

    public class RadioMaterialProperties
    {
        public string Id { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public double PenetrationLoss_dBPerMeter { get; set; }
        public double ReflectionCoefficient { get; set; }
        public double DefaultThickness_m { get; set; }

        public Dictionary<string, object> ToDict()
        {
            return new Dictionary<string, object>
            {
                ["id"] = Id,
                ["displayName"] = DisplayName,
                ["penetrationLoss_dBPerMeter"] = PenetrationLoss_dBPerMeter,
                ["reflectionCoefficient"] = ReflectionCoefficient,
                ["defaultThickness_m"] = DefaultThickness_m
            };
        }
    }

    public class JoyStickInput
    {
        public double Vx { get; set; } = 0.0;
        public double Vy { get; set; } = 0.0;
        public double Vz { get; set; } = 0.0;
        public double YawRate { get; set; } = 0.0;

        public Dictionary<string, object> ToDict()
        {
            return new Dictionary<string, object>
            {
                ["vx"] = Vx,
                ["vy"] = Vy,
                ["vz"] = Vz,
                ["yawRate"] = YawRate
            };
        }
    }
}