"""
调试 / 连通性 相关 API 模块。
"""

from __future__ import annotations

from .api_module import ApiModule, SendResult


class DebugApi(ApiModule):
    """
    调试与连通性指令集。

    通过 ``rm.debug`` 访问::

        rm.debug.ping()
    """

    def ping(self) -> SendResult[dict]:
        """Ping 远端，等待 pong 回复。"""
        return self.send('ping', wait_cmd='pong')

