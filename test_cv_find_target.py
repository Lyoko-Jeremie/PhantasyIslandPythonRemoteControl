import cv2
import numpy
import numpy as np

from multiprocessing import Process, Queue

from src.PhantasyIslandPythonRemoteControl import get_airplane_manager
from src.PhantasyIslandPythonRemoteControl.airplane_manager import AirplaneManager
from src.PhantasyIslandPythonRemoteControl.control_command import AirplaneController


def process_recive_target(Q):
    while True:
        # (k: int, a: AirplaneController, m: AirplaneManager, )
        (exit, k, a, m, f_img) = Q.get()
        if exit is True:
            break
        find_target(a, f_img)
    pass


# def process_recive_keyPressEvent(Q):
#     while True:
#         # (k: int, a: AirplaneController, m: AirplaneManager, )
#         (exit, a, m, f_img) = Q.get()
#         if exit is True:
#             break
#         find_target(a, f_img)
#     pass


def process_call_target(Q: Queue, k: int, a: AirplaneController, m: AirplaneManager, f_img: np.array):
    Q.put((False, k, a, m, f_img))


def process_recive_hor(Q):
    while True:
        (exit, k, a, count, h_img) = Q.get()
        if exit is True:
            break
        control_hor(a, count, h_img)
    pass


def process_call_hor(Q: Queue, k: int, a: AirplaneController, count: int, h_img: np.array):
    Q.put((False, k, a, count, h_img))


def process_recive_ver(Q):
    while True:
        (exit, k, a, count, v_img) = Q.get()
        if exit is True:
            break
        control_ver(a, count, v_img)
    pass


def process_call_ver(Q: Queue, k: int, a: AirplaneController, count: int, v_img: np.array):
    Q.put((False, k, a, count, v_img))


def process_recive_rotate(Q):
    while True:
        (exit, k, a, count) = Q.get()
        if exit is True:
            break
        control_rotate(a, count)
    pass


def process_call_rotate(Q: Queue, k: int, a: AirplaneController, count: int):
    Q.put((False, k, a, count))


def process_recive_forward(Q):
    while True:
        (exit, k, a, count) = Q.get()
        if exit is True:
            break
        control_forward(a, count)
    pass


def process_call_forward(Q: Queue, k: int, a: AirplaneController, count: int):
    Q.put((False, k, a, count))
    cv2.waitKey(50)


def process_cv(port: str, m: AirplaneManager):
    m.flush()
    a: AirplaneController = m.get_airplane(port)
    if a:
        a.takeoff(50)
        Q = Queue()
        # Q_r = Queue()
        # Q_h = Queue()
        # Q_v = Queue()
        # Q_f = Queue()
        cv2.namedWindow(f'{a.keyName} front', cv2.WINDOW_NORMAL)
        cv2.namedWindow(f'{a.keyName} down', cv2.WINDOW_NORMAL)
        a.use_fast_mode(False)
        p = Process(target=process_recive_target, args=(Q,))
        p.start()
        # p_r = Process(target=process_recive_rotate, args=(Q_r,))
        # p_r.start()
        # p_h = Process(target=process_recive_hor, args=(Q_h,))
        # p_h.start()
        # p_v = Process(target=process_recive_ver, args=(Q_v,))
        # p_v.start()
        # p_f = Process(target=process_recive_forward, args=(Q_f,))
        # p_f.start()
        while True:
            f_img = a.get_camera_front_img()
            cv2.imshow(f'{a.keyName} front', f_img)
            cv2.imshow(f'{a.keyName} down', a.get_camera_down_img())
            b, g, r = cv2.split(f_img)
            br = cv2.subtract(b, r)
            t, br_t = cv2.threshold(br, 127, 255, cv2.THRESH_BINARY)
            count = cv2.countNonZero(br_t)
            # print(count)
            process_call_target(Q, cv2.waitKey(50), a, count, f_img)
            # process_call_rotate(Q_r, cv2.waitKey(50), a, count)
            # process_call_hor(Q_h, cv2.waitKey(50), a, count, br_t)
            # process_call_ver(Q_v, cv2.waitKey(50), a, count, br_t)
            # process_call_forward(Q_f, cv2.waitKey(50), a, count)
            m.flush()
        pass
    else:
        print(f'port {port} get error')
    pass


