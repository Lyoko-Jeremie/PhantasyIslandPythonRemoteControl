namespace PhantasyIslandRemoteControl

open System

module ImageProcess =
    let readB64Img (uri: string) =
        if String.IsNullOrEmpty uri then null
        else
            try
                let parts = uri.Split(',')
                if parts.Length < 2 then null
                else Convert.FromBase64String(parts.[1])
            with _ -> null
