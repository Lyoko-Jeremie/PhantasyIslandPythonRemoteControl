"""
场景相关 API 模块。
"""

from __future__ import annotations

import typing

from .api_module import ApiModule, SendResult
from .type_def_view import ViewMaterialChangeCommand, ViewMaterialChangeCommandSimple


class SceneApi(ApiModule):

    # def get_init_state(self) -> SendResult[dict]:
    #     return self.send('scene.getInitState')

    def listAllMeshObjectInScene(self) -> SendResult[dict]:
        return self.send('scene.listAllMeshObjectInScene')

    def getObjectInfoById(self, objectId: str) -> SendResult[dict]:
        return self.send('scene.getObjectInfoById', data={'objectId': objectId})

    def removeObjectById(self, objectId: str) -> SendResult[dict]:
        return self.send('scene.removeObjectById', data={'objectId': objectId})

    def moveObjectById(self, objectId: str, position: typing.Tuple[float, float, float]) -> SendResult[dict]:
        return self.send('scene.moveObjectById',
                         data={'objectId': objectId,
                               'position': [position[0], position[1], position[2]]})

    def setObjectRadioMaterial(self, objectId: str, materialId: typing.Optional[str],
                               thickness_m: typing.Optional[float]) -> SendResult[dict]:
        return self.send('scene.setObjectRadioMaterial',
                         data={'objectId': objectId,
                               'materialId': materialId,
                               'thickness_m': thickness_m})

    def updateMeshViewMaterial(self, meshId: str, viewMaterialChangeCommand: ViewMaterialChangeCommand) -> SendResult[dict]:
        return self.send('scene.updateMeshViewMaterial',
                         data={'meshId': meshId, 'viewMaterialChangeCommand': viewMaterialChangeCommand})

    def updateMeshViewMaterialSimple(self, meshId: str,
                                     viewMaterialChangeCommandSimple: ViewMaterialChangeCommandSimple) -> SendResult[dict]:
        return self.send('scene.updateMeshViewMaterialSimple',
                         data={'meshId': meshId, 'viewMaterialChangeCommandSimple': viewMaterialChangeCommandSimple})
