<?php

namespace PhantasyIslandPhpRemoteControl\Radio;

/**
 * API 模块基类的 PHP 实现。
 * PHP 版本简化了异步和并发相关逻辑，主要关注同步和令牌模式。
 */
class ApiModule
{
    protected $rm;
    protected $now_mode = 'sync';
    protected $send_fn;

    public function __construct(RadioManager $rm)
    {
        $this->rm = $rm;
        $this->mode('sync');
    }

    /**
     * 切换发送模式。
     * @param string $mode 'sync' 或 'token'
     * @return $this
     */
    public function mode($mode)
    {
        if ($mode === 'sync') {
            $this->send_fn = [$this, 'sendAndWaitSync'];
            $this->now_mode = 'sync';
        } elseif ($mode === 'token') {
            $this->send_fn = [$this, 'sendAndWaitToken'];
            $this->now_mode = 'token';
        } else {
            throw new \InvalidArgumentException("Unsupported mode: $mode");
        }
        return $this;
    }

    public function getNowMode()
    {
        return $this->now_mode;
    }

    /**
     * 调用当前模式的发送方法。
     */
    protected function send($cmd, $data = null, $wait_cmd = null, $timeout = 3.0, $post_processor = null)
    {
        return call_user_func($this->send_fn, $cmd, $data, $wait_cmd, $timeout, $post_processor);
    }

    // ---- 代理 RadioManager 的底层发送方法 ----

    protected function _send($cmd, $data = null)
    {
        return $this->rm->_send($cmd, $data);
    }

    protected function sendAndWaitSync($cmd, $data = null, $wait_cmd = null, $timeout = 3.0, $post_processor = null)
    {
        return $this->rm->_send_and_wait_sync($cmd, $data, $wait_cmd, $timeout, $post_processor);
    }

    protected function sendAndWaitToken($cmd, $data = null, $wait_cmd = null, $post_processor = null)
    {
        return $this->rm->_send_and_wait_token($cmd, $data, $wait_cmd, $post_processor);
    }
}

/**
 * 类型窄化辅助函数的 PHP 版本。
 */
function as_sync($result)
{
    if ($result instanceof WaitToken) {
        throw new \TypeError("Expected sync result, got WaitToken.");
    }
    return $result;
}

function as_token($result)
{
    if (!($result instanceof WaitToken)) {
        throw new \TypeError("Expected WaitToken.");
    }
    return $result;
}
