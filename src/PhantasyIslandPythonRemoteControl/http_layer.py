"""
这个文件是 PhantasyIslandPythonRemoteControl 库与仿真平台的核心通信协议部分
"""
from typing import Dict
import sys

import requests
import json

from .config import remote_location


def ping():
    return send_cmd('ping')


def ping_volatile():
    return send_cmd_volatile('ping')


def start():
    return send_cmd('start')


def start_volatile():
    return send_cmd_volatile('start')


def send_cmd(s: str):
    try:
        r = requests.get('http://' + remote_location + '/ECU_HTTP/sendStringCmd?c=' + s, timeout=10)
        print(r.status_code)
        print(r.text)
        j = json.loads(r.text)
        print(j)
        return (j['ok'], j['r'])
    except requests.exceptions.ReadTimeout as e:
        print('send_cmd ', s, ' ', 'Error Command Timeout')
        # return (False, 'Timeout')
        return {'ok': False, 'r': 'Timeout'}
    except requests.exceptions.ConnectionError as e:
        print('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.', file=sys.stderr)
        try:
            print('  ===>>>  ' + str(e.args[0].reason), file=sys.stderr)
        except:
            pass
        # return (False, 'ConnectionError Cannot Connect to PhantasyIsland')
        return {'ok': False, 'r': 'ConnectionError Cannot Connect to PhantasyIsland'}


def send_cmd_volatile(s: str):
    try:
        r = requests.get('http://' + remote_location + '/ECU_HTTP/sendStringCmd?cc=' + s, timeout=10)
        print(r.status_code)
        print(r.text)
        j = json.loads(r.text)
        return (j['ok'], j['r'])
    except requests.exceptions.ReadTimeout as e:
        print('send_cmd_volatile ', s, ' ', 'Error Command Timeout')
        # return (False, 'Timeout')
        return {'ok': False, 'r': 'Timeout'}
    except requests.exceptions.ConnectionError as e:
        print('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.', file=sys.stderr)
        try:
            print('  ===>>>  ' + str(e.args[0].reason), file=sys.stderr)
        except:
            pass
        # return (False, 'ConnectionError Cannot Connect to PhantasyIsland')
        return {'ok': False, 'r': 'ConnectionError Cannot Connect to PhantasyIsland'}


def get_all_airplane_status():
    error = None
    try:
        r = requests.get('http://' + remote_location + '/ECU_HTTP/requestPullAllAirplaneState', timeout=5)
        # print(r.status_code)
        # print('get_all_airplane_status r.text', r.text)
        j = json.loads(r.text)
        # print('get_all_airplane_status', j)
        return j
    except requests.exceptions.ConnectionError as e:
        print('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.', file=sys.stderr)
        try:
            print('  ===>>>  ' + str(e.args[0].reason), file=sys.stderr)
        except:
            print(e, file=sys.stderr)
        error = e
        pass
    if error is not None:
        raise Exception('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.')

    pass


def get_airplane_camera_image(port: str, camera: str) -> str | None:
    """
    获取指定无人机的摄像头图像
    :param port: 无人机的 keyName
    :param camera: 'down' 或 'front'
    :return: str | None 图像的 base64 编码字符串
    """
    try:
        r = requests.get('http://' + remote_location + f'/ECU_HTTP/requestPullImage?flyPort={port}&imageType={camera}',
                         timeout=5)
        j = json.loads(r.text)
        if j['ok'] is True:
            return j['imgDataString']
        else:
            return None
    except requests.exceptions.ConnectionError as e:
        print('ConnectionError Cannot Connect to PhantasyIsland, Max retries exceeded.', file=sys.stderr)
        try:
            print('  ===>>>  ' + str(e.args[0].reason), file=sys.stderr)
        except:
            print(e, file=sys.stderr)
        return None


def process_airplane(j: Dict[str, any]):
    if j['ok'] is True:
        airplanes = j['airplanes']
        # print(airplanes)
        airplaneStatus: Dict[str, Dict[str, any]] = {}
        for air in airplanes:
            # print(air)
            status: Dict[str, any] = {}
            # print(air['keyName'])
            # print(air['typeName'])
            # print(air['updateTimestamp'])
            # print(air['status'])
            status['keyName'] = air['keyName']
            status['typeName'] = air['typeName']
            status['updateTimestamp'] = air['updateTimestamp']
            status['status'] = air['status']
            # print(air['cameraDown'])
            # print(air['cameraFront'])
            camera_front = air['cameraFront']
            camera_front_img_data_string = camera_front.get('imgDataString')
            status['cameraFront'] = camera_front_img_data_string
            camera_down = air['cameraDown']
            camera_down_img_data_string = camera_down.get('imgDataString')
            status['cameraDown'] = camera_down_img_data_string
            # # print(cameraFront['imgDataString'])
            # img = read_b64_img(cameraFront['imgDataString'])
            # # print(img)
            # if img is not None:
            #     cv2.imshow(air['keyName'], img)
            #     cv2.waitKey(1)
            # else:
            #     print(img)
            # pass
            airplaneStatus[status['keyName']] = status
            pass
        return airplaneStatus
    else:
        return None
    pass
