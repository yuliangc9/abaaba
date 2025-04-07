import { _decorator, Component, Node, tween, Vec3, UITransform } from 'cc';
import { Field } from './Field';
import { Label } from 'cc';
import { EventBus, Common } from './Common';
import { NetworkManager } from './Network';
import { Bean, BeanType } from './Bean'; // 请根据实际路径调整导入语句
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property({ type: Number })
    moveInterval = 0.5;

    private pathQueue: { row: number; col: number }[] = [];
    private currentRow = 0;
    private currentCol = 0;
    private currentTween: any = null;
    private _totalEnergy: number = 0;
    @property({ type: Number })
    moveDuration = 0.5;

    @property({ type: Field })
    field: Field = null!;

    @property({ type: Number })
    startRow = 0;

    @property({ type: Number })
    startCol = 0;

    @property(Label)
    energyLabel: Label = null!;

    @property({ type: Node })
    boxes: Node[] = [];

    @property({ type: Boolean })
    isLocal: Boolean = true;

    private targetRow: number = 0;
    private targetCol: number = 0;

    start() {
        if (this.isLocal) {
            this.initPos(this.startRow, this.startCol);
            EventBus.on('network-connected', this.handleNetworkConnected, this);
        }
        EventBus.on('network-message', this.handleNetworkMessage, this);
    }

    private handleNetworkConnected() {
        console.log('network connected');
        NetworkManager.getInstance().send({
            type: 'init',
            data: {
                row: this.startRow,
                col: this.startCol
            }
        });
    }

    private handleNetworkMessage(msg: any) {
        switch (msg.type) {
            case 'click':
                if (this.isLocal) {
                    return;
                }
                this.targetRow = this.field.gridRows - msg.data.row - 1;
                this.targetCol = this.field.gridColumns - 1 - msg.data.col;
                break;
            case 'init':
                if (this.isLocal) {
                    EventBus.on('cell-clicked', this.onCellClicked, this);
                } else {
                    this.initPos(this.field.gridRows - 1- msg.data.row, this.field.gridColumns - 1 - msg.data.col);
                }
                break;
        }
    }

    private onCellClicked(pos: { row: number; col: number }) {
        this.targetRow = pos.row;
        this.targetCol = pos.col;
        
        if (this.isLocal) {
            NetworkManager.getInstance().sendClickEvent(pos);
        }
    }

    private checkTargetCell() {
        if (this.isAllBoxFull()) {
            this.pathQueue = [];
            return;
        }
        const path = this.calculatePath({ row: this.targetRow, col: this.targetCol});
        if (path.length > 0) {
            this.pathQueue = path;
        }
    }

    private calculatePath(target: { row: number; col: number }): { row: number; col: number }[] {
        const queue: { pos: { row: number; col: number }, path: any[] }[] = [
            { pos: { row: this.currentRow, col: this.currentCol }, path: [] }
        ];
        const visited = new Set();

        while (queue.length > 0) {
            const current = queue.shift()!;
            const key = `${current.pos.row},${current.pos.col}`;

            if (visited.has(key)) continue;
            visited.add(key);

            if (current.pos.row === target.row && current.pos.col === target.col) {
                return current.path.concat(current.pos);
            }

            for (const neighbor of this.field.getNeighbors(current.pos.row, current.pos.col)) {
                    if (Common.getBeanAt(neighbor.row, neighbor.col) != null && (neighbor.row !== target.row || neighbor.col !== target.col)) {
                        continue;
                    }
                if (!visited.has(`${neighbor.row},${neighbor.col}`)) {
                    queue.push({
                        pos: neighbor,
                        path: current.path.concat(current.pos)
                    });
                }
            }
        }
        return [];
    }

    private timer: any = null;
    private scheduleMovement() {
        if (this.timer) clearInterval(this.timer);

        let tmpTargetRow = 0;
        let tmpTargetCol = 0;
        this.timer = setInterval(() => {
            if (tmpTargetCol != this.targetCol || tmpTargetRow != this.targetRow) {
                tmpTargetCol = this.targetCol;
                tmpTargetRow = this.targetRow;
                this.checkTargetCell();
            }
            if (this.pathQueue.length > 0) {
                const next = this.pathQueue.shift();
                if (next) {
                    this.moveToCell(next.row, next.col);
                }
            }
        }, this.moveInterval * 1000);
    }

    private moveToCell(row: number, col: number) {
        if (this.currentTween) {
            this.currentTween.stop();
        }
        
        const targetPos = this.field.getGridPosition(row, col);
        this.currentTween = tween(this.node)
            .to(this.moveDuration, { position: targetPos })
            .call(() => {
                this.currentRow = row;
                this.currentCol = col;
                console.log(`移动到格子: 行 ${row}, 列 ${col}`);
                EventBus.emit('player-come', { row, col }, this);
            })
            .start();
    }

    private checkAndClearMatchingBeans() {
        const typeCount = new Map<BeanType, number>();
        const allBeans: Bean[] = [];

        // 统计所有box中的bean类型
        this.boxes.forEach(box => {
            box.children.forEach(child => {
                const bean = child.getComponent(Bean);
                if (bean) {
                    allBeans.push(bean);
                    typeCount.set(bean.type, (typeCount.get(bean.type) || 0) + 1);
                }
            });
        });

        // 找出需要清除的类型
        const clearTypes = Array.from(typeCount.entries())
            .filter(([type, count]) => count >= 3)
            .map(([type]) => type);

        // 清除匹配的bean
        clearTypes.forEach(type => {
            let clearedCount = 0;
            const toRemove: Bean[] = [];

            // 收集前3个匹配的bean
            allBeans.forEach(bean => {
                if (clearedCount < 3 && bean.type === type) {
                    toRemove.push(bean);
                    clearedCount++;
                }
            });

            // 执行清除操作
            let doubleEnergy = 0;
            toRemove.forEach(bean => {
                doubleEnergy += bean.getEnergy();
                // 从父节点移除并销毁
                const parent = bean.node.parent;
                if (parent) {
                    parent.removeChild(bean.node);
                    bean.node.destroy();
                }
            });
            // 更新总能量（假设每个bean能量为1）
            this._totalEnergy += doubleEnergy; 
        });

        // 更新能量显示
        if (this.energyLabel) {
            this.energyLabel.string = `能量: ${this._totalEnergy}`;
        }
    }

    public eat(bean: Node) {
        const energy = bean.getComponent(Bean)?.getEnergy();
        this._totalEnergy += energy;
        if (this.energyLabel) {
            this.energyLabel.string = `能量: ${this._totalEnergy}`;
        }
        
        const targetBox = this.getAvailableBox();
        if (targetBox) {            
            bean.setParent(targetBox);
            let newPos = bean.position.clone().subtract(targetBox.position).add(new Vec3(0, 10, 0));
            bean.setPosition(newPos);
            let speed = newPos.length()/800;
            tween(bean) 
                .to(speed, { position: new Vec3(0,0,0) }, { easing: 'sineOut' })
                .call(() => {
                    this.checkAndClearMatchingBeans();  // 添加三消检查
                })
                .start();
        }
    }

    private getAvailableBox(): Node | null {
        return this.boxes.find(box => box.children.length === 0) || null;
    }

    private isAllBoxFull(): boolean {
        return this.boxes.every(box => box.children.length > 0);
    }

    initPos(row: number, col: number) {
        this._totalEnergy = 0;
        this.currentRow = row;
        this.currentCol = col;
        const cellSize = this.field.cellSize;
        
        const playerUITrans = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        playerUITrans.width = cellSize;
        playerUITrans.height = cellSize;
        
        this.node.setPosition(this.field.getGridPosition(this.startRow, this.startCol));

        this.scheduleMovement();
    }
}