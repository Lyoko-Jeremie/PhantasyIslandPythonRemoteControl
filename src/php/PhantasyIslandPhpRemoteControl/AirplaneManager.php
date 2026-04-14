<?php

namespace PhantasyIslandPhpRemoteControl;

/**
 * 管理并更新所有飞机状态的管理器
 */
class AirplaneManager
{
    private static $instance = null;
    public $airplanes_table = [];

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new AirplaneManager();
        }
        return self::$instance;
    }

    public function ping()
    {
        return HttpLayer::ping();
    }

    public function ping_volatile()
    {
        return HttpLayer::ping_volatile();
    }

    public function start()
    {
        return HttpLayer::start();
    }

    public function start_volatile()
    {
        return HttpLayer::start_volatile();
    }

    public function get_airplane($id)
    {
        return $this->airplanes_table[$id] ?? null;
    }

    public function sleep($time)
    {
        if ($time < 1) {
            usleep($time * 1000000);
        } else {
            sleep($time);
        }
    }

    public function flush()
    {
        $status_data = HttpLayer::get_all_airplane_status();
        $airplane_status = HttpLayer::process_airplane($status_data);
        
        if ($airplane_status !== null) {
            foreach ($airplane_status as $k => $status) {
                if (!isset($this->airplanes_table[$k])) {
                    $this->airplanes_table[$k] = new AirplaneController(
                        $status['keyName'],
                        $status['typeName'],
                        $status['updateTimestamp'],
                        $status['status'],
                        $status['cameraFront'],
                        $status['cameraDown']
                    );
                } else {
                    $a = $this->airplanes_table[$k];
                    $a->keyName = $status['keyName'];
                    $a->typeName = $status['typeName'];
                    $a->updateTimestamp = $status['updateTimestamp'];
                    $a->status = new AirplaneFlyStatus($status['status']);
                    $a->cameraFront = $status['cameraFront'];
                    $a->cameraDown = $status['cameraDown'];
                }
            }
        }
        return $airplane_status;
    }
}

function get_airplane_manager()
{
    return AirplaneManager::getInstance();
}
