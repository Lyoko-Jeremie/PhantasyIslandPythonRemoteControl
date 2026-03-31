"""
场景相关 API 模块。
"""

from __future__ import annotations

import typing

from .api_module import ApiModule


class FlyApi(ApiModule):

    def listFlyObject(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('fly.listFlyObject')

    def getFlyObjectInfo(self, keyName: str) -> typing.Optional[dict]:
        return self._send_and_wait_sync('fly.getFlyObjectInfo', data={'keyName': keyName})

    def getFlyObjectCameraImageDown(self, keyName: str) -> typing.Optional[dict]:
        return self._send_and_wait_sync('fly.getFlyObjectCameraImageDown', data={'keyName': keyName})

    def getFlyObjectCameraImageFront(self, keyName: str) -> typing.Optional[dict]:
        return self._send_and_wait_sync('fly.getFlyObjectCameraImageFront', data={'keyName': keyName})
