"""
轻量级的请求-响应等待令牌。

每次调用 _send_and_wait_* 时生成一个 WaitToken 实例。
调用方持有强引用，RadioManager 仅持有弱引用。
当调用方丢弃令牌（或对端静默重启导致无人关心旧令牌），
弱引用自动失效，不会在 RadioManager 中累积状态。
"""

import asyncio
import threading
from typing import Any, Callable, Optional


class WaitToken:
    """
    一次请求对应的小状态机。

    同步用法::

        token = rm._send_with_token('ping', wait_cmd='pong')
        resp = token.wait(timeout=5.0)

    异步用法::

        token = rm._send_with_token('ping', wait_cmd='pong')
        resp = await asyncio.wait_for(token, timeout=5.0)

    后处理用法::

        token = rm._send_with_token('ping', wait_cmd='pong')
        token.set_post_processor(lambda data: data['value'])
        resp = token.wait(timeout=5.0)  # 返回后处理结果
        token.response          # 原始响应
        token.processed_response  # 后处理结果
    """

    __slots__ = (
        'wait_cmd', 'time_base_id', 'response', 'processed_response',
        '_event', '_future', '_loop', '_post_processor', '__weakref__',
    )

    def __init__(self, wait_cmd: str, time_base_id: int):
        self.wait_cmd: str = wait_cmd
        self.time_base_id: int = time_base_id
        self.response: Optional[dict] = None
        self.processed_response: Any = None
        self._event = threading.Event()
        self._future: Optional[asyncio.Future] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._post_processor: Optional[Callable[[dict], Any]] = None

    # ---------- 状态查询 ----------

    @property
    def done(self) -> bool:
        """令牌是否已收到响应。"""
        return self._event.is_set()

    # ---------- 后处理回调 ----------

    def set_post_processor(self, processor: Callable[[dict], Any]) -> 'WaitToken':
        """
        注册后处理回调。当收到 response 后，会自动调用此回调进行数据格式转换。

        - ``response``   保存原始数据
        - ``processed_response`` 保存转换后的数据
        - ``wait()`` / ``await token`` 返回的是转换后的数据

        :param processor: 接收原始 response dict，返回任意转换结果的可调用对象
        :return: self（支持链式调用）
        """
        self._post_processor = processor
        return self

    def _apply_post_processor(self, data: dict) -> Any:
        """对原始数据执行后处理，返回处理后的结果并存入 processed_response。"""
        if self._post_processor is not None:
            result = self._post_processor(data)
        else:
            result = data
        self.processed_response = result
        return result

    # ---------- 由 RadioManager 在 socket.io 线程调用 ----------

    def complete(self, data: dict) -> None:
        """
        填充响应并唤醒所有等待者（sync Event + async Future）。
        此方法由 socket.io 监听线程调用，必须线程安全。
        """
        self.response = data
        result = self._apply_post_processor(data)
        self._event.set()
        if self._future is not None and self._loop is not None:
            try:
                self._loop.call_soon_threadsafe(self._resolve_future, result)
            except RuntimeError:
                pass  # event loop 已关闭

    def _resolve_future(self, data) -> None:
        """在事件循环线程安全地设置 Future 结果。"""
        if self._future is not None and not self._future.done():
            self._future.set_result(data)

    # ---------- 同步等待 ----------

    def wait(self, timeout: float = 3.0) -> Optional[Any]:
        """
        阻塞当前线程直到收到响应或超时。

        :param timeout: 超时秒数
        :return: 后处理结果（若未注册后处理则为原始 dict），超时返回 None
        """
        self._event.wait(timeout=timeout)
        if self.response is None:
            return None
        return self.processed_response

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
            self._future.set_result(self.processed_response)
        return self._future

    def __await__(self):
        return self._get_future().__await__()

    # ---------- repr ----------

    def __repr__(self):
        status = 'done' if self.done else 'pending'
        return f'<WaitToken cmd={self.wait_cmd!r} {status}>'
