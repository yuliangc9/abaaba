import { EventBus } from './Common';
import { SERVER_ADDRESS } from './ServerConfig'; // 请根据实际路径修改

export type NetworkMessage = {
  type: 'init' | 'click' | 'map';
  data: any;
};

export class NetworkManager {
  private static instance: NetworkManager;
  private ws: WebSocket;

  static getInstance() {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  constructor() {
    this.ws = new WebSocket(SERVER_ADDRESS);
    this.setupListeners();
  }

  private setupListeners() {
    this.ws.addEventListener('message', (event) => {
      try {
        const message: NetworkMessage = JSON.parse(event.data);
        EventBus.emit('network-message', message);
      } catch (error) {
        console.error('Invalid message format:', error);
      }
    });

    this.ws.addEventListener('open', () => {
      console.log('WebSocket connected');
      EventBus.emit('network-connected');
    });
  }

  send(message: NetworkMessage) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // 发送点击事件
  sendClickEvent(pos: { row: number; col: number }) {
    this.send({
      type: 'click',
      data: pos
    });
  }

  sendMapMessage(data: string[][]) {
    this.send({
      type: 'map',
      data: data
    });
  }
}