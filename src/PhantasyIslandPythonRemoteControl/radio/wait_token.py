"""
轻量级的请求-响应等待令牌。

每次调用 _send_and_wait_* 时生成一个 WaitToken 实例。
调用方持有强引用，RadioManager 仅持有弱引用。
当调用方丢弃令牌（或对端静默重启导致无人关心旧令牌），
弱引用自动失效，不会在 RadioManager 中累积状态。
"""

import asyncio
import threading
from typing import Optional


class WaitToken:
    """
    一次请求对应的小状态机。

    同步用法::

        token = rm._send_with_token('ping', wait_cmd='pong')
        resp = token.wait(timeout=5.0)

    异步用法::

        token = rm._send_with_token('ping', wait_cmd='pong')
        resp = await asyncio.wait_for(token, timeout=5.0)
    """

    __slots__ = ('wait_cmd', 'time_base_id', 'response', '_event', '_future', '_loop', '__weakref__')

    def __init__(self, wait_cmd: str, time_base_id: int):
        self.wait_cmd: str = wait_cmd
        self.time_base_id: int = time_base_id
        self.response: Optional[dict] = None
        self._event = threading.Event()
        self._future: Optional[asyncio.Future] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None

    # ---------- 状态查询 ----------

    @property
    def done(self) -> bool:
        """令牌是否已收到响应。"""
        return self._event.is_set()

    # ---------- 由 RadioManager 在 socket.io 线程调用 ----------

    def complete(self, data: dict) -> None:
        """
        填充响应并唤醒所有等待者（sync Event + async Future）。
        此方法由 socket.io 监听线程调用，必须线程安全。
        """
        self.response = data
        self._event.set()
        if self._future is not None and self._loop is not None:
            try:
                self._loop.call_soon_threadsafe(self._resolve_future, data)
            except RuntimeError:
                pass  # event loop 已关闭

    def _resolve_future(self, data: dict) -> None:
        """在事件循环线程安全地设置 Future 结果。"""
        if self._future is not None and not self._future.done():
            self._future.set_result(data)

    # ---------- 同步等待 ----------

    def wait(self, timeout: float = 3.0) -> Optional[dict]:
        """
        阻塞当前线程直到收到响应或超时。

        :param timeout: 超时秒数
        :return: 响应 dict，超时返回 None
        """
        self._event.wait(timeout=timeout)
        return self.response

    # ---------- 异步等待 (await token) ----------

    def _get_future(self) -> asyncio.Future:
        """
        获取（或创建）一个绑定到当前事件循环的 Future。
        必须在 async 上下文中调用。
        """
        loop = asyncio.get_running_loop()
        self._loop = loop
        self._future = loop.create_future()
        # 若在创建 Future 之前已经完成，直接设置结果
        if self._event.is_set() and not self._future.done():
            self._future.set_result(self.response)
        return self._future

    def __await__(self):
        return self._get_future().__await__()

    # ---------- repr ----------

    def __repr__(self):
        status = 'done' if self.done else 'pending'
        return f'<WaitToken cmd={self.wait_cmd!r} {status}>'
