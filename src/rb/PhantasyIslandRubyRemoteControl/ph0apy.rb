require_relative 'airplane_manager'

# 此类是到FH0A库的适配器，是对AirplaneManager的wrapper
class FH0A
  def initialize
    @airs = get_airplane_manager
    @airs.flush
    @airs.start
    @airs.flush
  end

  # sleep 单位 秒
  def sleep(time)
    Kernel.sleep(time)
  end

  def destroy
  end

  # 添加（注册）无人机
  def add_uav(port)
    @airs.get_airplane(port)
  end

  def p(port)
    @airs.get_airplane(port)
  end

  # 降落
  def land(port)
    p(port).land
  end

  # 起飞到指定高度 单位cm
  def takeoff(port, high)
    p(port).takeoff(high)
  end

  # 上升指定距离 单位cm
  def up(port, distance)
    p(port).up(distance)
  end

  # 下降指定距离 单位cm
  def down(port, distance)
    p(port).down(distance)
  end

  # 前进指定距离 单位cm
  def forward(port, distance)
    p(port).forward(distance)
  end

  # 后退指定距离 单位cm
  def back(port, distance)
    p(port).back(distance)
  end

  # 左移指定距离 单位cm
  def left(port, distance)
    p(port).left(distance)
  end

  # 右移指定距离 单位cm
  def right(port, distance)
    p(port).right(distance)
  end

  # 移动到指定坐标处
  def goto(port, x, y, h)
    p(port).goto(x, y, h)
  end

  # flip函数用于控制无人机翻滚
  # @param direction 翻滚方向（f前 b后 l左 r右）
  def flip(port, direction)
    case direction
    when 'f'
      p(port).flip_forward
    when 'b'
      p(port).flip_back
    when 'r'
      p(port).flip_right
    when 'l'
      p(port).flip_left
    end
  end

  # 顺时旋转指定角度
  def rotate(port, degree)
    p(port).rotate(degree)
  end

  # 顺时针旋转指定角度
  def cw(port, degree)
    p(port).cw(degree)
  end

  # 逆时针旋转指定角度
  def ccw(port, degree)
    p(port).ccw(degree)
  end

  # 设置飞行速度
  def speed(port, speed)
    p(port).speed(speed)
  end

  # 移动到指定高度处
  def high(port, high)
    p(port).high(high)
  end

  # 设置无人机led色彩
  def led(port, r, g, b)
    p(port).led(r, g, b)
  end

  # 设置无人机led呼吸灯色彩
  def bln(port, r, g, b)
    p(port).bln(r, g, b)
  end

  # 设置无人机led彩虹色彩
  def rainbow(port, r, g, b)
    p(port).rainbow(r, g, b)
  end

  # 设置无人机飞行模式
  # @param mode 1常规2巡线3跟随4单机编队 通常情况下使用模式4
  def mode(port, mode)
    p(port).airplane_mode(mode)
  end

  def color_detect(port, l_l, l_h, a_l, a_h, b_l, b_h)
  end

  def vision_mode(port, mode)
  end

  # 停桨
  def stop(port)
    p(port).stop
  end

  # 悬停
  def hover(port)
    p(port).hover
  end
end
