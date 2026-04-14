<?php

namespace PhantasyIslandPhpRemoteControl\Radio;

/**
 * 轻量级的请求-响应等待令牌的 PHP 实现。
 * PHP 不原生支持多线程等待，此处的 wait 采用轮询模拟。
 */
class WaitToken
{
    public $wait_cmd;
    public $time_base_id;
    public $response = null;
    public $processed_response = null;
    
    private $is_done = false;
    private $post_processor = null;

    public function __construct($wait_cmd, $time_base_id)
    {
        $this->wait_cmd = $wait_cmd;
        $this->time_base_id = $time_base_id;
    }

    public function isDone()
    {
        return $this->is_done;
    }

    public function setPostProcessor(callable $processor)
    {
        $this->post_processor = $processor;
        return $this;
    }

    private function applyPostProcessor($data)
    {
        if ($this->post_processor !== null) {
            $result = call_user_func($this->post_processor, $data);
        } else {
            $result = $data;
        }
        $this->processed_response = $result;
        return $result;
    }

    /**
     * 由 RadioManager 在收到消息时调用。
     */
    public function complete($data)
    {
        $this->response = $data;
        $this->applyPostProcessor($data);
        $this->is_done = true;
    }

    /**
     * 阻塞当前进程直到收到响应或超时（轮询实现）。
     * @param float $timeout 超时秒数
     * @return mixed|null 后处理结果，超时返回 null
     */
    public function wait($timeout = 3.0)
    {
        $start = microtime(true);
        while (!$this->is_done) {
            if (microtime(true) - $start > $timeout) {
                return null;
            }
            // 在实际使用中，这里需要某种方式让 Socket.IO 客户端有机会处理入站消息
            // 例如：$this->rm->socket->work();
            usleep(10000); // 10ms
        }
        return $this->processed_response;
    }
}
