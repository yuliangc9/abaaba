import { _decorator, Component, UITransform, Prefab, instantiate, Node } from 'cc';
const { ccclass, property } = _decorator;
import { Field } from './Field';
import { Player } from './Player';
import { Bean, BeanType } from './Bean';
import { EventBus, Common } from './Common';
import { NetworkMessage, NetworkManager } from './Network';

@ccclass('Beans')
export class Beans extends Component {
  @property({ type: Prefab })
  beanPrefab: Prefab = null!;

  @property({ type: Field })
  field: Field = null!;

  @property({ type: Player })
  player: Player = null!;

  @property({ type: Player })
  opp: Player = null!;

  start() {
    this.init();
    EventBus.on('player-come', this.removeBean, this);
  }
  
  init() {
    let rows = this.field.gridRows;
    let cols = this.field.gridColumns;
    Common.initBeansMap(rows, cols);

    EventBus.on('network-message', this.handleNetworkMessage, this);
  }

  private handleNetworkMessage(msg: NetworkMessage) {
    switch (msg.type) {
        case 'init':
            if (msg.data.isGuest) {
              let excludePositions: { row: number; col: number }[] = [
                { row: this.player.startRow, col: this.player.startCol },
                { row: this.field.gridRows - 1- msg.data.row, col: this.field.gridColumns - 1 - msg.data.col }
              ];
              this.generateBeans(this.field.gridRows, this.field.gridColumns, excludePositions, null);
            }
            break;
        case 'map':
          let originalMap = msg.data as string[][];
          // 深拷贝并执行行列翻转
          let flippedMap = JSON.parse(JSON.stringify(originalMap)) as string[][];
          // 行翻转（反转每行元素）
          flippedMap.forEach(row => row.reverse());
          // 列翻转（反转整个数组的行顺序）
          flippedMap.reverse();
          let excludePositions: { row: number; col: number }[] = [];
          this.generateBeans(this.field.gridRows, this.field.gridColumns, excludePositions, flippedMap);
          break;
        }
    }

  private generateBeans(rows: number, cols: number, excludePositions: { row: number; col: number }[], initMap: string[][]|null) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!excludePositions.some(p => p.row === row && p.col === col) || !(initMap && initMap[row][col] !== '')) {
          const beanNode = instantiate(this.beanPrefab);
            // 修复方案：手动实现 Object.values 功能
            const types: BeanType[] = [];
            for (const key in BeanType) {
                if (Object.prototype.hasOwnProperty.call(BeanType, key)) {
                    types.push(BeanType[key]);
                }
            }
          let randomType = types[Math.floor(Math.random() * types.length)];
          if(initMap) {
            randomType = BeanType[initMap[row][col]];
          }
          beanNode.getComponent(Bean).init(randomType);
          Common.setBeanAt(row, col, beanNode);
          this.node.addChild(beanNode);
          beanNode.setPosition(this.field.getGridPosition(row, col));

          const cellSize = this.field.cellSize;
        
          const playerUITrans = beanNode.getComponent(UITransform) || this.node.addComponent(UITransform);
          playerUITrans.width = cellSize;
          playerUITrans.height = cellSize;

            // 添加点击事件
            beanNode.on(Node.EventType.TOUCH_END, () => {
                EventBus.emit('cell-clicked', { row, col });
            });
        }
      }
    }
    if (!initMap) {
      NetworkManager.getInstance().sendMapMessage(Common.serializeBeansMap());
    }
  }

    removeBean(pos: { row: number; col: number }, role: Player): boolean {
    console.log('removeBean', pos);
    const bean = Common.getBeanAt(pos.row, pos.col);
    if (bean) {
      //bean.destroy(); // 在player的三消逻辑中删除bean
      Common.rmBeanAt(pos.row, pos.col);
      role.eat(bean); // 假设 Bean 组件有 getEnergy 方法来获取能量值
      return true;
    }
    return false;
  }
}