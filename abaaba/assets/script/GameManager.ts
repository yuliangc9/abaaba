import { _decorator, Component, Label } from 'cc';
import { PlayerController } from './PlayerController';
import { Bean, BeanType } from './Bean';
import { Node } from 'cc';
import { SlotComponent } from './SlotComponent';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Label)
    countLabel: Label = null!;
    
    @property(Label)
    winLabel: Label = null!;

    @property([Node])
    slotNodes: Node[] = [];

    // 为了解决找不到 PlayerController 的问题，需要引入 PlayerController 类。
    // 假设 PlayerController 类定义在同级目录下的 PlayerController.ts 文件中
    @property(Node)
    player: Node = null!;

    private _remainingBeans = 0;
    private currentSlots: (BeanType | null)[] = [null, null, null, null, null];
    private readonly MAX_SLOTS = 5;
    private _totalEnergy = 20;

    // 新增：减少能量方法
    public decreaseEnergy(amount: number) : number{
        this._totalEnergy = Math.max(0, this._totalEnergy - amount);
        this.updateCountLabel();
        return this._totalEnergy
    }

    start() {
        this.initSlots();
        this.winLabel.node.active = false;
        this.updateCountLabel();
    }

    public beanEaten(beanType: BeanType, energy: number) {
        console.log('剩余豆豆数量:', this._remainingBeans);
        this._remainingBeans--;
        this.addEnergy(energy);
        
        console.log('更新后剩余:', this._remainingBeans);
        if (this._remainingBeans <= 0) {
            console.log('触发胜利条件');
            this.showWin();
        }

        this.addToSlot(beanType);
    }

    public setTotalBeans(count: number) {
        this._remainingBeans = count;
    }

    private updateCountLabel() {
        this.countLabel.string = `能量: ${Math.floor(this._totalEnergy)}`;
    }

    private initSlots() {
        this.currentSlots.fill(null);
    }

    private showWin() {
        this.winLabel.node.active = true;
        this.winLabel.string = '游戏胜利！';
        this.scheduleOnce(() => {
            window.location.reload();
        }, 2);
    }

    public addToSlot(beanType: BeanType) {
        const emptyIndex = this.currentSlots.indexOf(null);
        if (emptyIndex === -1) {
            if (this.player) {
            this.player.getComponent(PlayerController)?.setMovementEnabled(false);
        } else {
            console.warn('Player node is not assigned in GameManager');
        }
            return false;
        }

        this.currentSlots[emptyIndex] = beanType;
        this.updateSlotDisplay(emptyIndex, beanType);
        this.checkCombination();
        return true;
    }

    private updateSlotDisplay(index: number, beanType: BeanType) {
        const slotNode = this.slotNodes[index];
        if (slotNode) {
            const slotComp = slotNode.getComponent(SlotComponent);
            if (slotComp) {
                slotComp.showBean(beanType); 
            }
        }
    }

    private checkCombination() {
        const typeCounts = new Map<BeanType, number>();
        
        // 统计所有槽位类型
        this.currentSlots.forEach(type => {
            if (type !== null) {
                typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
            }
        });

        // 遍历找到需要消除的类型
        typeCounts.forEach((count, type) => {
            if (count >= 3) {
                this.clearSlotsByType(type);
            }
        });
    }

    private clearSlotsByType(targetType: BeanType) {
        // 清除所有匹配类型的槽位
        this.currentSlots.forEach((type, index) => {
            if (type === targetType) {
                this.currentSlots[index] = null;
                const slotNode = this.slotNodes[index];
                if (slotNode) {
                    const slotComp = slotNode.getComponent(SlotComponent);
                    slotComp?.playClearAnimation(() => {});
                }
            }
        });
        
        // 恢复玩家移动
        this.player.getComponent(PlayerController)?.setMovementEnabled(true);
    }

    public addEnergy(energy: number) {
        this._totalEnergy += energy;
        console.log('当前累计能量:', this._totalEnergy);
        this.updateCountLabel();
    }

    public getCurrentEnergy() {
      return this._totalEnergy;
    }
}