import asyncio
import threading
import weakref
from typing import Optional

import socketio

from .wait_token import WaitToken


class RadioManager:
    socketio: socketio.Client
    namespace: str

    scene_is_init: bool

    _pending_waiters: dict  # wait_cmd -> list[weakref.ref[WaitToken]]
    _waiters_lock: threading.Lock

    def __init__(self):
        self.socketio = socketio.Client()
        self.namespace = '/UserSide'
        self.scene_is_init = False
        self._pending_waiters = {}
        self._waiters_lock = threading.Lock()
        pass

    def connect(self, url='http://127.0.0.1:60002', namespace='/UserSide'):
        self.namespace = namespace
        self.reset()
        # 必须在 connect 之前注册事件监听器，否则 wait=True 阻塞后 on('connect') 不会触发
        self._init_listener()
        self.socketio.connect(url, namespaces=[namespace], retry=True, wait=True)
        pass

    def reset(self):
        if self.socketio.connected:
            self.socketio.disconnect()
        self.scene_is_init = False
        pass

    def _init_listener(self):
        ns = self.namespace

        # 等价于 JS 的 socket.on('connect', () => { ... })
        @self.socketio.on('connect', namespace=ns)
        def on_connect():
            print('[RadioManager] connected')
            self._check_scene_status()

        # 等价于 JS 的 socket.on('disconnect', () => { ... })
        @self.socketio.on('disconnect', namespace=ns)
        def on_disconnect():
            print('[RadioManager] disconnected')
            self.scene_is_init = False

        # 等价于 JS 的 socket.on('message', (data) => { ... })
        @self.socketio.on('message', namespace=ns)
        def on_message(data):
            print(f'[RadioManager] message: {data}')
            self.msg_dispatch(data)

        pass

    def _check_scene_status(self):
        # 等价于 JS 的 socket.emit('check_scene_status', data)
        # self.socketio.emit('check_scene_status', {}, namespace=self.namespace)
        self.ping()
        self._send('scene.getInitState')
        pass

    def ping(self):
        self._send('ping')
        pass

    def _send(self, cmd: str, data: tuple = None):
        # 等价于 JS 的 socket.emit('message', data)
        msg = {'cmd': cmd}
        if data:
            msg.update(data)
        self.socketio.emit('message', msg, namespace=self.namespace)
        pass

    # ---- 请求-响应: 核心 ----

    def _send_with_token(self, cmd: str, data: tuple = None,
                         wait_cmd: str = None) -> WaitToken:
        """
        发送命令并返回一个 WaitToken，调用方自行决定如何等待。

        RadioManager 仅持有 token 的弱引用；当调用方丢弃 token 时，
        弱引用自动失效，不会在本类中累积状态。

        :param cmd:      要发送的命令
        :param data:     附加数据
        :param wait_cmd: 期望的响应命令名，默认等同于 cmd
        :return:         WaitToken 实例
        """
        if wait_cmd is None:
            wait_cmd = cmd

        token = WaitToken(wait_cmd)

        # 注册弱引用（先注册再发送，避免响应在注册前到达）
        ref = weakref.ref(token)
        with self._waiters_lock:
            self._pending_waiters.setdefault(wait_cmd, []).append(ref)

        self._send(cmd, data)
        return token

    # ---- 请求-响应: 便捷方法 ----

    def _send_and_wait_sync(self, cmd: str, data: tuple = None,
                            wait_cmd: str = None,
                            timeout: float = 3.0) -> Optional[dict]:
        """
        发送命令并同步阻塞等待响应。

        :return: 响应 dict，超时返回 None
        """
        token = self._send_with_token(cmd, data, wait_cmd)
        return token.wait(timeout=timeout)

    def _send_and_wait_token(self, cmd: str, data: tuple = None,
                            wait_cmd: str = None) -> Optional[dict]:
        """
        发送命令并同步阻塞等待响应。

        :return: WaitToken 实例，调用方可自行决定如何等待
        """
        token = self._send_with_token(cmd, data, wait_cmd)
        return token
        # return token.wait(timeout=timeout)

    async def _send_and_wait_async(self, cmd: str, data: tuple = None,
                                   wait_cmd: str = None,
                                   timeout: float = 3.0) -> Optional[dict]:
        """
        发送命令并异步等待响应。

        :return: 响应 dict，超时返回 None
        """
        token = self._send_with_token(cmd, data, wait_cmd)
        try:
            return await asyncio.wait_for(token, timeout=timeout)
        except asyncio.TimeoutError:
            return None

    # ---- 弱引用分发 ----

    def _notify_waiters(self, cmd: str, data: dict) -> bool:
        """
        尝试唤醒第一个仍存活且正在等待 cmd 的 WaitToken。
        顺便清理已被 GC 回收的死引用。

        :return: True 表示有 token 被唤醒，False 表示无人等待
        """
        with self._waiters_lock:
            refs = self._pending_waiters.get(cmd)
            if not refs:
                return False

            surviving = []
            matched = False
            for ref in refs:
                token = ref()
                if token is None:
                    continue          # 已被 GC，跳过
                if not matched:
                    token._complete(data)
                    matched = True     # 只唤醒第一个，不保留到 surviving
                else:
                    surviving.append(ref)

            if surviving:
                self._pending_waiters[cmd] = surviving
            else:
                self._pending_waiters.pop(cmd, None)

            return matched

    def msg_dispatch(self, data):
        cmd = data.get('cmd', '')

        # 优先唤醒正在同步/异步等待此 cmd 的调用者
        if self._notify_waiters(cmd, data):
            return

        match cmd:
            case 'pong':
                pass
            case 'sceneReset':
                self._on_scene_reset(data)
            case 'sceneNotInit':
                self._on_scene_reset(data)
            case 'sceneInit':
                self._on_scene_init(data)
            case 'sceneIsInit':
                self._on_scene_init(data)
            case _:
                print(f'[RadioManager] unknown cmd: {cmd}, data: {data}')

    # ---- cmd handlers ----

    def _on_scene_reset(self, data):
        print(f'[RadioManager] handle sceneReset: {data}')
        self.scene_is_init = False

    def _on_scene_init(self, data):
        print(f'[RadioManager] handle sceneInit: {data}')
        self.scene_is_init = True


if __name__ == '__main__':
    rm = RadioManager()
    rm.connect()

    # 保持连接，持续接收服务端消息（Ctrl+C 退出）
    rm.socketio.wait()
