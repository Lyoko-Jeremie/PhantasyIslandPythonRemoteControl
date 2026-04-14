require_relative 'wait_token'

# API 模块基类。
class ApiModule
  attr_accessor :rm, :now_mode

  def initialize(rm)
    @rm = rm
    @now_mode = 'sync'
    mode('sync')
  end

  # 切换发送模式并返回 self
  def mode(mode)
    case mode
    when 'sync'
      @send_fn = method(:_send_and_wait_sync)
      @now_mode = 'sync'
    when 'async', 'token'
      # Ruby 简单实现中，async 和 token 都返回 WaitToken
      @send_fn = method(:_send_and_wait_token)
      @now_mode = mode
    else
      raise ArgumentError, "Invalid mode: #{mode}"
    end
    self
  end

  def send(cmd, data = nil, wait_cmd: nil, timeout: 3.0, post_processor: nil)
    @send_fn.call(cmd, data, wait_cmd: wait_cmd, timeout: timeout, post_processor: post_processor)
  end

  # ---- 便捷代理 ----

  def _send(cmd, data = nil)
    @rm._send(cmd, data)
  end

  def _send_and_wait_sync(cmd, data = nil, wait_cmd: nil, timeout: 3.0, post_processor: nil)
    @rm._send_and_wait_sync(cmd, data, wait_cmd, timeout, post_processor: post_processor)
  end

  def _send_and_wait_token(cmd, data = nil, wait_cmd: nil, timeout: 3.0, post_processor: nil)
    # timeout 在 token 模式下通常在 .wait() 时指定，但为了 API 一致性保留
    @rm._send_and_wait_token(cmd, data, wait_cmd, post_processor: post_processor)
  end
end

# 类型窄化辅助函数 (Ruby 中主要是为了 API 兼容性，不具备静态检查能力)
def as_sync(result)
  raise TypeError, "Expected sync result, got WaitToken" if result.is_a?(WaitToken)
  result
end

def as_token(result)
  raise TypeError, "Expected WaitToken, got #{result.class}" unless result.is_a?(WaitToken)
  result
end

def as_awaitable(result)
  result # Ruby 简单实现中直接返回
end
