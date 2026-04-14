<?php

namespace PhantasyIslandPhpRemoteControl;

class ImageInfo
{
    public $img;
    public $id;
    public $total_count;
    public $progress_count = 0;
    public $ok = false;

    public function __construct($img, $id, $total_count)
    {
        $this->img = $img;
        $this->id = $id;
        $this->total_count = $total_count;
    }
}

class ImageReceiverMook
{
    public $airplane;
    public $image_instance = null;
    private $cmd_id_counter = 1;
    public $now_loading_id = 0;
    
    public $user_receive_callback = null;
    public $user_progress_callback = null;
    public $mook_time = 3;

    public function __construct($airplane)
    {
        $this->airplane = $airplane;
    }

    /**
     * PHP 不支持标准多线程，此处的实现在调用时会进行模拟（同步模拟或仅初始化）
     */
    public function send_cap_image($user_receive_callback = null, $user_progress_callback = null)
    {
        $this->user_receive_callback = $user_receive_callback;
        $this->user_progress_callback = $user_progress_callback;

        $this->cmd_id_counter++;
        $this->now_loading_id = $this->cmd_id_counter;
        
        $this->image_instance = new ImageInfo(
            $this->airplane->get_camera_down_img(),
            $this->cmd_id_counter,
            $this->mook_time * 10
        );

        // 模拟进度（在 PHP 中这里通常是同步的，除非使用特殊扩展）
        for ($i = 0; $i <= $this->image_instance->total_count; $i++) {
            $this->image_instance->progress_count = $i;
            if ($this->user_progress_callback) {
                call_user_func($this->user_progress_callback, $i, $this->image_instance->total_count);
            }
            // usleep(10000); // 10ms
        }

        $this->image_instance->ok = true;
        if ($this->user_receive_callback) {
            call_user_func($this->user_receive_callback, $this->image_instance->img);
        }
    }

    public function get_latest_image()
    {
        if ($this->image_instance && $this->image_instance->ok) {
            return $this->image_instance->img;
        }
        return null;
    }

    public function get_transfer_progress()
    {
        return $this->image_instance ? $this->image_instance->progress_count : null;
    }

    public function is_transfer_in_progress()
    {
        return $this->image_instance ? !$this->image_instance->ok : false;
    }
}
