"""
场景相关 API 模块。
"""

from __future__ import annotations

import typing

from .api_module import ApiModule

from .type_def import XYZ, RadioCheckOptions, RadioMaterialProperties


class RadioApi(ApiModule):

    def isSceneInit(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.isSceneInit')

    def isRadioReachabilityCheckerInit(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.isRadioReachabilityCheckerInit')

    def checkReachability(self, aTx: XYZ, bRx: XYZ, options: typing.Optional[RadioCheckOptions]) -> typing.Optional[
        dict]:
        return self._send_and_wait_sync('radio.checkReachability', data={
            'aTx': aTx,
            'bRx': bRx,
            'options': options.to_dict() if options is not None else None,
        })

    def updateObjectPos(self, objectId: str, position: XYZ) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.updateObjectPos', data={
            'objectId': objectId,
            'position': position,
        })

    def updateMeshRadioMaterial(self, meshId: str, materialId: typing.Optional[str],
                                thickness_m: typing.Optional[float]) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.updateMeshRadioMaterial', data={
            'meshId': meshId,
            'materialId': materialId,
            'thickness_m': thickness_m,
        })

    def getAllRadioMaterial(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.getAllRadioMaterial')

    def localRadioMaterial(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.localRadioMaterial')

    def getBuildingRadioMaterial(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.getBuildingRadioMaterial')

    def addRadioMaterial(self, material: RadioMaterialProperties) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.addRadioMaterial', data=material.to_dict())

    def listRadioLocalObjects(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.listRadioLocalObjects')
