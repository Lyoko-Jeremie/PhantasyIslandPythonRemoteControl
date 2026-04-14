require_relative 'airplane_manager'

# 此类是到 UAV 库的适配器，是对AirplaneManager的wrapper
class UAV
  def initialize
    @airs = get_airplane_manager
    @airs.flush
    @airs.start
    @airs.flush
  end

  def sleep(time)
    Kernel.sleep(time)
  end

  def destroy
  end

  def add_uav(port)
    @airs.get_airplane(port)
  end

  def p(port)
    @airs.get_airplane(port)
  end

  def land(port)
    p(port).land
  end

  def emergency(port)
    p(port).stop
  end

  def takeoff(port, high)
    p(port).takeoff(high)
  end

  def up(port, distance)
    p(port).up(distance)
  end

  def down(port, distance)
    p(port).down(distance)
  end

  def forward(port, distance)
    p(port).forward(distance)
  end

  def back(port, distance)
    p(port).back(distance)
  end

  def left(port, distance)
    p(port).left(distance)
  end

  def right(port, distance)
    p(port).right(distance)
  end

  def goto(port, x, y, h)
    p(port).goto(x, y, h)
  end

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

  def rotate(port, degree)
    p(port).rotate(degree)
  end

  def cw(port, degree)
    p(port).cw(degree)
  end

  def ccw(port, degree)
    p(port).ccw(degree)
  end

  def speed(port, speed)
    p(port).speed(speed)
  end

  def high(port, high)
    p(port).high(high)
  end

  def led(port, r, g, b)
    p(port).led(r, g, b)
  end

  def bln(port, r, g, b)
    p(port).bln(r, g, b)
  end

  def rainbow(port, r, g, b)
    p(port).rainbow(r, g, b)
  end

  def mode(port, mode)
    p(port).airplane_mode(mode)
  end

  def stop(port)
    p(port).stop
  end

  def hover(port)
    p(port).hover
  end
end
