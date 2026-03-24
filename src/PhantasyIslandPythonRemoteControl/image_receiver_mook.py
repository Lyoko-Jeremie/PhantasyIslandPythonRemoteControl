from __future__ import annotations

import dataclasses
import typing
import time
import threading

if typing.TYPE_CHECKING:
    from .airplane_core import AirplaneCore


@dataclasses.dataclass
class ImageInfo:
    img: bytes
    id: int
    progress_count: int = 0
    ok: bool = False
    pass


class ImageReceiver:
    airplane: AirplaneCore

    # 任何时候只存在一张圖片
    image_instance: ImageInfo | None = None
    _cmd_id_counter: int = 1
    now_loading_id: int = 0
    _lock = threading.RLock()

    user_receive_callback: typing.Callable[[bytes], None] | None = None
    user_progress_callback: typing.Callable[[int, int], None] | None = None

    def __init__(self, airplane: AirplaneCore):
        self.airplane = airplane
        pass

    def send_cap_image(
            self,
            user_receive_callback: typing.Optional[typing.Callable[[bytes], None]] = None,
            user_progress_callback: typing.Optional[typing.Callable[[int, int], None]] = None,
    ):

        def mook_receive_thread():
            # get it in a thread and make a sleep with progress
            with self._lock:
                self._cmd_id_counter += 1
                self.now_loading_id = self._cmd_id_counter
                self.image_instance = ImageInfo(
                    img=self.airplane.get_camera_down_img(),
                    id=self._cmd_id_counter,
                )

            while self.image_instance.progress_count < 100:
                time.sleep(0.01)
                with self._lock:
                    if self.image_instance.id != self.now_loading_id:
                        break
                    self.image_instance.progress_count += 1
                    pass

                if self.user_progress_callback:
                    self.user_progress_callback(self.image_instance.progress_count, 100)
                pass

            with self._lock:
                if self.image_instance.id == self.now_loading_id:
                    self.image_instance.ok = True
                    pass
                pass

            if self.image_instance.id != self.now_loading_id and self.image_instance.progress_count >= 100 and self.user_receive_callback:
                self.user_receive_callback(self.image_instance.img)

            pass

        self.user_receive_callback = user_receive_callback
        self.user_progress_callback = user_progress_callback

        # new thread to simulate load it
        threading.Thread(target=mook_receive_thread).start()

        pass

    def get_image(self):
        return self.get_image()

    def get_latest_image(self):
        with self._lock:
            if self.image_instance is None:
                return None
            if self.image_instance.ok:
                return self.image_instance.img
            else:
                return None

    def get_transfer_progress(self):
        with self._lock:
            if self.image_instance is None:
                return None
            return self.image_instance.progress_count
