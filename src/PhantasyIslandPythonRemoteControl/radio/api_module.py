"""
API 模块基类。

所有按领域拆分的 API 模块都继承此类，通过 _rm 访问 RadioManager 的底层通信能力。
"""

from __future__ import annotations

import asyncio
import typing

if typing.TYPE_CHECKING:
    from .radio_manager import RadioManager

from typing import Self

from .wait_token import WaitToken

# ---------------------------------------------------------------------------
# SendResult —— 三种发送模式的统一返回类型别名
#
#   sync  模式  →  T | None           （阻塞等待，超时返回 None）
#   token 模式  →  WaitToken[T]       （立即返回令牌，调用方自行 .wait() 或 await）
#   async 模式  →  Coroutine[…]       （需 await，超时返回 None）
#
# 子类的 API 方法使用 ``-> SendResult[具体类型]`` 标注返回值即可。
# 库使用者根据当前 mode 对返回值做类型窄化（isinstance / match）。
# ---------------------------------------------------------------------------
type SendResult[T] = T | None | WaitToken[T] | typing.Coroutine[typing.Any, typing.Any, T | None]

# ---------------------------------------------------------------------------
# 各模式对应的具体返回类型别名（用于明确标注已知模式下的返回值）
# ---------------------------------------------------------------------------
type SyncResult[T] = T | None
type TokenResult[T] = WaitToken[T]
type AsyncResult[T] = typing.Coroutine[typing.Any, typing.Any, T | None]


# ---------------------------------------------------------------------------
# 类型窄化辅助函数 —— 从 SendResult 中安全提取对应模式的返回值
#
# 这些函数同时具备两个作用:
#   1. **静态**: 让类型检查器将 SendResult[T] 窄化为对应模式的精确类型
#   2. **运行时**: 若模式不匹配会立即 raise TypeError，帮助尽早发现 bug
#
# 典型用法::
#
#     api.mode('token')
#     token = as_token(api.listRadioLocalObjects())   # WaitToken[dict]
#     resp  = token.wait(10)
#
#     api.mode('sync')
#     data = as_sync(api.listRadioLocalObjects())      # dict | None
# ---------------------------------------------------------------------------

def as_sync[T](result: SendResult[T]) -> T | None:
    """
    将 ``SendResult[T]`` 窄化为同步模式的返回值 ``T | None``。

    在 ``mode('sync')`` 下使用，提供运行时类型校验 + 静态类型窄化。

    :raises TypeError: 当 result 不是同步结果时
    """
    if isinstance(result, WaitToken):
        raise TypeError(
            f"Expected sync result (T | None), got WaitToken. "
            f"Did you forget to call mode('sync')?"
        )
    if asyncio.iscoroutine(result):
        result.close()  # 避免 RuntimeWarning: coroutine was never awaited
        raise TypeError(
            f"Expected sync result (T | None), got coroutine. "
            f"Did you forget to call mode('sync')?"
        )
    return result  # type: ignore[return-value]


def as_token[T](result: SendResult[T]) -> WaitToken[T]:
    """
    将 ``SendResult[T]`` 窄化为令牌模式的返回值 ``WaitToken[T]``。

    在 ``mode('token')`` 下使用，提供运行时类型校验 + 静态类型窄化。

    :raises TypeError: 当 result 不是 WaitToken 时
    """
    if not isinstance(result, WaitToken):
        raise TypeError(
            f"Expected WaitToken, got {type(result).__name__}. "
            f"Did you forget to call mode('token')?"
        )
    return result


def as_awaitable[T](result: SendResult[T]) -> typing.Coroutine[typing.Any, typing.Any, T | None]:
    """
    将 ``SendResult[T]`` 窄化为异步模式的返回值 ``Coroutine[..., T | None]``。

    在 ``mode('async')`` 下使用，提供运行时类型校验 + 静态类型窄化。

    :raises TypeError: 当 result 不是协程时
    """
    if not asyncio.iscoroutine(result):
        raise TypeError(
            f"Expected coroutine, got {type(result).__name__}. "
            f"Did you forget to call mode('async')?"
        )
    return result  # type: ignore[return-value]


class ApiModule:
    """
    API 子模块的基类。

    子类只需关注"业务指令"的封装，底层的发送 / 等待 / 分发
    全部委托给 RadioManager 完成。

    用法::

        class SceneApi(ApiModule):
            def get_init_state(self) -> SendResult[dict]:
                return self.send('scene.getInitState')

    类型窄化用法::

        api.mode('token')
        token = as_token(api.some_method())   # WaitToken[dict]
        token.wait(10)

        api.mode('sync')
        data = as_sync(api.some_method())     # dict | None
    """

    __slots__ = ('_rm', 'send', '_now_mode')

    def __init__(self, rm: 'RadioManager') -> None:
        self._rm = rm
        self._now_mode = 'sync'
        self.send = self._send_and_wait_sync
        self.mode('sync')
        pass

    def mode(self, mode: str) -> Self:
        """
        切换发送模式并返回 ``self``（支持链式调用），mode 可选值：

            - ``'sync'``:  同步模式，调用后会阻塞直到收到响应
            - ``'async'``: 异步模式，调用后立即返回一个 Coroutine，需 await
            - ``'token'``: 令牌模式，调用后立即返回一个 WaitToken，后续可 .wait() 或 await

        配合窄化函数使用，可获得完善的类型提示::

            api.mode('token')
            token = as_token(api.some_method())   # WaitToken[dict]

        :return: self（支持链式调用）
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
        return self

    def get_now_mode(self) -> str:
        return self._now_mode

    # ---- 便捷代理，子类直接调用即可 ----

    def _send(self, cmd: str, data: dict = None) -> None:
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
                             ) -> WaitToken[dict]:
        return self._rm._send_and_wait_token(cmd, data, wait_cmd, post_processor=post_processor)

    async def _send_and_wait_async(self, cmd: str, data: dict = None,
                                   wait_cmd: str = None,
                                   timeout: float = 3.0,
                                   post_processor: typing.Callable[[dict], typing.Any] = None,
                                   ) -> typing.Optional[dict]:
        return await self._rm._send_and_wait_async(cmd, data, wait_cmd, timeout, post_processor=post_processor)
