import dataclasses
import typing
from typing import Dict

from .http_layer import get_airplane_camera_image
from .image_process import read_b64_img
from .image_receiver_mook import ImageReceiver


@dataclasses.dataclass()
class AirplaneFlyStatus(object):
    """
    每个飞机的飞行状态
    """
    landing: bool
    isStop: bool
    x: float
    y: float
    h: float
    rX: float
    rY: float
    rZ: float
    pass


def make_AirplaneFlyStatus(
        fly_status: Dict[str, any]
):
    return AirplaneFlyStatus(
        landing=fly_status['landing'],
        isStop=fly_status['isStop'],
        x=fly_status['x'],
        y=fly_status['y'],
        h=fly_status['h'],
        rX=fly_status['rX'],
        rY=fly_status['rY'],
        rZ=fly_status['rZ'],
    )
    pass


@dataclasses.dataclass()
class AirplaneCore(object):
    """
    每个飞机的基本信息
    """
    keyName: str
    typeName: str
    updateTimestamp: int
    status: AirplaneFlyStatus
    cameraFront: str
    cameraDown: str

    # 声明字段，且不让其参与 __init__
    image_receiver: ImageReceiver = dataclasses.field(init=False)

    def __post_init__(self):
        # 在这里实例化，此时可以安全地将 self 传给 ImageReceiver
        self.receiver = ImageReceiver(self)
        pass

    def cap_image(
            self,
            user_receive_callback: typing.Optional[typing.Callable[[bytes], None]] = None,
            user_progress_callback: typing.Optional[typing.Callable[[int, int], None]] = None,
    ):
        self.image_receiver.send_cap_image(user_receive_callback, user_progress_callback)
        pass

    def get_image_transfer_progress(self):
        self.image_receiver.get_transfer_progress()
        pass

    def is_image_transfer_in_progress(self):
        self.image_receiver.is_transfer_in_progress()
        pass

    def get_latest_image(self):
        self.image_receiver.get_latest_image()
        pass

    def get_camera_front_img(self):
        """
        获取前置摄像头图像
        :return:  cv2::Mat | None
        """
        # return read_b64_img(self.cameraFront)
        return read_b64_img(get_airplane_camera_image(self.keyName, 'front'))
        pass

    def get_camera_down_img(self):
        """
        获取下置摄像头图像
        :return:  cv2::Mat | None
        """
        # return read_b64_img(self.cameraDown)
        return read_b64_img(get_airplane_camera_image(self.keyName, 'down'))
        pass

    pass
