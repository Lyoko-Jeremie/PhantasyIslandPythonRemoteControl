<?php

namespace PhantasyIslandPhpRemoteControl;

/**
 * 这个文件是 PhantasyIslandPythonRemoteControl 库与仿真平台的核心通信协议部分的 PHP 实现
 */
class HttpLayer
{
    public static function ping()
    {
        return self::send_cmd('ping');
    }

    public static function ping_volatile()
    {
        return self::send_cmd_volatile('ping');
    }

    public static function start()
    {
        return self::send_cmd('start');
    }

    public static function start_volatile()
    {
        return self::send_cmd_volatile('start');
    }

    public static function send_cmd($s)
    {
        $url = 'http://' . Config::$remote_location . '/ECU_HTTP/sendStringCmd?c=' . urlencode($s);
        return self::http_get($url, "send_cmd $s");
    }

    public static function send_cmd_volatile($s)
    {
        $url = 'http://' . Config::$remote_location . '/ECU_HTTP/sendStringCmd?cc=' . urlencode($s);
        return self::http_get($url, "send_cmd_volatile $s");
    }

    public static function get_all_airplane_status()
    {
        $url = 'http://' . Config::$remote_location . '/ECU_HTTP/requestPullAllAirplaneState';
        $result = self::http_get($url, "get_all_airplane_status", 5);
        if ($result === null) {
            throw new \Exception('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.');
        }
        return $result;
    }

    public static function get_airplane_camera_image($port, $camera)
    {
        $url = 'http://' . Config::$remote_location . '/ECU_HTTP/requestPullImage?flyPort=' . $port . '&imageType=' . $camera;
        $j = self::http_get($url, "get_airplane_camera_image", 5);
        if ($j && isset($j['ok']) && $j['ok'] === true) {
            return $j['imgDataString'];
        }
        return null;
    }

    private static function http_get($url, $context_name, $timeout = 10)
    {
        $options = [
            'http' => [
                'method' => "GET",
                'header' => "Accept-language: en\r\n",
                'timeout' => $timeout
            ]
        ];
        $context = stream_context_create($options);
        try {
            $response = @file_get_contents($url, false, $context);
            if ($response === false) {
                error_log("$context_name Error ConnectionError Cannot Connect to PhantasyIsland");
                return ['ok' => false, 'r' => 'ConnectionError Cannot Connect to PhantasyIsland'];
            }
            return json_decode($response, true);
        } catch (\Exception $e) {
            error_log("$context_name Error " . $e->getMessage());
            return ['ok' => false, 'r' => $e->getMessage()];
        }
    }

    public static function process_airplane($j)
    {
        if ($j && isset($j['ok']) && $j['ok'] === true) {
            $airplanes = $j['airplanes'];
            $airplaneStatus = [];
            foreach ($airplanes as $air) {
                $status = [];
                $status['keyName'] = $air['keyName'];
                $status['typeName'] = $air['typeName'];
                $status['updateTimestamp'] = $air['updateTimestamp'];
                $status['status'] = $air['status'];
                
                $camera_front = $air['cameraFront'];
                $status['cameraFront'] = $camera_front['imgDataString'] ?? null;
                
                $camera_down = $air['cameraDown'];
                $status['cameraDown'] = $camera_down['imgDataString'] ?? null;
                
                $airplaneStatus[$status['keyName']] = $status;
            }
            return $airplaneStatus;
        }
        return null;
    }
}
