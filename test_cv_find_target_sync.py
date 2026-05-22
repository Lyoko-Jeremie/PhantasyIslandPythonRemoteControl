import cv2
import numpy as np

from src.PhantasyIslandPythonRemoteControl import get_airplane_manager
from src.PhantasyIslandPythonRemoteControl.airplane_manager import AirplaneManager
from src.PhantasyIslandPythonRemoteControl.control_command import AirplaneController


def control_rotate(a: AirplaneController, count: int):
    """
    control_rotate 函数通过指定的度数旋转无人机。
    如果能够旋转无人机，则返回 True，否则返回 False。

    :param a:AirplaneController: 传入无人机控制器对象
    :param count:int: 确定旋转的像素阈值条件（在此逻辑中，count<=0时触发旋转）
    :return: 布尔值，旋转成功返回 True，失败返回 False
    """
    if count <= 0:
        if a.rotate(1) is not None:
            # cv2.waitKey(10)
            return True
        else:
            return False
    else:
        return False


def control_hor(a: AirplaneController, count: int, h_img: np.array):
    """
    control_hor 函数控制无人机在垂直方向（高度）上的运动，以使目标处于屏幕垂直中心。
    注意：函数名虽为 hor，但内部逻辑根据水平投影调整上下高度。

    :param a:AirplaneController: 控制无人机
    :param count:int: 目标区域的非零像素总数
    :param h_img:np.array: 传入的二值化图像
    :return: 如果无人机已对准中心返回 False（停止后续调整），否则返回 True
    """
    """"""
    if 0 < count < 600:
        # 获取水平投影的最右侧两列数据
        h_img = hor_project(h_img)[::, h_img.shape[1] - 2::]
        # 计算反转后的非零像素（即投影中的目标宽度）
        h_count = cv2.countNonZero(cv2.bitwise_not(h_img))
        if 0 < h_count < 60:
            for i in range(h_img.shape[0] - 1):
                # 寻找投影边缘：从有像素到无像素的跃变点
                if (h_img[i - 1, 0] > 0) and (h_img[i, 0] == 0):
                    # 计算目标在垂直方向上的中心点位置
                    center_y = (i + h_count + i) // 2
                    # 检查是否在目标范围 [100, 140] 内
                    if 100 <= center_y <= 140:
                        return False
                    elif center_y < 100:
                        # 目标偏上，控制无人机上升
                        if a.up(5) is not None:
                            break
                    elif center_y > 140:
                        # 目标偏下，控制无人机下降
                        if a.down(5) is not None:
                            break
                    else:
                        break
            # cv2.waitKey(10)
        return True
    else:
        return False


def control_ver(a: AirplaneController, count: int, v_img: np.array):
    """
    control_ver 函数控制无人机在水平方向（左右）上的运动，以使目标处于屏幕水平中心。

    :param a:AirplaneController: 控制无人机
    :param count:int: 目标区域的非零像素总数
    :param v_img:np.array: 存储垂直方向投影后的图像
    :return: 如果无人机已对准中心返回 False，否则返回 True
    """
    if 0 < count < 600:
        # 获取垂直投影的最下方两行数据
        v_img = ver_project(v_img)[v_img.shape[0] - 2::, ::]
        # 计算反转后的非零像素（即投影中的目标高度）
        v_count = cv2.countNonZero(cv2.bitwise_not(v_img))
        if 0 < v_count < 70:
            for i in range(v_img.shape[1] - 1):
                # 寻找投影边缘：从有像素到无像素的跃变点
                if (v_img[0, i - 1] > 0) and (v_img[0, i] == 0):
                    # 计算目标在水平方向上的中心点位置
                    center_x = (i + v_count + i) // 2
                    # 检查是否在目标范围 [140, 180] 内
                    if 140 <= center_x <= 180:
                        return False
                    elif center_x < 140:
                        # 目标偏左，控制无人机向左平移
                        if a.left(5) is not None:
                            break
                    elif center_x > 180:
                        # 目标偏右，控制无人机向右平移
                        if a.right(5) is not None:
                            break
                    else:
                        break
            # cv2.waitKey(10)
            return True
    else:
        return False


