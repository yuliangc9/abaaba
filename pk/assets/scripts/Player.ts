import { _decorator, Component, Vec3, tween, EventTarget, UITransform } from 'cc';
import { Field } from './Field'; // 根据实际文件路径调整
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property({ type: Number })
    moveInterval = 0.5;

    private pathQueue: { row: number; col: number }[] = [];
    private currentRow = 0;
    private currentCol = 0;
    private currentTween: any = null;
    @property({ type: Number })
    moveDuration = 0.5;

    @property({ type: Field })
    field: Field = null!;

    @property({ type: Number })
    startRow = 0;

    @property({ type: Number })
    startCol = 0;

    private targetRow: number = 0;
    private targetCol: number = 0;

    start() {
        this.field.eventTarget.on('cell-clicked', this.onCellClicked, this);
        this.initPos();
    }

    private onCellClicked(pos: { row: number; col: number }) {
        this.targetRow = pos.row;
        this.targetCol = pos.col;
        console.log(`点击格子: 行 ${pos.row}, 列 ${pos.col}`);
    }

    private checkTargetCell() {
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
            })
            .start();
    }

    // private startMove() {
    //     if (this.timer) {
    //         clearInterval(this.timer);
    //         this.pathQueue = [];
    //     }
    //         .to(this.moveDuration, { position: this.targetPosition })
    //         .call(() => console.log('移动完成'))
    //         .start();
    // }

    onLoad() {

    }

    initPos() {
        this.currentRow = this.startRow;
        this.currentCol = this.startCol;
        const cellSize = this.field.cellSize;
        
        const playerUITrans = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        playerUITrans.width = cellSize;
        playerUITrans.height = cellSize;
        
        this.node.setPosition(this.field.getGridPosition(this.startRow, this.startCol));

        this.scheduleMovement();
    }
}