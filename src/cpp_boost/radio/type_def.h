#pragma once
#include <string>
#include <vector>
#include <optional>
#include <boost/json.hpp>

namespace PhantasyIsland {
namespace Radio {

    struct XYZ {
        double x = 0, y = 0, z = 0;
        boost::json::array to_json() const { return {x, y, z}; }
        static XYZ from_json(const boost::json::array& arr) {
            return {arr.at(0).as_double(), arr.at(1).as_double(), arr.at(2).as_double()};
        }
    };

    struct RadioCheckOptions {
        std::optional<double> frequencyMHz;
        std::optional<double> txPowerDbm;
        std::optional<double> rxSensitivityDbm;
        std::optional<double> fresnelZoneRatio;
        std::optional<bool> skipFresnelZoneCheck;
        std::optional<bool> enableMultipath;
        std::optional<double> maxReflectionPaths;
        std::optional<double> maxReflectionPathLengthRatio;
        std::optional<double> defaultTxAntennaGain_dBi;
        std::optional<double> defaultRxAntennaGain_dBi;
        std::optional<bool> enableAntennaPattern;
        std::optional<bool> enableMutualCoupling;
        std::optional<double> couplingNegligibleThresholdWavelengths;
        std::optional<bool> enableSINR;
        std::optional<double> receiverBandwidthHz;
        std::optional<double> minSINR_dB;
        std::optional<bool> enableFrequencyIsolation;
        std::optional<bool> enableNearFieldCorrection;
        std::optional<bool> enableNodeBodyOcclusion;

        boost::json::object to_json() const {
            boost::json::object obj;
            if (frequencyMHz) obj["frequencyMHz"] = *frequencyMHz;
            if (txPowerDbm) obj["txPowerDbm"] = *txPowerDbm;
            if (rxSensitivityDbm) obj["rxSensitivityDbm"] = *rxSensitivityDbm;
            if (fresnelZoneRatio) obj["fresnelZoneRatio"] = *fresnelZoneRatio;
            if (skipFresnelZoneCheck) obj["skipFresnelZoneCheck"] = *skipFresnelZoneCheck;
            if (enableMultipath) obj["enableMultipath"] = *enableMultipath;
            if (maxReflectionPaths) obj["maxReflectionPaths"] = *maxReflectionPaths;
            if (maxReflectionPathLengthRatio) obj["maxReflectionPathLengthRatio"] = *maxReflectionPathLengthRatio;
            if (defaultTxAntennaGain_dBi) obj["defaultTxAntennaGain_dBi"] = *defaultTxAntennaGain_dBi;
            if (defaultRxAntennaGain_dBi) obj["defaultRxAntennaGain_dBi"] = *defaultRxAntennaGain_dBi;
            if (enableAntennaPattern) obj["enableAntennaPattern"] = *enableAntennaPattern;
            if (enableMutualCoupling) obj["enableMutualCoupling"] = *enableMutualCoupling;
            if (couplingNegligibleThresholdWavelengths) obj["couplingNegligibleThresholdWavelengths"] = *couplingNegligibleThresholdWavelengths;
            if (enableSINR) obj["enableSINR"] = *enableSINR;
            if (receiverBandwidthHz) obj["receiverBandwidthHz"] = *receiverBandwidthHz;
            if (minSINR_dB) obj["minSINR_dB"] = *minSINR_dB;
            if (enableFrequencyIsolation) obj["enableFrequencyIsolation"] = *enableFrequencyIsolation;
            if (enableNearFieldCorrection) obj["enableNearFieldCorrection"] = *enableNearFieldCorrection;
            if (enableNodeBodyOcclusion) obj["enableNodeBodyOcclusion"] = *enableNodeBodyOcclusion;
            return obj;
        }
    };

    struct CheckReachabilityRequest {
        XYZ aTx;
        XYZ bRx;
        std::optional<RadioCheckOptions> options;

        boost::json::object to_json() const {
            boost::json::object obj;
            obj["aTx"] = aTx.to_json();
            obj["bRx"] = bRx.to_json();
            if (options) obj["options"] = options->to_json();
            return obj;
        }
    };

    struct UpdateObjectPosRequest {
        std::string objectId;
        XYZ position;
        boost::json::object to_json() const {
            return {{"objectId", objectId}, {"position", position.to_json()}};
        }
    };

    struct RadioMaterialProperties {
        std::string id;
        std::string displayName;
        double penetrationLoss_dBPerMeter;
        double reflectionCoefficient;
        double defaultThickness_m;
        
        static RadioMaterialProperties from_json(const boost::json::object& obj) {
            return {
                std::string(obj.at("id").as_string()),
                std::string(obj.at("displayName").as_string()),
                obj.at("penetrationLoss_dBPerMeter").as_double(),
                obj.at("reflectionCoefficient").as_double(),
                obj.at("defaultThickness_m").as_double()
            };
        }
    };

    struct JoyStickInput {
        double vx = 0, vy = 0, vz = 0, yawRate = 0;
        boost::json::object to_json() const {
            return {{"vx", vx}, {"vy", vy}, {"vz", vz}, {"yawRate", yawRate}};
        }
    };

}
}
