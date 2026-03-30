import socketio


class RadioManager:
    socketio: socketio.Client
    namespace: str

    scene_is_init: bool

    def __init__(self):
        self.socketio = socketio.Client()
        self.namespace = '/UserSide'
        self.scene_is_init = False
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

    def msg_dispatch(self, data):
        cmd = data.get('cmd', '')
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
