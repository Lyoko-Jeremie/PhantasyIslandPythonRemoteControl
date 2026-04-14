<?php

namespace PhantasyIslandPhpRemoteControl;

/**
 * 此类是到 UAV 库的适配器，是对AirplaneManager的wrapper
 */
class UAV
{
    /** @var AirplaneManager */
    public $airs;

    public function __construct()
    {
        $this->airs = AirplaneManager::getInstance();
        $this->airs->flush();
        $this->airs->start();
        $this->airs->flush();
    }

    public function sleep($time)
    {
        $this->airs->sleep($time);
    }

    public function destroy()
    {
        // 销毁逻辑
    }

    public function add_uav($port)
    {
        return $this->airs->get_airplane($port);
    }

    public function p($port)
    {
        return $this->airs->get_airplane($port);
    }

    public function land($port)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->land();
    }

    public function emergency($port)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->stop();
    }

    public function takeoff($port, $high)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->takeoff($high);
    }

    public function up($port, $distance)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->up($distance);
    }

    public function down($port, $distance)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->down($distance);
    }

    public function forward($port, $distance)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->forward($distance);
    }

    public function back($port, $distance)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->back($distance);
    }

    public function left($port, $distance)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->left($distance);
    }

    public function right($port, $distance)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->right($distance);
    }

    public function goto($port, $x, $y, $h)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->goto($x, $y, $h);
    }

    public function flip($port, $direction)
    {
        $airplane = $this->p($port);
        if (!$airplane) return;
        
        switch ($direction) {
            case 'f': $airplane->flip_forward(); break;
            case 'b': $airplane->flip_back(); break;
            case 'r': $airplane->flip_right(); break;
            case 'l': $airplane->flip_left(); break;
        }
    }

    public function rotate($port, $degree)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->rotate($degree);
    }

    public function cw($port, $degree)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->cw($degree);
    }

    public function ccw($port, $degree)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->ccw($degree);
    }

    public function speed($port, $speed)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->speed($speed);
    }

    public function high($port, $high)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->high($high);
    }

    public function led($port, $r, $g, $b)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->led($r, $g, $b);
    }

    public function bln($port, $r, $g, $b)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->bln($r, $g, $b);
    }

    public function rainbow($port, $r, $g, $b)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->rainbow($r, $g, $b);
    }

    public function mode($port, $mode)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->airplane_mode($mode);
    }

    public function stop($port)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->stop();
    }

    public function hover($port)
    {
        $airplane = $this->p($port);
        if ($airplane) $airplane->hover();
    }
}
