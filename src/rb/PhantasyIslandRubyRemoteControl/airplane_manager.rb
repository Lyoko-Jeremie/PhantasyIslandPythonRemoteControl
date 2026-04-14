require_relative 'airplane_core'
require_relative 'control_command'
require_relative 'http_layer'

# 管理并更新所有飞机状态的管理器
class AirplaneManager
  attr_accessor :airplanes_table

  def initialize
    @airplanes_table = {}
  end

  # 测试与仿真平台的连接状态
  def ping
    HttpLayer.ping
  end

  def ping_volatile
    HttpLayer.ping_volatile
  end

  # 向仿真场景发出开始仿真指令
  def start
    HttpLayer.start
  end

  def start_volatile
    HttpLayer.start_volatile
  end

  # 获取指定无人机
  def get_airplane(id)
    @airplanes_table[id]
  end

  def sleep(time)
    Kernel.sleep(time)
  end

  # 更新当前管理器所管理的所有飞机的状态
  def flush
    airplane_status = HttpLayer.process_airplane(HttpLayer.get_all_airplane_status)
    if airplane_status
      airplane_status.each do |k, status|
        if @airplanes_table[k].nil?
          @airplanes_table[k] = AirplaneController.new(
            keyName: status['keyName'],
            typeName: status['typeName'],
            updateTimestamp: status['updateTimestamp'],
            status: AirplaneFlyStatus.from_h(status['status']),
            cameraFront: status['cameraFront'],
            cameraDown: status['cameraDown']
          )
        else
          a = @airplanes_table[k]
          a.keyName = status['keyName']
          a.typeName = status['typeName']
          a.updateTimestamp = status['updateTimestamp']
          a.status = AirplaneFlyStatus.from_h(status['status'])
          a.cameraFront = status['cameraFront']
          a.cameraDown = status['cameraDown']
        end
      end
    else
      nil
    end
  end
end

# 单例模式
$airplane_manager_singleton = AirplaneManager.new

# 获取AirplaneManager单例对象
def get_airplane_manager
  $airplane_manager_singleton
end
