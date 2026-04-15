-module(image_process).
-export([read_b64_img/1]).

read_b64_img(nil) -> nil;
read_b64_img(URI) when is_binary(URI) ->
    case binary:split(URI, <<",">>) of
        [_, B64] ->
            base64:decode(B64);
        _ ->
            nil
    end;
read_b64_img(_) -> nil.
