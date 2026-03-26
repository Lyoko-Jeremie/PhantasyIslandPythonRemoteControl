import concurrent.futures
from .airplane_core import AirplaneCore
from .http_layer import send_cmd, send_cmd_volatile


class AirplaneController(AirplaneCore):
    """
    无人机控制
    此类包含控制单个无人机的所有指令
    """
    count: int = 1

    _send_cmd_fn = staticmethod(send_cmd)

    _executor = concurrent.futures.ThreadPoolExecutor(max_workers=10)

    def use_fast_mode(self, fast_mode=True, future_mode=True):
        """
        是否使用非阻塞模式
        :return:
        """
        if not future_mode:
            if fast_mode:
                # https://stackoverflow.com/questions/55527175/how-do-i-remove-implicit-passing-of-self-in-python-class
                self._send_cmd_fn = staticmethod(send_cmd_volatile)
            else:
                self._send_cmd_fn = staticmethod(send_cmd)
            pass
        else:
            if fast_mode:
                self._send_cmd_fn = lambda s: self._executor.submit(send_cmd_volatile, s)
            else:
                self._send_cmd_fn = lambda s: self._executor.submit(send_cmd, s)

    def _next_count(self):
        self.count = self.count + 2
        return self.count

    def _prepare_command(self, command: str) -> str:
        return self.keyName + ' ' + str(self._next_count()) + ' ' + command

    def _send_cmd(self, command: str) -> str:
        f = self._send_cmd_fn
        return f(self._prepare_command(command))

    def mode(self, mode: int):
        """
        控制无人机飞行模式
        :param mode: 1,2,3,4
        :return:
        """
        self.airplane_mode(mode)
        pass

    def takeoff(self, high: int):
        """
        控制无人机起飞
        :param high: 起飞到指定高度
        :return:
        """
        return self._send_cmd(f"takeoff {high}")

    def land(self):
        """
        控制无人机降落
        """
        return self._send_cmd(f"land")

    def emergency(self):
        """停桨"""
        return self._send_cmd(f"emergency")

    def up(self, distance: int):
        """
        向上移动
        :param distance:移动距离（厘米）
        """
        return self._send_cmd(f"up {distance}")

    def down(self, distance: int):
        """
        向下移动
        :param distance:移动距离（厘米）
        """
        return self._send_cmd(f"down {distance}")

    def forward(self, distance: int):
        """
        The forward function moves the drone forward by a specified distance (meters).

        向前移动
        :param distance:移动距离（厘米）

        :param self: Access variables that belongs to the class
        :param distance:int: Specify the distance to move
        :return: The string &quot;ok&quot; if the command was successful
        :doc-author: Jeremie
        """
        return self._send_cmd(f"forward {distance}")

    def back(self, distance: int):
        """
        向后移动
        :param distance:移动距离（厘米）
        """
        return self._send_cmd(f"back {distance}")

    def left(self, distance: int):
        """
        向左移动
        :param distance:移动距离（厘米）
        """
        return self._send_cmd(f"left {distance}")

    def right(self, distance: int):
        """
        向右移动
        :param distance:移动距离（厘米）
        """
        return self._send_cmd(f"right {distance}")

    def goto(self, x: int, y: int, h: int):
        """
        控制无人机到达指定位置
        :param x: x轴方向位置（厘米）
        :param y: y轴方向位置（厘米）
        :param h: 高度（厘米）
        """
        return self._send_cmd(f"goto {x} {y} {h}")

    def flip(self, direction: str):
        """
        flip函数用于控制无人机翻滚
        :param direction: 翻滚方向（f前 b后 l左 r右）
        """
        return self._send_cmd(f"flip {direction} 1")

    def flip_forward(self):
        """向前做翻转（翻跟头）动作
        """
        self.flip("f")
        pass

    def flip_back(self):
        """向后做翻转（翻跟头）动作
        """
        self.flip("b")
        pass

    def flip_left(self):
        """向左做翻转（翻跟头）动作
        """
        self.flip("l")
        pass

    def flip_right(self):
        """向右做翻转（翻跟头）动作
        """
        self.flip("r")
        pass

    def rotate(self, degree: int):
        """
        控制无人机旋转
        :param degree: 自转方向和角度（正数顺时针，负数逆时针，单位为度数）
        """
        return self._send_cmd(f"rotate {degree}")

    def cw(self, degree: int):
        """
        控制无人机顺时针自转
        :param degree: 自转角度度数
        """
        return self._send_cmd(f"cw {degree}")

    def ccw(self, degree: int):
        """
        控制无人机逆时针自转
        :param degree: 自转角度度数
        """
        return self._send_cmd(f"ccw {degree}")

    def high(self, high: int):
        """
        控制无人机飞行高度
        :param high: 飞行到指定高度
        :return:
        """
        return self._send_cmd(f"high {high}")

    def speed(self, speed: int):
        """
        设置无人机飞行速度
        :param speed: 飞行速度（0-200厘米/秒）
        """
        return self._send_cmd(f"setSpeed {speed}")

    def led(self, r: int, g: int, b: int):
        """
        控制无人机灯光为指定颜色
        :param r: 灯光颜色R通道
        :param g: 灯光颜色G通道
        :param b: 灯光颜色B通道
        """
        return self._send_cmd(f"light {r} {g} {b}")

    def bln(self, r: int, g: int, b: int):
        """
        控制无人机灯光，呼吸灯
        :param r: 灯光颜色R通道
        :param g: 灯光颜色G通道
        :param b: 灯光颜色B通道
        """
        return self._send_cmd(f"bln {r} {g} {b}")

    def rainbow(self, r: int, g: int, b: int):
        """
        控制无人机灯光，七彩变换
        :param r: 灯光颜色R通道
        :param g: 灯光颜色G通道
        :param b: 灯光颜色B通道
        """
        return self._send_cmd(f"rainbow {r} {g} {b}")

    def airplane_mode(self, mode: int):
        """
        设置无人机飞行模式
        :param mode: 1,2,3,4
        :return:
        """
        return self._send_cmd(f"airplane_mode {mode}")

    def stop(self):
        """
        控制无人机悬停
        """
        return self.hover()

    def hover(self):
        """
        控制无人机悬停
        """
        return self._send_cmd(f"hover")

    pass
