<?php

namespace PhantasyIslandPhpRemoteControl\Radio;

class DebugApi extends ApiModule
{
    public function ping()
    {
        return $this->send('ping', null, 'pong');
    }
}
