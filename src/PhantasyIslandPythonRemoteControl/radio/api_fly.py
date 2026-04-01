"""
飞行器相关 API 模块。
"""

from __future__ import annotations

from .api_module import ApiModule, SendResult


class FlyApi(ApiModule):

    def listFlyObject(self) -> SendResult[dict]:
        return self.send('fly.listFlyObject')

    def getFlyObjectInfo(self, keyName: str) -> SendResult[dict]:
        return self.send('fly.getFlyObjectInfo', data={'keyName': keyName})

    def getFlyObjectCameraImageDown(self, keyName: str) -> SendResult[dict]:
        return self.send('fly.getFlyObjectCameraImageDown', data={'keyName': keyName})

    def getFlyObjectCameraImageFront(self, keyName: str) -> SendResult[dict]:
        return self.send('fly.getFlyObjectCameraImageFront', data={'keyName': keyName})
