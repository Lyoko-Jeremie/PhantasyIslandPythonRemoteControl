

例子

```python

from PhantasyIslandPythonRemoteControl import AirplaneController
from PhantasyIslandPythonRemoteControl.airplane_manager import get_airplane_manager
import time

m = get_airplane_manager()
m.flush()
m.start()
m.flush()

a: AirplaneController = m.get_airplane("FH0C:COM3")

a.use_fast_mode(
    fast_mode=False,
    future_mode=True,
)

a.takeoff(100)
time.sleep(3)

a.cap_image(
    user_receive_callback=lambda img: print(img),
    user_progress_callback=lambda p, t: None
)

a.land()
time.sleep(3)

```
---


# API列表

## AirplaneCore —— 飞机基本信息与图像

- **`cap_image(user_receive_callback, user_progress_callback)`** —— 拍照并通过回调接收图像数据  
    照片获取到时的回调函数  user_receive_callback(cv::Mat image)  
    照片传输时的传输进度回报  user_progress_callback(int progress, int total)  
  ```python
  a.cap_image(user_receive_callback=lambda img: print(img), user_progress_callback=lambda p, t: None)
  ```

- **`get_image_transfer_progress()`** —— 获取图像传输进度
  ```python
  progress = a.get_image_transfer_progress()
  ```

- **`is_image_transfer_in_progress()`** —— 判断图像是否正在传输中
  ```python
  transferring = a.is_image_transfer_in_progress()
  ```

- **`get_latest_image()`** —— 获取最新接收到的图像
  ```python
  img = a.get_latest_image()
  ```

## AirplaneController —— 无人机控制指令

### 模式设置

- **`use_fast_mode(fast_mode, future_mode)`** —— 设置命令发送模式（同步阻塞 / 同步非阻塞 / 异步 Future）  
    同步阻塞模式（默认）：use_fast_mode(fast_mode=False, future_mode=False)   
    同步非阻塞模式：use_fast_mode(fast_mode=True, future_mode=False)    
    异步模式（用于asyncio）：use_fast_mode(fast_mode=False, future_mode=True)   
  ```python
  a.use_fast_mode(fast_mode=False, future_mode=True)
  ```

- **`airplane_mode(mode)`** —— 设置无人机飞行模式，在 goto 前需设为 4
  ```python
  a.airplane_mode(4)
  ```

### 起降控制

- **`takeoff(high)`** —— 控制无人机起飞到指定高度（厘米）
  ```python
  a.takeoff(100)
  ```

- **`land()`** —— 控制无人机降落
  ```python
  a.land()
  ```

- **`emergency()`** —— 紧急停桨
  ```python
  a.emergency()
  ```

### 方向移动

- **`up(distance)`** —— 向上移动指定距离（厘米）
  ```python
  a.up(50)
  ```

- **`down(distance)`** —— 向下移动指定距离（厘米）
  ```python
  a.down(50)
  ```

- **`forward(distance)`** —— 向前移动指定距离（厘米）
  ```python
  a.forward(100)
  ```

- **`back(distance)`** —— 向后移动指定距离（厘米）
  ```python
  a.back(100)
  ```

- **`left(distance)`** —— 向左移动指定距离（厘米）
  ```python
  a.left(80)
  ```

- **`right(distance)`** —— 向右移动指定距离（厘米）
  ```python
  a.right(80)
  ```

### 定点飞行

- **`goto(x, y, h)`** —— 控制无人机飞到指定坐标位置（厘米）
  ```python
  a.goto(100, 200, 150)
  ```

- **`high(high)`** —— 控制无人机飞行到指定高度（厘米）
  ```python
  a.high(120)
  ```

### 旋转

- **`rotate(degree)`** —— 自转指定角度（正数顺时针，负数逆时针，单位度）
  ```python
  a.rotate(90)
  ```

- **`cw(degree)`** —— 顺时针自转指定角度（度）
  ```python
  a.cw(90)
  ```

- **`ccw(degree)`** —— 逆时针自转指定角度（度）
  ```python
  a.ccw(90)
  ```

### 翻转动作

- **`flip_forward()`** —— 向前翻转
  ```python
  a.flip_forward()
  ```

- **`flip_back()`** —— 向后翻转
  ```python
  a.flip_back()
  ```

- **`flip_left()`** —— 向左翻转
  ```python
  a.flip_left()
  ```

- **`flip_right()`** —— 向右翻转
  ```python
  a.flip_right()
  ```

### 悬停

- **`hover()`** —— 控制无人机悬停
  ```python
  a.hover()
  ```

### 速度设置

- **`speed(speed)`** —— 设置无人机飞行速度（0–200 厘米/秒）
  ```python
  a.speed(100)
  ```

### 灯光控制

- **`led(r, g, b)`** —— 设置无人机灯光为指定 RGB 颜色
  ```python
  a.led(255, 0, 0)
  ```

- **`bln(r, g, b)`** —— 设置无人机灯光为呼吸灯模式
  ```python
  a.bln(0, 255, 0)
  ```

- **`rainbow(r, g, b)`** —— 设置无人机灯光为七彩变换模式
  ```python
  a.rainbow(0, 0, 255)
  ```
