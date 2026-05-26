// 依赖：RadioRelaySocketClient 实例 `socket`
import {RadioRelaySocketClient} from '../../radio/RadioRelaySocket/client/client';

export const socket = new RadioRelaySocketClient('http://127.0.0.1:60002/UserSide');
