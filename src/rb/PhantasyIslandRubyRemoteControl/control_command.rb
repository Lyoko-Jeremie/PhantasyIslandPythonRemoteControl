require 'concurrent'
require_relative 'airplane_core'
require_relative 'http_layer'

# 无人机控制
# 此类包含控制单个无人机的所有指令
class AirplaneController < AirplaneCore
  attr_accessor :count

  # Ruby 中没有 staticmethod 关键字，直接在类中定义或使用类变量
  @executor = Concurrent::FixedThreadPool.new(10)

  def initialize(**args)
    super(**args)
    @count = 1
    @send_cmd_fn = method(:send_cmd_sync)
  end

  def send_cmd_sync(s)
    HttpLayer.send_cmd(s)
  end

  def send_cmd_volatile_sync(s)
    HttpLayer.send_cmd_volatile(s)
  end

  # 设置命令是否使用非阻塞模式
  # 
  # 同步阻塞模式（默认）：use_fast_mode(fast_mode: false, future_mode: false)
  # 同步非阻塞模式：use_fast_mode(fast_mode: true, future_mode: false)
  # 异步模式：use_fast_mode(fast_mode: false, future_mode: true)
  def use_fast_mode(fast_mode: true, future_mode: true)
    if !future_mode
      if fast_mode
        @send_cmd_fn = method(:send_cmd_volatile_sync)
      else
        @send_cmd_fn = method(:send_cmd_sync)
      end
    else
      executor = self.class.instance_variable_get(:@executor)
      if fast_mode
        @send_cmd_fn = ->(s) { Concurrent::Future.execute(executor: executor) { HttpLayer.send_cmd_volatile(s) } }
      else
        @send_cmd_fn = ->(s) { Concurrent::Future.execute(executor: executor) { HttpLayer.send_cmd(s) } }
      end
    end
  end

  def next_count
    @count += 2
    @count
  end

  def prepare_command(command)
    "#{@keyName} #{next_count} #{command}"
  end

  def _send_cmd(command)
    @send_cmd_fn.call(prepare_command(command))
  end

  # 控制无人机飞行模式
  # 在 goto 命令之前传 mode 4
  def mode(mode)
    airplane_mode(mode)
  end

  # 控制无人机起飞
  def takeoff(high)
    _send_cmd("takeoff #{high}")
  end

  def land
    _send_cmd("land")
  end

  def emergency
    _send_cmd("emergency")
  end

  def up(distance)
    _send_cmd("up #{distance}")
  end

  def down(distance)
    _send_cmd("down #{distance}")
  end

  def forward(distance)
    _send_cmd("forward #{distance}")
  end

  def back(distance)
    _send_cmd("back #{distance}")
  end

  def left(distance)
    _send_cmd("left #{distance}")
  end

  def right(distance)
    _send_cmd("right #{distance}")
  end

  def goto(x, y, h)
    _send_cmd("goto #{x} #{y} #{h}")
  end

  def flip(direction)
    _send_cmd("flip #{direction} 1")
  end

  def flip_forward
    flip("f")
  end

  def flip_back
    flip("b")
  end

  def flip_left
    flip("l")
  end

  def flip_right
    flip("r")
  end

  def rotate(degree)
    _send_cmd("rotate #{degree}")
  end

  def cw(degree)
    _send_cmd("cw #{degree}")
  end

  def ccw(degree)
    _send_cmd("ccw #{degree}")
  end

  def high(high)
    _send_cmd("high #{high}")
  end

  def speed(speed)
    _send_cmd("setSpeed #{speed}")
  end

  def led(r, g, b)
    _send_cmd("light #{r} #{g} #{b}")
  end

  def bln(r, g, b)
    _send_cmd("bln #{r} #{g} #{b}")
  end

  def rainbow(r, g, b)
    _send_cmd("rainbow #{r} #{g} #{b}")
  end

  def airplane_mode(mode)
    _send_cmd("airplane_mode #{mode}")
  end

  def stop
    hover
  end

  def hover
    _send_cmd("hover")
  end
end
