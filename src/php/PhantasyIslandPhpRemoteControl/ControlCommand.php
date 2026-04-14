<?php

namespace PhantasyIslandPhpRemoteControl;

/**
 * 无人机控制
 * 此类包含控制单个无人机的所有指令
 */
class AirplaneController extends AirplaneCore
{
    public $count = 1;

    public $send_cmd_fn = [HttpLayer::class, 'send_cmd'];

    public function use_fast_mode($fast_mode = true)
    {
        if ($fast_mode) {
            $this->send_cmd_fn = [HttpLayer::class, 'send_cmd_volatile'];
        } else {
            $this->send_cmd_fn = [HttpLayer::class, 'send_cmd'];
        }
    }

    private function next_count()
    {
        $this->count += 2;
        return $this->count;
    }

    private function prepare_command($command)
    {
        return $this->keyName . ' ' . $this->next_count() . ' ' . $command;
    }

    protected function _send_cmd($command)
    {
        return call_user_func($this->send_cmd_fn, $this->prepare_command($command));
    }

    public function mode($mode)
    {
        $this->airplane_mode($mode);
    }

    public function takeoff($high)
    {
        return $this->_send_cmd("takeoff $high");
    }

    public function land()
    {
        return $this->_send_cmd("land");
    }

    public function emergency()
    {
        return $this->_send_cmd("emergency");
    }

    public function up($distance)
    {
        return $this->_send_cmd("up $distance");
    }

    public function down($distance)
    {
        return $this->_send_cmd("down $distance");
    }

    public function forward($distance)
    {
        return $this->_send_cmd("forward $distance");
    }

    public function back($distance)
    {
        return $this->_send_cmd("back $distance");
    }

    public function left($distance)
    {
        return $this->_send_cmd("left $distance");
    }

    public function right($distance)
    {
        return $this->_send_cmd("right $distance");
    }

    public function goto($x, $y, $h)
    {
        return $this->_send_cmd("goto $x $y $h");
    }

    public function flip($direction)
    {
        return $this->_send_cmd("flip $direction 1");
    }

    public function flip_forward()
    {
        $this->flip("f");
    }

    public function flip_back()
    {
        $this->flip("b");
    }

    public function flip_left()
    {
        $this->flip("l");
    }

    public function flip_right()
    {
        $this->flip("r");
    }

    public function rotate($degree)
    {
        return $this->_send_cmd("rotate $degree");
    }

    public function cw($degree)
    {
        return $this->_send_cmd("cw $degree");
    }

    public function ccw($degree)
    {
        return $this->_send_cmd("ccw $degree");
    }

    public function high($high)
    {
        return $this->_send_cmd("high $high");
    }

    public function speed($speed)
    {
        return $this->_send_cmd("setSpeed $speed");
    }

    public function led($r, $g, $b)
    {
        return $this->_send_cmd("light $r $g $b");
    }

    public function bln($r, $g, $b)
    {
        return $this->_send_cmd("bln $r $g $b");
    }

    public function rainbow($r, $g, $b)
    {
        return $this->_send_cmd("rainbow $r $g $b");
    }

    public function airplane_mode($mode)
    {
        return $this->_send_cmd("airplane_mode $mode");
    }

    public function stop()
    {
        return $this->hover();
    }

    public function hover()
    {
        return $this->_send_cmd("hover");
    }
}
