import { _decorator, Component, UITransform, Prefab, instantiate, Node } from 'cc';
const { ccclass, property } = _decorator;
import { Field } from './Field';
import { Player } from './Player';
import { Bean, BeanType } from './Bean';
import { EventBus, Common } from './Common';

@ccclass('Beans')
export class Beans extends Component {
  @property({ type: Prefab })
  beanPrefab: Prefab = null!;

  @property({ type: Field })
  field: Field = null!;

  @property({ type: Player })
  player: Player = null!;

  start() {
    this.init();
    EventBus.on('player-come', this.removeBean, this);
  }
  
  init() {
    let rows = this.field.gridRows;
    let cols = this.field.gridColumns;
    let excludePositions: { row: number; col: number }[] = [
      { row: this.player.startRow, col: this.player.startCol }
    ];
    Common.initBeansMap(rows, cols);
    this.generateBeans(rows, cols, excludePositions);
  }

  private generateBeans(rows: number, cols: number, excludePositions: { row: number; col: number }[]) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!excludePositions.some(p => p.row === row && p.col === col)) {
          const beanNode = instantiate(this.beanPrefab);
            // 修复方案：手动实现 Object.values 功能
            const types: BeanType[] = [];
            for (const key in BeanType) {
                if (Object.prototype.hasOwnProperty.call(BeanType, key)) {
                    types.push(BeanType[key]);
                }
            }
          const randomType = types[Math.floor(Math.random() * types.length)];
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
  }

    removeBean(pos: { row: number; col: number }): boolean {
    console.log('removeBean', pos);
    const bean = Common.getBeanAt(pos.row, pos.col);
    if (bean) {
      //bean.destroy(); // 在player的三消逻辑中删除bean
      Common.rmBeanAt(pos.row, pos.col);
      this.player.eat(bean); // 假设 Bean 组件有 getEnergy 方法来获取能量值
      return true;
    }
    return false;
  }
}