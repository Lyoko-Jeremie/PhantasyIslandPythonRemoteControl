<?php

namespace PhantasyIslandPhpRemoteControl\Radio;

class FlyApi extends ApiModule
{
    public function listFlyObject()
    {
        return $this->send('fly.listFlyObject');
    }

    public function getFlyObjectInfo($keyName)
    {
        return $this->send('fly.getFlyObjectInfo', ['keyName' => $keyName]);
    }

    public function getFlyObjectCameraImageDown($keyName)
    {
        return $this->send('fly.getFlyObjectCameraImageDown', ['keyName' => $keyName]);
    }

    public function getFlyObjectCameraImageFront($keyName)
    {
        return $this->send('fly.getFlyObjectCameraImageFront', ['keyName' => $keyName]);
    }
}
