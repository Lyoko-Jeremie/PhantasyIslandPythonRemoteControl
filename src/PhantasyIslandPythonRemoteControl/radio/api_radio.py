"""
场景相关 API 模块。
"""

from __future__ import annotations

import typing

from .api_module import ApiModule


class RadioApi(ApiModule):

    def isSceneInit(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.isSceneInit')

    def isRadioReachabilityCheckerInit(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.isRadioReachabilityCheckerInit')

    # def checkReachability(self, objectId: str) -> typing.Optional[dict]:
    #     return self._send_and_wait_sync('radio.checkReachability', data={'objectId': objectId})

    ## TODO

    def getAllRadioMaterial(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.getAllRadioMaterial')

    def localRadioMaterial(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.localRadioMaterial')

    def getBuildingRadioMaterial(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.getBuildingRadioMaterial')

    ## TODO

    def listRadioLocalObjects(self) -> typing.Optional[dict]:
        return self._send_and_wait_sync('radio.listRadioLocalObjects')