def control_forward(a: AirplaneController, count: int):
    """
    control_forward 函数用于控制无人机向前飞行。

    :param a:AirplaneController: 访问 AirplaneController 类实例
    :param count:int: 像素计数阈值
    :return: 布尔值，前进成功返回 True，否则返回 False
    """
    if 0 < count < 500:
        if a.forward(5) is not None:
            # cv2.waitKey(10)
            return True
    else:
        return False


def hor_project(binary):
    """
    hor_project 函数接收一张二值化图像并返回其水平投影。
    水平投影将每一行中黑色像素的数量统计出来，并在输出图像中用白色长条表示。

    :param binary: 输入的二值图像
    :return: 输入图像的水平投影二值图
    """
    h, w = binary.shape
    h_projection = np.zeros(binary.shape, dtype=np.uint8)

    h_h = [0] * h
    for j in range(h):
        for i in range(w):
            # 统计黑色像素 (值为0)
            if binary[j, i] == 0:
                h_h[j] += 1
    # 绘制投影图
    for j in range(h):
        for i in range(h_h[j]):
            h_projection[j, i] = 255

    return h_projection


def ver_project(binary):
    """
    ver_project 函数接收一张二值图像并返回其垂直投影。
    垂直投影统计每一列中黑色像素的数量。

    :param binary: 需要进行垂直投影的图像
    :return: 输入图像的垂直投影二值图
    """
    h, w = binary.shape
    v_projection = np.zeros(binary.shape, dtype=np.uint8)

    w_w = [0] * w
    for i in range(w):
        for j in range(h):
            # 统计黑色像素
            if binary[j, i] == 0:
                w_w[i] += 1

    # 绘制投影图
    for i in range(w):
        for j in range(w_w[i]):
            v_projection[j, i] = 255

    return v_projection


def main():
    """
    主函数：初始化无人机管理器，获取无人机控制权限，
    并进入主循环通过图像识别结果控制无人机寻找并对准目标。
    """
    """"""
    m: AirplaneManager = get_airplane_manager()
    m.flush()
    m.start()
    for port in ['FH0A:COM3']:
        m.flush()
        a: AirplaneController = m.get_airplane(port)
        if a:
            # 起飞至 50 厘米高度
            a.takeoff(50)
            cv2.namedWindow(f'{a.keyName} front', cv2.WINDOW_NORMAL)
            cv2.namedWindow(f'{a.keyName} down', cv2.WINDOW_NORMAL)
            a.use_fast_mode(False)
            while True:
                # 获取前置和下方摄像头图像
                f_img = a.get_camera_front_img()
                d_img = a.get_camera_down_img()
                if f_img is None:
                    continue
                cv2.imshow(f'{a.keyName} front', f_img)
                if d_img is not None:
                    cv2.imshow(f'{a.keyName} down', d_img)
                cv2.waitKey(20)

                # 图像预处理：通过 (蓝 - 红) 通道差值突出蓝色目标
                b, g, r = cv2.split(f_img)
                br = cv2.subtract(b, r)
                # 二值化处理
                t, br_t = cv2.threshold(br, 127, 255, cv2.THRESH_BINARY)
                # 计算目标像素点总数
                count = cv2.countNonZero(br_t)
                
                # 状态机逻辑：
                # 1. 如果找不到目标 (count <= 0)，执行旋转搜索
                hor_flag = control_rotate(a, count)
                
                if not hor_flag:
                    # 2. 如果找到了目标，先调整垂直高度（对准垂直中心）
                    ver_flag = control_hor(a, count, br_t)
                    # 3. 接着调整水平位置（对准水平中心）
                    forward_flag = control_ver(a, count, br_t)
                    
                    # 4. 如果高度和水平位置都已基本对齐，则控制无人机向前飞行靠近目标
                    if (not forward_flag) or (not forward_flag):
                        final_flag = control_forward(a, count)
                m.flush()
            pass
        else:
            print(f'port {port} get error')
        pass

    pass


if __name__ == '__main__':
    main()
    pass
