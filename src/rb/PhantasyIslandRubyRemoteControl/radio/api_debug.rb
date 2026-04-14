require_relative 'api_module'

class DebugApi < ApiModule
  # Ping 远端，等待 pong 回复。
  def ping
    send('ping', wait_cmd: 'pong')
  end
end
