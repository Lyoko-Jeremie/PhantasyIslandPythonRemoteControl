"""
无线电禁区(电子围栏/无线电干扰区)相关 API 模块。
"""

from __future__ import annotations

import typing

from .api_module import ApiModule, SendResult

from .type_def import XYZ

# ---------------------------------------------------------------------------
# 类型定义
# ---------------------------------------------------------------------------

#: 欧拉角序，与 three.js 的 EulerOrder 一致
EulerOrder = typing.Literal['XYZ', 'YXZ', 'ZXY', 'ZYX', 'YZX', 'XZY']

#: 欧拉角：(x, y, z, order)
EulerLike = typing.Tuple[float, float, float, EulerOrder]

#: 四元数：(x, y, z, w)
QuaternionLike = typing.Tuple[float, float, float, float]

#: 旋转参数，可以是欧拉角或四元数
RotationLike = typing.Union[EulerLike, QuaternionLike]


class RestrictedAreaApi(ApiModule):
    """无线电禁区（电子围栏/无线电干扰区）相关 API。"""

    # ---- 查询类 ----

    def getAllRadioRestrictedArea(self) -> SendResult[dict]:
        """获取所有无线电禁区信息。"""
        return self.send('restrictedArea.getAllRadioRestrictedArea', post_processor=lambda d: d.get('data'))

    def getRadioRestrictedAreaById(self, id: str) -> SendResult[dict]:
        """根据 ID 获取无线电禁区信息。"""
        return self.send('restrictedArea.getRadioRestrictedAreaById', data={
            'id': id,
        }, post_processor=lambda d: d.get('data'))

    # ---- 启用/禁用 ----

    def enableArea(self, id: str) -> SendResult[dict]:
        """根据 ID 启用禁区。"""
        return self.send('restrictedArea.enableArea', data={
            'id': id,
        }, post_processor=lambda d: d.get('result'))

    def enableAreaByName(self, name: str) -> SendResult[dict]:
        """根据名称启用禁区。"""
        return self.send('restrictedArea.enableAreaByName', data={
            'name': name,
        }, post_processor=lambda d: d.get('result'))

    def disableArea(self, id: str) -> SendResult[dict]:
        """根据 ID 禁用禁区。"""
        return self.send('restrictedArea.disableArea', data={
            'id': id,
        }, post_processor=lambda d: d.get('result'))

    def disableAreaByName(self, name: str) -> SendResult[dict]:
        """根据名称禁用禁区。"""
        return self.send('restrictedArea.disableAreaByName', data={
            'name': name,
        }, post_processor=lambda d: d.get('result'))

    # ---- 点包含检测 ----

    def pointInAnyArea(self, pos: XYZ) -> SendResult[list]:
        """检测点是否在任意禁区内，返回包含该点的所有禁区列表。"""
        return self.send('restrictedArea.pointInAnyArea', data={
            'pos': list(pos),
        }, post_processor=lambda d: d.get('result'))

    def pointInAreaById(self, id: str, pos: XYZ) -> SendResult[dict]:
        """检测点是否在指定 ID 的禁区内。"""
        return self.send('restrictedArea.pointInAreaById', data={
            'id': id,
            'pos': list(pos),
        }, post_processor=lambda d: d.get('result'))

    # ---- 名称/ID 互转 ----

    def areaId2Name(self, id: str) -> SendResult[dict]:
        """根据禁区 ID 获取名称。"""
        return self.send('restrictedArea.areaId2Name', data={
            'id': id,
        }, post_processor=lambda d: d.get('result'))

    def areaName2Id(self, name: str) -> SendResult[dict]:
        """根据禁区名称获取 ID。"""
        return self.send('restrictedArea.areaName2Id', data={
            'name': name,
        }, post_processor=lambda d: d.get('result'))

    # ---- 欧拉角/四元数转换 ----

    def euler2quaternion(self, euler: EulerLike) -> SendResult[list]:
        """将欧拉角转换为四元数。

        :param euler: 欧拉角 ``(x, y, z, order)``，order 为 ``'XYZ'`` 等
        :return: 四元数 ``[x, y, z, w]``
        """
        return self.send('restrictedArea.euler2quaternion', data={
            'euler': list(euler),
        }, post_processor=lambda d: d.get('result'))

    def quaternion2euler(self, quaternion: QuaternionLike) -> SendResult[list]:
        """将四元数转换为欧拉角。

        :param quaternion: 四元数 ``(x, y, z, w)``
        :return: 欧拉角 ``[x, y, z, order]``
        """
        return self.send('restrictedArea.quaternion2euler', data={
            'quaternion': list(quaternion),
        }, post_processor=lambda d: d.get('result'))

    def eulerReOrder(self, euler: EulerLike, order: EulerOrder) -> SendResult[list]:
        """将欧拉角重新按指定顺序排列。

        :param euler: 欧拉角 ``(x, y, z, order)``
        :param order: 目标欧拉角序
        :return: 新的欧拉角 ``[x, y, z, order]``
        """
        return self.send('restrictedArea.eulerReOrder', data={
            'euler': list(euler),
            'order': order,
        }, post_processor=lambda d: d.get('result'))

    # ---- 移动 ----

    def moveArea(self, id: str, pos: XYZ) -> SendResult[dict]:
        """根据 ID 移动禁区到指定位置。"""
        return self.send('restrictedArea.moveArea', data={
            'id': id,
            'pos': list(pos),
        }, post_processor=lambda d: d.get('result'))

    def moveAreaByName(self, name: str, pos: XYZ) -> SendResult[dict]:
        """根据名称移动禁区到指定位置。"""
        return self.send('restrictedArea.moveAreaByName', data={
            'name': name,
            'pos': list(pos),
        }, post_processor=lambda d: d.get('result'))

    # ---- 旋转 ----

    def rotateArea(self, id: str, rotation: RotationLike) -> SendResult[dict]:
        """根据 ID 旋转禁区。

        :param rotation: 欧拉角 ``(x, y, z, order)`` 或四元数 ``(x, y, z, w)``
        """
        return self.send('restrictedArea.rotateArea', data={
            'id': id,
            'rotation': list(rotation),
        }, post_processor=lambda d: d.get('result'))

    def rotateAreaByName(self, name: str, rotation: RotationLike) -> SendResult[dict]:
        """根据名称旋转禁区。

        :param rotation: 欧拉角 ``(x, y, z, order)`` 或四元数 ``(x, y, z, w)``
        """
        return self.send('restrictedArea.rotateAreaByName', data={
            'name': name,
            'rotation': list(rotation),
        }, post_processor=lambda d: d.get('result'))

    # ---- 调整球体大小 ----

    def resizeSphereArea(self, id: str, radius: float) -> SendResult[dict]:
        """根据 ID 调整球形禁区半径。"""
        return self.send('restrictedArea.resizeSphereArea', data={
            'id': id,
            'radius': radius,
        }, post_processor=lambda d: d.get('result'))

    def resizeSphereAreaByName(self, name: str, radius: float) -> SendResult[dict]:
        """根据名称调整球形禁区半径。"""
        return self.send('restrictedArea.resizeSphereAreaByName', data={
            'name': name,
            'radius': radius,
        }, post_processor=lambda d: d.get('result'))

    # ---- 调整立方体大小 ----

    def resizeCubeArea(self, id: str, size: XYZ) -> SendResult[dict]:
        """根据 ID 调整立方体禁区尺寸。"""
        return self.send('restrictedArea.resizeCubeArea', data={
            'id': id,
            'size': list(size),
        }, post_processor=lambda d: d.get('result'))

    def resizeCubeAreaByName(self, name: str, size: XYZ) -> SendResult[dict]:
        """根据名称调整立方体禁区尺寸。"""
        return self.send('restrictedArea.resizeCubeAreaByName', data={
            'name': name,
            'size': list(size),
        }, post_processor=lambda d: d.get('result'))

    # ---- 调整圆锥大小 ----

    def resizeConeArea(self, id: str, coneHeight: float, coneAngle: float) -> SendResult[dict]:
        """根据 ID 调整圆锥禁区尺寸。

        :param coneHeight: 圆锥高度（尖端到底面距离）
        :param coneAngle: 圆锥半顶角（弧度）
        """
        return self.send('restrictedArea.resizeConeArea', data={
            'id': id,
            'coneHeight': coneHeight,
            'coneAngle': coneAngle,
        }, post_processor=lambda d: d.get('result'))

    def resizeConeAreaByName(self, name: str, coneHeight: float, coneAngle: float) -> SendResult[dict]:
        """根据名称调整圆锥禁区尺寸。

        :param coneHeight: 圆锥高度（尖端到底面距离）
        :param coneAngle: 圆锥半顶角（弧度）
        """
        return self.send('restrictedArea.resizeConeAreaByName', data={
            'name': name,
            'coneHeight': coneHeight,
            'coneAngle': coneAngle,
        }, post_processor=lambda d: d.get('result'))

    # ---- 创建禁区 ----

    def createSphereArea(self, name: str, position: XYZ, rotation: RotationLike, radius: float) -> SendResult[dict]:
        """创建球形禁区。

        :param name: 禁区名称
        :param position: 中心点坐标
        :param rotation: 旋转，欧拉角或四元数
        :param radius: 球半径
        :return: 创建后的禁区信息
        """
        return self.send('restrictedArea.createSphereArea', data={
            'name': name,
            'position': list(position),
            'rotation': list(rotation),
            'radius': radius,
        }, post_processor=lambda d: d.get('data'))

    def createCubeArea(self, name: str, position: XYZ, rotation: RotationLike, size: XYZ) -> SendResult[dict]:
        """创建立方体禁区。

        :param name: 禁区名称
        :param position: 中心点坐标
        :param rotation: 旋转，欧拉角或四元数
        :param size: 长宽高 ``(x, y, z)``
        :return: 创建后的禁区信息
        """
        return self.send('restrictedArea.createCubeArea', data={
            'name': name,
            'position': list(position),
            'rotation': list(rotation),
            'size': list(size),
        }, post_processor=lambda d: d.get('data'))

    def createConeArea(self, name: str, position: XYZ, rotation: RotationLike,
                       coneHeight: float, coneAngle: float) -> SendResult[dict]:
        """创建圆锥禁区。

        :param name: 禁区名称
        :param position: 中心点坐标（锥尖）
        :param rotation: 旋转，欧拉角或四元数
        :param coneHeight: 圆锥高度
        :param coneAngle: 圆锥半顶角（弧度）
        :return: 创建后的禁区信息
        """
        return self.send('restrictedArea.createConeArea', data={
            'name': name,
            'position': list(position),
            'rotation': list(rotation),
            'coneHeight': coneHeight,
            'coneAngle': coneAngle,
        }, post_processor=lambda d: d.get('data'))