def find_target(a: AirplaneController, f_img: np.array):
    b, g, r = cv2.split(f_img)
    br = cv2.subtract(b, r)
    t, br_t = cv2.threshold(br, 127, 255, cv2.THRESH_BINARY)
    count = cv2.countNonZero(br_t)

    print('count', count)

    if count <= 0:
        if a.rotate(1) is not None:
            pass
    if 0 < count < 420:
        h_img = hor_project(br_t)
        v_img = ver_project(br_t)
        for i in range(h_img.shape[0] - 1):
            if (h_img[i + 1, h_img.shape[1] - 1] > 0) and (h_img[i, h_img.shape[1] - 1] == 0):
                print('h_img[i, h_img.shape[1] - 1]', h_img[i, h_img.shape[1] - 1])
                print('h_img[i + 1, h_img.shape[1] - 1]', h_img[i + 1, h_img.shape[1] - 1])
                print('h_img.shape[0] // 2:', h_img.shape[0] // 2, '\t', 'i:', i)
                print()
                if i <= h_img.shape[0] // 2 - 30:
                    print(f"now is {i}: up")
                    if a.up(1) is not None:
                        break
                elif i > h_img.shape[0] // 2 + 30:
                    print(f"now is {i}: down")
                    if a.down(1) is not None:
                        break
                else:
                    break

        for i in range(v_img.shape[1] - 1):
            if (v_img[v_img.shape[0] - 1, i + 1] > 0) and (v_img[v_img.shape[0] - 1, i] == 0):
                print('v_img[v_img.shape[0] - 1, i]', v_img[v_img.shape[0] - 1, i])
                print('v_img[v_img.shape[0] - 1, i - 1]', v_img[v_img.shape[0] - 1, i - 1])
                print('v_img.shape[1] // 2:', v_img.shape[1] // 2, '\t', 'i:', i)
                print()
                if i <= v_img.shape[1] // 2 - 30:
                    print(f"now is {i}: left")
                    if a.left(5) is not None:
                        break
                elif i > v_img.shape[1] // 2 + 30:
                    print(f"now is {i}: right")
                    if a.right(5) is not None:
                        break
                else:
                    break
        if a.forward(1) is not None:
            pass
    else:
        pass


def control_rotate(a: AirplaneController, count: int):
    if count <= 0:
        if a.rotate(1) is not None:
            cv2.waitKey(50)


def control_hor(a: AirplaneController, count: int, h_img: np.array):
    if 0 < count < 420:
        h_img = hor_project(h_img)
        for i in range(h_img.shape[0] - 1):
            if (h_img[i + 1, h_img.shape[1] - 1] > 0) and (h_img[i, h_img.shape[1] - 1] == 0):
                print('h_img[i, h_img.shape[1] - 1]', h_img[i, h_img.shape[1] - 1])
                print('h_img[i + 1, h_img.shape[1] - 1]', h_img[i + 1, h_img.shape[1] - 1])
                print('h_img.shape[0] // 2:', h_img.shape[0] // 2, '\t', 'i:', i)
                print()
                if i <= h_img.shape[0] // 2 - 15:
                    print(f"now is {i}: up")
                    if a.up(1) is not None:
                        break
                elif i > h_img.shape[0] // 2 + 15:
                    print(f"now is {i}: down")
                    if a.down(1) is not None:
                        break
                else:
                    break
        cv2.waitKey(50)


def control_ver(a: AirplaneController, count: int, v_img: np.array):
    if 0 < count < 420:
        v_img = ver_project(v_img)
        for i in range(v_img.shape[1] - 1):
            if (v_img[v_img.shape[0] - 1, i + 1] > 0) and (v_img[v_img.shape[0] - 1, i] == 0):
                print('v_img[v_img.shape[0] - 1, i]', v_img[v_img.shape[0] - 1, i])
                print('v_img[v_img.shape[0] - 1, i - 1]', v_img[v_img.shape[0] - 1, i - 1])
                print('v_img.shape[1] // 2:', v_img.shape[1] // 2, '\t', 'i:', i)
                print()
                if i <= v_img.shape[1] // 2 - 15:
                    print(f"now is {i}: left")
                    if a.left(1) is not None:
                        break
                elif i > v_img.shape[1] // 2 + 15:
                    print(f"now is {i}: right")
                    if a.right(1) is not None:
                        break
                else:
                    break
        cv2.waitKey(50)


def control_forward(a: AirplaneController, count: int):
    if 0 < count < 420:
        if a.forward(1) is not None:
            cv2.waitKey(50)


def hor_project(binary):
    h, w = binary.shape
    h_projection = np.zeros(binary.shape, dtype=np.uint8)

    h_h = [0] * h
    for j in range(h):
        for i in range(w):
            if binary[j, i] == 0:
                h_h[j] += 1
    for j in range(h):
        for i in range(h_h[j]):
            h_projection[j, i] = 255

    # cv2.imshow('h_pro', h_projection)

    return h_projection


def ver_project(binary):
    h, w = binary.shape
    v_projection = np.zeros(binary.shape, dtype=np.uint8)

    w_w = [0] * w
    for i in range(w):
        for j in range(h):
            if binary[j, i] == 0:
                w_w[i] += 1

    for i in range(w):
        for j in range(w_w[i]):
            v_projection[j, i] = 255

    # cv2.imshow('v_pro', v_projection)

    return v_projection


if __name__ == '__main__':
    m: AirplaneManager = get_airplane_manager()

    # print('airplanes_table', m.airplanes_table)

    m.flush()
    m.start()

    # print('airplanes_table', m.airplanes_table)

    # print(m.start())

    # 'COM4', 'COM5'

    for port in ['FH0A:COM3']:
        p = Process(target=process_cv, args=(port, m,))
        p.start()

    pass
