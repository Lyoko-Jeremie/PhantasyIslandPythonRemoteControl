-module(type_def_view).
-export([view_material_change_command_to_map/1, view_material_change_command_simple_to_map/1]).

-record(view_material_change_command, {
    materialType, color, opacity, transparent, visible, wireframe, side, depthTest, depthWrite, alphaTest, blending, vertexColors, fog,
    emissive, emissiveIntensity, metalness, roughness, envMapIntensity, flatShading, shininess, specular,
    clearcoat, clearcoatRoughness, transmission, ior, thickness, sheen, sheenRoughness, sheenColor,
    attenuationColor, attenuationDistance, iridescence, iridescenceIOR, iridescenceThicknessRange,
    specularIntensity, specularColor, reflectivity, dispersion, anisotropy, anisotropyRotation,
    mapUrl, normalMapUrl, roughnessMapUrl, metalnessMapUrl, emissiveMapUrl, aoMapUrl, alphaMapUrl, bumpMapUrl, displacementMapUrl,
    normalScale, bumpScale, displacementScale, displacementBias, aoMapIntensity, mapRepeat, mapOffset, mapRotation
}).

-record(view_material_change_command_simple, {
    color, opacity, transparent, visible, wireframe, side, fog, emissive, emissiveIntensity
}).

view_material_change_command_to_map(R) ->
    Fields = record_info(fields, view_material_change_command),
    [_ | Values] = tuple_to_list(R),
    lists:foldl(fun({K, V}, Acc) ->
        if V =/= undefined -> 
            V1 = case V of
                {X, Y} -> [X, Y];
                _ -> V
            end,
            maps:put(atom_to_binary(K), V1, Acc); 
        true -> Acc end
    end, #{}, lists:zip(Fields, Values)).

view_material_change_command_simple_to_map(R) ->
    Fields = record_info(fields, view_material_change_command_simple),
    [_ | Values] = tuple_to_list(R),
    lists:foldl(fun({K, V}, Acc) ->
        if V =/= undefined -> maps:put(atom_to_binary(K), V, Acc); true -> Acc end
    end, #{}, lists:zip(Fields, Values)).
