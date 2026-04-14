require 'socket.io-client-simple'
require 'thread'
require 'weakref'

require_relative 'wait_token'
require_relative 'api_debug'
require_relative 'api_scene'
require_relative 'api_fly'
require_relative 'api_radio'

class RadioManager
  attr_accessor :socket, :namespace, :scene_is_init
  attr_accessor :debugApi, :sceneApi, :flyApi, :radioApi

  def initialize
    @namespace = '/UserSide'
    @scene_is_init = false
    @pending_waiters = {} # wait_cmd -> Array of WeakRef
    @waiters_lock = Mutex.new

    # 初始化 Sub-API 模块
    @debugApi = DebugApi.new(self)
    @sceneApi = SceneApi.new(self)
    @flyApi = FlyApi.new(self)
    @radioApi = RadioApi.new(self)
  end

  def create_msg_timestamp_id
    (Time.now.to_f * 1000 * 100).to_i
  end

  def connect(url = 'http://127.0.0.1:60002', namespace = '/UserSide')
    @namespace = namespace
    reset
    
    # 使用 socket.io-client-simple 库
    # 注意：Ruby 的 socket.io 客户端库可能需要根据实际可用库进行调整
    @socket = SocketIO::Client::Simple.connect(url)
    _init_listener
  end

  def reset
    if @socket && @socket.connected?
      @socket.disconnect
    end
    @scene_is_init = false
  end

  def _init_listener
    rm = self
    @socket.on :connect do
      puts '[RadioManager] connected'
      rm._check_scene_status
    end

    @socket.on :disconnect do
      puts '[RadioManager] disconnected'
      rm.scene_is_init = false
    end

    @socket.on :message do |data|
      # 假设 data 是解析后的 Hash。如果不是，可能需要 JSON.parse(data)
      puts "[RadioManager] message: #{data}"
      rm.msg_dispatch(data)
    end

    @socket.on :error do |err|
      puts "[RadioManager] error: #{err}"
    end
  end

  def _check_scene_status
    _send('ping')
    _send('scene.getInitState')
  end

  def ping
    _send_and_wait_sync('ping', wait_cmd: 'pong')
  end

  def _send(cmd, data = nil)
    msg = { 'cmd' => cmd }
    msg.merge!(data) if data
    # 在 socket.io-client-simple 中，通常使用 emit
    @socket.emit :message, msg
  end

  # ---- 请求-响应: 核心 ----

  def _send_with_token(cmd, data = nil, wait_cmd: nil, post_processor: nil)
    wait_cmd ||= cmd
    time_base_id = create_msg_timestamp_id
    token = WaitToken.new(wait_cmd, time_base_id)
    token.set_post_processor(post_processor) if post_processor

    # 注册弱引用
    ref = WeakRef.new(token)
    @waiters_lock.synchronize do
      @pending_waiters[wait_cmd] ||= []
      @pending_waiters[wait_cmd] << ref
    end

    msg = { 'timestampIdPython' => time_base_id }
    msg.merge!(data) if data
    # 移除 nil 字段
    msg.delete_if { |k, v| v.nil? }

    _send(cmd, msg)
    token
  end

  # ---- 请求-响应: 便捷方法 ----

  def _send_and_wait_sync(cmd, data = nil, wait_cmd = nil, timeout = 3.0, post_processor: nil)
    token = _send_with_token(cmd, data, wait_cmd: wait_cmd, post_processor: post_processor)
    token.wait(timeout)
  end

  def _send_and_wait_token(cmd, data = nil, wait_cmd = nil, post_processor: nil)
    _send_with_token(cmd, data, wait_cmd: wait_cmd, post_processor: post_processor)
  end

  # Ruby 中简单的异步等待可以用线程模拟，或者直接返回 token
  def _send_and_wait_async(cmd, data = nil, wait_cmd = nil, timeout = 3.0, post_processor: nil)
    _send_with_token(cmd, data, wait_cmd: wait_cmd, post_processor: post_processor)
  end

  # ---- 弱引用分发 ----

  def _notify_waiters(cmd, data)
    timestamp_id = data['timestampIdPython']
    return false if timestamp_id.nil?

    @waiters_lock.synchronize do
      refs = @pending_waiters[cmd]
      return false if refs.nil? || refs.empty?

      surviving = []
      matched = false
      refs.each do |ref|
        begin
          token = ref.__getobj__
          if !matched && token.time_base_id == timestamp_id
            token.complete(data)
            matched = true
          else
            surviving << ref
          end
        rescue WeakRef::RefError
          # 已被回收
          next
        end
      end

      if surviving.empty?
        @pending_waiters.delete(cmd)
      else
        @pending_waiters[cmd] = surviving
      end
      matched
    end
  end

  def msg_dispatch(data)
    cmd = data['cmd']
    return if cmd.nil?

    if _notify_waiters(cmd, data)
      return
    end

    case cmd
    when 'pong'
      # ignore
    when 'sceneReset', 'sceneNotInit'
      _on_scene_reset(data)
    when 'sceneInit', 'sceneIsInit'
      _on_scene_init(data)
    else
      puts "[RadioManager] unknown cmd: #{cmd}, data: #{data}"
    end
  end

  def _on_scene_reset(data)
    puts "[RadioManager] handle sceneReset: #{data}"
    @scene_is_init = false
  end

  def _on_scene_init(data)
    puts "[RadioManager] handle sceneInit: #{data}"
    @scene_is_init = true
  end
end
