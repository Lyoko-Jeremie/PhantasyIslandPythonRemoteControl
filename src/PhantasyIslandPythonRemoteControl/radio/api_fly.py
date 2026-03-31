"""
场景相关 API 模块。
"""

from __future__ import annotations

import typing

from .api_module import ApiModule


class FlyApi(ApiModule):

    def listFlyObject(self):
        return self.send('fly.listFlyObject')

    def getFlyObjectInfo(self, keyName: str):
        return self.send('fly.getFlyObjectInfo', data={'keyName': keyName})

    def getFlyObjectCameraImageDown(self, keyName: str):
        return self.send('fly.getFlyObjectCameraImageDown', data={'keyName': keyName})

    def getFlyObjectCameraImageFront(self, keyName: str):
        return self.send('fly.getFlyObjectCameraImageFront', data={'keyName': keyName})
