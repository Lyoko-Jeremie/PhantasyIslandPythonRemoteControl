"""
场景相关 API 模块。
"""

from __future__ import annotations

import typing

from .api_module import ApiModule


class SceneApi(ApiModule):

    # def get_init_state(self) -> typing.Optional[dict]:
    #     return self._send_and_wait_sync('scene.getInitState')

    def listAllMeshObjectInScene(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('scene.listAllMeshObjectInScene')

    def getObjectInfoById(self, objectId: str) -> typing.Optional[dict]:
        return self._send_and_wait_sync('scene.getObjectInfoById', data={'objectId': objectId})

    def removeObjectById(self, objectId: str) -> typing.Optional[dict]:
        return self._send_and_wait_sync('scene.removeObjectById', data={'objectId': objectId})

    def moveObjectById(self, objectId: str, position: typing.Tuple[float, float, float]) -> typing.Optional[dict]:
        return self._send_and_wait_sync('scene.moveObjectById',
                                        data={'objectId': objectId,
                                              'position': [position[0], position[1], position[2]]})

    def setObjectRadioMaterial(self, objectId: str, materialId: typing.Optional[str],
                               thickness_m: typing.Optional[float]) -> typing.Optional[dict]:
        return self._send_and_wait_sync('scene.setObjectRadioMaterial',
                                        data={'objectId': objectId,
                                              'materialId': materialId,
                                              'thickness_m': thickness_m})


