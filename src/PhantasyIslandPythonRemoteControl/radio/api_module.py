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

    __slots__ = ('_rm', 'send', '_now_mode')

    def __init__(self, rm: 'RadioManager') -> None:
        self._rm = rm
        self._now_mode = 'sync'
        self.send = self._send_and_wait_sync
        self.mode('sync')
        pass

    def mode(self, mode: str):
        """
        切换发送模式，mode 可选值：
            - 'sync': 同步模式，调用后会阻塞直到收到响应
            - 'async': 异步模式，调用后立即返回一个 Future 对象
            - 'token': 令牌模式，调用后立即返回一个令牌字符串，后续可通过 wait_token 等待响应
        """
        if mode == 'sync':
            self.send = self._send_and_wait_sync
            self._now_mode = 'sync'
        elif mode == 'async':
            self.send = self._send_and_wait_async
            self._now_mode = 'async'
        elif mode == 'token':
            self.send = self._send_and_wait_token
            self._now_mode = 'token'
        else:
            raise ValueError(f"Invalid mode: {mode}")

    def get_now_mode(self):
        return self._now_mode

    # ---- 便捷代理，子类直接调用即可 ----

    def _send(self, cmd: str, data: dict = None):
        return self._rm._send(cmd, data)

    def _send_and_wait_sync(self, cmd: str, data: dict = None,
                            wait_cmd: str = None,
                            timeout: float = 3.0,
                            post_processor: typing.Callable[[dict], typing.Any] = None,
                            ) -> typing.Optional[dict]:
        return self._rm._send_and_wait_sync(cmd, data, wait_cmd, timeout, post_processor=post_processor)

    def _send_and_wait_token(self, cmd: str, data: dict = None,
                             wait_cmd: str = None,
                             post_processor: typing.Callable[[dict], typing.Any] = None,
                             ):
        return self._rm._send_and_wait_token(cmd, data, wait_cmd, post_processor=post_processor)

    async def _send_and_wait_async(self, cmd: str, data: dict = None,
                                   wait_cmd: str = None,
                                   timeout: float = 3.0,
                                   post_processor: typing.Callable[[dict], typing.Any] = None,
                                   ) -> typing.Optional[dict]:
        return await self._rm._send_and_wait_async(cmd, data, wait_cmd, timeout, post_processor=post_processor)
