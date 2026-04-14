require 'thread'

# 轻量级的请求-响应等待令牌。
class WaitToken
  attr_accessor :wait_cmd, :time_base_id, :response, :processed_response

  def initialize(wait_cmd, time_base_id)
    @wait_cmd = wait_cmd
    @time_base_id = time_base_id
    @response = nil
    @processed_response = nil
    @event = ConditionVariable.new
    @mutex = Mutex.new
    @done = false
    @post_processor = nil
  end

  # 令牌是否已收到响应。
  def done?
    @mutex.synchronize { @done }
  end

  # 注册后处理回调。
  def set_post_processor(processor)
    @post_processor = processor
    self
  end

  def apply_post_processor(data)
    if @post_processor
      result = @post_processor.call(data)
    else
      result = data
    end
    @processed_response = result
    result
  end

  # 填充响应并唤醒等待者。
  def complete(data)
    @mutex.synchronize do
      @response = data
      apply_post_processor(data)
      @done = true
      @event.broadcast
    end
  end

  # 阻塞当前线程直到收到响应或超时。
  def wait(timeout = 3.0)
    @mutex.synchronize do
      if !@done
        @event.wait(@mutex, timeout)
      end
      return nil if @response.nil?
      @processed_response
    end
  end

  # Ruby 中没有直接的 await 支持（除非使用异步库），这里提供一个类似接口
  def wait_async(timeout = 3.0)
    wait(timeout)
  end

  def inspect
    status = done? ? 'done' : 'pending'
    "#<WaitToken cmd=#{@wait_cmd.inspect} #{status}>"
  end
end
