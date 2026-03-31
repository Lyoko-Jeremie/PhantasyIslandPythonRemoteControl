"""
API 模块基类。

所有按领域拆分的 API 模块都继承此类，通过 _rm 访问 RadioManager 的底层通信能力。
"""

from __future__ import annotations

import typing

if typing.TYPE_CHECKING:
    from .radio_manager import RadioManager


class ApiModule:
    """
    API 子模块的基类。

    子类只需关注"业务指令"的封装，底层的发送 / 等待 / 分发
    全部委托给 RadioManager 完成。

    用法::

        class SceneApi(ApiModule):
            def get_init_state(self):
                return self._send_and_wait_sync('scene.getInitState')
    """

    __slots__ = ('_rm',)

    def __init__(self, rm: 'RadioManager') -> None:
        self._rm = rm

    # ---- 便捷代理，子类直接调用即可 ----

    def _send(self, cmd: str, data: dict = None):
        return self._rm._send(cmd, data)

    def _send_and_wait_sync(self, cmd: str, data: dict = None,
                            wait_cmd: str = None,
                            timeout: float = 3.0) -> typing.Optional[dict]:
        return self._rm._send_and_wait_sync(cmd, data, wait_cmd, timeout)

    def _send_and_wait_token(self, cmd: str, data: dict = None,
                             wait_cmd: str = None):
        return self._rm._send_and_wait_token(cmd, data, wait_cmd)

    async def _send_and_wait_async(self, cmd: str, data: dict = None,
                                   wait_cmd: str = None,
                                   timeout: float = 3.0) -> typing.Optional[dict]:
        return await self._rm._send_and_wait_async(cmd, data, wait_cmd, timeout)

