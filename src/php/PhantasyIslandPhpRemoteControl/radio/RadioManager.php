<?php

namespace PhantasyIslandPhpRemoteControl\Radio;

/**
 * RadioManager 的 PHP 实现。
 * 注：PHP 标准环境不支持异步，Socket.IO 通信通常使用第三方库如 Elephant.io。
 * 这里提供接口和逻辑骨架。
 */
class RadioManager
{
    public $socket = null; // 假设使用的 Socket.IO 客户端实例
    public $namespace = '/UserSide';
    public $scene_is_init = false;

    /** @var DebugApi */
    public $debugApi;
    /** @var SceneApi */
    public $sceneApi;
    /** @var FlyApi */
    public $flyApi;
    /** @var RadioApi */
    public $radioApi;

    // wait_cmd -> [WaitToken, ...]
    private $pending_waiters = [];

    public function __construct()
    {
        // 初始化 Sub-API 模块
        $this->debugApi = new DebugApi($this);
        $this->sceneApi = new SceneApi($this);
        $this->flyApi = new FlyApi($this);
        $this->radioApi = new RadioApi($this);
    }

    public function create_msg_timestamp_id()
    {
        return floor(microtime(true) * 1000 * 100);
    }

    public function connect($url = 'http://127.0.0.1:60002', $namespace = '/UserSide')
    {
        $this->namespace = $namespace;
        // 在此处初始化 Socket.IO 连接并设置回调
        // $this->socket = new Client($url);
        // $this->socket->on('message', [$this, 'msg_dispatch']);
        // $this->socket->connect();
        $this->check_scene_status();
    }

    private function check_scene_status()
    {
        $this->_send('ping');
        $this->_send('scene.getInitState');
    }

    public function ping()
    {
        return $this->_send_and_wait_sync('ping', null, 'pong');
    }

    /**
     * 底层发送
     */
    public function _send($cmd, $data = null)
    {
        $msg = ['cmd' => $cmd];
        if ($data) {
            $msg = array_merge($msg, $data);
        }
        // $this->socket->emit('message', $msg, $this->namespace);
    }

    /**
     * 发送并返回令牌
     */
    public function _send_with_token($cmd, $data = null, $wait_cmd = null, $post_processor = null)
    {
        if ($wait_cmd === null) {
            $wait_cmd = $cmd;
        }

        $time_base_id = $this->create_msg_timestamp_id();
        $token = new WaitToken($wait_cmd, $time_base_id);
        if ($post_processor !== null) {
            $token->setPostProcessor($post_processor);
        }

        // 注册等待者
        $this->pending_waiters[$wait_cmd][] = $token;

        $msg = ['timestampIdPython' => $time_base_id];
        if ($data) {
            foreach ($data as $k => $v) {
                if ($v !== null) $msg[$k] = $v;
            }
        }

        $this->_send($cmd, $msg);
        return $token;
    }

    public function _send_and_wait_sync($cmd, $data = null, $wait_cmd = null, $timeout = 3.0, $post_processor = null)
    {
        $token = $this->_send_with_token($cmd, $data, $wait_cmd, $post_processor);
        return $token->wait($timeout);
    }

    public function _send_and_wait_token($cmd, $data = null, $wait_cmd = null, $post_processor = null)
    {
        return $this->_send_with_token($cmd, $data, $wait_cmd, $post_processor);
    }

    /**
     * 消息分发，应由 Socket.IO 监听器调用。
     */
    public function msg_dispatch($data)
    {
        $cmd = $data['cmd'] ?? null;
        if ($this->notify_waiters($cmd, $data)) {
            return;
        }

        switch ($cmd) {
            case 'pong': break;
            case 'sceneReset':
            case 'sceneNotInit':
                $this->scene_is_init = false;
                break;
            case 'sceneInit':
            case 'sceneIsInit':
                $this->scene_is_init = true;
                break;
        }
    }

    private function notify_waiters($cmd, $data)
    {
        $timestamp_id = $data['timestampIdPython'] ?? null;
        if (!isset($this->pending_waiters[$cmd])) {
            return false;
        }

        $matched = false;
        $surviving = [];
        foreach ($this->pending_waiters[$cmd] as $token) {
            if (!$matched && $timestamp_id !== null && $token->time_base_id == $timestamp_id) {
                $token->complete($data);
                $matched = true;
            } else {
                $surviving[] = $token;
            }
        }

        if (empty($surviving)) {
            unset($this->pending_waiters[$cmd]);
        } else {
            $this->pending_waiters[$cmd] = $surviving;
        }

        return $matched;
    }
}
