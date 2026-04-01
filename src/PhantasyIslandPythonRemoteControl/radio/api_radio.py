"""
无线电相关 API 模块。
"""

from __future__ import annotations

import typing

from .api_module import ApiModule, SendResult

from .type_def import XYZ, RadioCheckOptions, RadioMaterialProperties, radio_material_properties_from_dict


class RadioApi(ApiModule):

    def isSceneInit(self) -> SendResult[bool]:
        return self.send('radio.isSceneInit', post_processor=lambda d: d.get('init'))

    def isRadioReachabilityCheckerInit(self) -> SendResult[bool]:
        return self.send('radio.isRadioReachabilityCheckerInit', post_processor=lambda d: d.get('init'))

    def checkReachability(self, aTx: XYZ, bRx: XYZ,
                          options: typing.Optional[RadioCheckOptions]) -> SendResult[dict]:
        return self.send('radio.checkReachability', data={
            'aTx': aTx,
            'bRx': bRx,
            'options': options.to_dict() if options is not None else None,
        })

    def updateObjectPos(self, objectId: str, position: XYZ) -> SendResult[dict]:
        return self.send('radio.updateObjectPos', data={
            'objectId': objectId,
            'position': position,
        })

    def updateMeshRadioMaterial(self, meshId: str, materialId: typing.Optional[str],
                                thickness_m: typing.Optional[float]) -> SendResult[dict]:
        return self.send('radio.updateMeshRadioMaterial', data={
            'meshId': meshId,
            'materialId': materialId,
            'thickness_m': thickness_m,
        })

    def getAllRadioMaterial(self) -> SendResult[typing.List[RadioMaterialProperties]]:
        return self.send('radio.getAllRadioMaterial',
                         post_processor=lambda d: [radio_material_properties_from_dict(n) for n in d.get('meshIds')],
                         )

    def localRadioMaterial(self) -> SendResult[typing.List[RadioMaterialProperties]]:
        return self.send('radio.localRadioMaterial',
                         post_processor=lambda d: [radio_material_properties_from_dict(n) for n in d.get('meshIds')],
                         )

    def getBuildingRadioMaterial(self) -> SendResult[dict]:
        return self.send('radio.getBuildingRadioMaterial')

    def addRadioMaterial(self, material: RadioMaterialProperties) -> SendResult[dict]:
        return self.send('radio.addRadioMaterial', data=material.to_dict())

    def listRadioLocalObjectsIds(self) -> SendResult[typing.List[str]]:
        return self.send('radio.listRadioLocalObjects', post_processor=lambda d: d.get('localObjectIds'))
