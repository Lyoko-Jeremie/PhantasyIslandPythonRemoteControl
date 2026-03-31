"""
API 模块基类。

所有按领域拆分的 API 模块都继承此类，通过 _rm 访问 RadioManager 的底层通信能力。
"""

from __future__ import annotations

import typing

if typing.TYPE_CHECKING:
    from .radio_manager import RadioManager

T_Mode = typing.TypeVar('T_Mode')


class _SyncSentinel:
    pass


class _AsyncSentinel:
    pass


class _TokenSentinel:
    pass


SyncMode = _SyncSentinel
AsyncMode = _AsyncSentinel
TokenMode = _TokenSentinel


class ApiModule(typing.Generic[T_Mode]):
    """
    API 子模块的基类。

    子类只需关注"业务指令"的封装，底层的发送 / 等待 / 分发
    全部委托给 RadioManager 完成。

    用法::

        class SceneApi(ApiModule):
            def get_init_state(self):
                return self.send('scene.getInitState')

    通过 mode() 切换返回模式，类型检查器可自动推导 send 的返回类型::

        api = scene_api.mode('sync')   # ApiModule[SyncMode]
        result = api.send(...)         # -> Optional[dict]

        api = scene_api.mode('async')  # ApiModule[AsyncMode]
        result = await api.send(...)   # -> Optional[dict]

        api = scene_api.mode('token')  # ApiModule[TokenMode]
        token = api.send(...)          # -> str
    """

    __slots__ = ('_rm', '_mode')

    def __init__(self, rm: 'RadioManager') -> None:
        self._rm = rm
        self._mode: typing.Literal['sync', 'async', 'token'] = 'sync'

    @typing.overload
    def mode(self, mode: typing.Literal['sync']) -> ApiModule[SyncMode]:
        ...

    @typing.overload
    def mode(self, mode: typing.Literal['async']) -> ApiModule[AsyncMode]:
        ...

    @typing.overload
    def mode(self, mode: typing.Literal['token']) -> ApiModule[TokenMode]:
        ...

    def mode(self, mode: typing.Literal['sync', 'async', 'token']) -> typing.Any:
        """
        切换发送模式，返回 self（类型已缩窄）。

        mode 可选值：
            - 'sync': 同步模式，调用后会阻塞直到收到响应
            - 'async': 异步模式，调用后返回可 await 的协程
            - 'token': 令牌模式，调用后立即返回一个令牌字符串
        """
        if mode not in ('sync', 'async', 'token'):
            raise ValueError(f"Invalid mode: {mode}")
        self._mode = mode
        return self  # type: ignore[return-value]

    # ---- send: 根据 T_Mode 类型参数，类型检查器选择对应的 overload ----

    # 注意：运行时只有最后一个非 @overload 的定义生效，
    # @overload 仅供类型检查器使用。

    @typing.overload
    def send(self: ApiModule[SyncMode],
             cmd: str, data: dict = ...,
             wait_cmd: str = ...,
             timeout: float = ...,
             post_processor: typing.Callable[[dict], typing.Any] = ...,
             ) -> typing.Optional[dict]:
        ...

    @typing.overload
    def send(self: ApiModule[AsyncMode],
             cmd: str, data: dict = ...,
             wait_cmd: str = ...,
             timeout: float = ...,
             post_processor: typing.Callable[[dict], typing.Any] = ...,
             ) -> typing.Coroutine[typing.Any, typing.Any, typing.Optional[dict]]:
        ...

    @typing.overload
    def send(self: ApiModule[TokenMode],
             cmd: str, data: dict = ...,
             wait_cmd: str = ...,
             post_processor: typing.Callable[[dict], typing.Any] = ...,
             ) -> str:
        ...

    def send(self, cmd: str, data: dict = None,
             wait_cmd: str = None,
             timeout: float = 3.0,
             post_processor: typing.Callable[[dict], typing.Any] = None,
             ) -> typing.Any:
        if self._mode == 'sync':
            return self._send_and_wait_sync(cmd, data, wait_cmd, timeout, post_processor=post_processor)
        elif self._mode == 'async':
            return self._send_and_wait_async(cmd, data, wait_cmd, timeout, post_processor=post_processor)
        elif self._mode == 'token':
            return self._send_and_wait_token(cmd, data, wait_cmd, post_processor=post_processor)
        else:
            raise ValueError(f"Invalid mode: {self._mode}")

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
