-module(type_def).

-export([radio_check_options_to_map/1, check_reachability_request_to_map/1]).
-export([update_object_pos_request_to_map/1, update_mesh_radio_material_request_to_map/1]).
-export([radio_material_properties_to_map/1, joystick_input_to_map/1]).

-record(radio_check_options, {
    frequencyMHz,
    txPowerDbm,
    rxSensitivityDbm,
    fresnelZoneRatio,
    skipFresnelZoneCheck,
    enableMultipath,
    maxReflectionPaths,
    maxReflectionPathLengthRatio,
    defaultTxAntennaGain_dBi,
    defaultRxAntennaGain_dBi,
    enableAntennaPattern,
    enableMutualCoupling,
    couplingNegligibleThresholdWavelengths,
    enableSINR,
    receiverBandwidthHz,
    minSINR_dB,
    enableFrequencyIsolation,
    enableNearFieldCorrection,
    enableNodeBodyOcclusion
}).

-record(check_reachability_request, {
    aTx,
    bRx,
    options
}).

-record(update_object_pos_request, {
    objectId,
    position
}).

-record(update_mesh_radio_material_request, {
    meshId,
    materialId,
    thickness_m
}).

-record(radio_material_properties, {
    id,
    displayName,
    penetrationLoss_dBPerMeter,
    reflectionCoefficient,
    defaultThickness_m
}).

-record(joystick_input, {
    vx = 0.0,
    vy = 0.0,
    vz = 0.0,
    yawRate = 0.0
}).

radio_check_options_to_map(R) ->
    Fields = record_info(fields, radio_check_options),
    [_ | Values] = tuple_to_list(R),
    lists:foldl(fun({K, V}, Acc) ->
        if V =/= undefined -> maps:put(atom_to_binary(K), V, Acc); true -> Acc end
    end, #{}, lists:zip(Fields, Values)).

check_reachability_request_to_map(#check_reachability_request{aTx = {X1, Y1, Z1}, bRx = {X2, Y2, Z2}, options = Opts}) ->
    Map = #{
        <<"aTx">> => [X1, Y1, Z1],
        <<"bRx">> => [X2, Y2, Z2]
    },
    case Opts of
        undefined -> Map;
        _ -> maps:put(<<"options">>, radio_check_options_to_map(Opts), Map)
    end.

update_object_pos_request_to_map(#update_object_pos_request{objectId = Id, position = {X, Y, Z}}) ->
    #{
        <<"objectId">> => Id,
        <<"position">> => [X, Y, Z]
    }.

update_mesh_radio_material_request_to_map(#update_mesh_radio_material_request{meshId = Mid, materialId = MatId, thickness_m = T}) ->
    Map = #{<<"meshId">> => Mid},
    Map1 = if MatId =/= undefined -> maps:put(<<"materialId">>, MatId, Map); true -> Map end,
    if T =/= undefined -> maps:put(<<"thickness_m">>, T, Map1); true -> Map1 end.

radio_material_properties_to_map(R) ->
    Fields = record_info(fields, radio_material_properties),
    [_ | Values] = tuple_to_list(R),
    lists:foldl(fun({K, V}, Acc) ->
        maps:put(atom_to_binary(K), V, Acc)
    end, #{}, lists:zip(Fields, Values)).

joystick_input_to_map(#joystick_input{vx = VX, vy = VY, vz = VZ, yawRate = YR}) ->
    #{
        <<"vx">> => VX,
        <<"vy">> => VY,
        <<"vz">> => VZ,
        <<"yawRate">> => YR
    }.
