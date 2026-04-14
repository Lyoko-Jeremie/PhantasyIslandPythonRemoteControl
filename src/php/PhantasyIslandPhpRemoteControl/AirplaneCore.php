<?php

namespace PhantasyIslandPhpRemoteControl;

/**
 * 每个飞机的飞行状态
 */
class AirplaneFlyStatus
{
    public $landing;
    public $isStop;
    public $x;
    public $y;
    public $h;
    public $rX;
    public $rY;
    public $rZ;

    public function __construct($fly_status)
    {
        $this->landing = $fly_status['landing'];
        $this->isStop = $fly_status['isStop'];
        $this->x = $fly_status['x'];
        $this->y = $fly_status['y'];
        $this->h = $fly_status['h'];
        $this->rX = $fly_status['rX'];
        $this->rY = $fly_status['rY'];
        $this->rZ = $fly_status['rZ'];
    }
}

/**
 * 每个飞机的基本信息
 */
class AirplaneCore
{
    public $keyName;
    public $typeName;
    public $updateTimestamp;
    public $status;
    public $cameraFront;
    public $cameraDown;
    public $image_receiver;

    public function __construct($keyName, $typeName, $updateTimestamp, $status, $cameraFront, $cameraDown)
    {
        $this->keyName = $keyName;
        $this->typeName = $typeName;
        $this->updateTimestamp = $updateTimestamp;
        $this->status = $status instanceof AirplaneFlyStatus ? $status : new AirplaneFlyStatus($status);
        $this->cameraFront = $cameraFront;
        $this->cameraDown = $cameraDown;
        $this->image_receiver = new ImageReceiverMook($this);
    }

    public function cap_image($user_receive_callback = null, $user_progress_callback = null)
    {
        $this->image_receiver->send_cap_image($user_receive_callback, $user_progress_callback);
    }

    public function get_image_transfer_progress()
    {
        return $this->image_receiver->get_transfer_progress();
    }

    public function is_image_transfer_in_progress()
    {
        return $this->image_receiver->is_transfer_in_progress();
    }

    public function get_latest_image()
    {
        return $this->image_receiver->get_latest_image();
    }

    public function get_camera_front_img()
    {
        return ImageProcess::read_b64_img(HttpLayer::get_airplane_camera_image($this->keyName, 'front'));
    }

    public function get_camera_down_img()
    {
        return ImageProcess::read_b64_img(HttpLayer::get_airplane_camera_image($this->keyName, 'down'));
    }
}
