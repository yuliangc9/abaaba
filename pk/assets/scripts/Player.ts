import { _decorator, Component, Vec3, tween, EventTarget, UITransform } from 'cc';
import { Field } from './Field'; // 根据实际文件路径调整
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property({ type: Number })
    moveDuration = 0.5;

    @property({ type: Field })
    field: Field = null!;

    @property({ type: Number })
    startRow = 0;

    @property({ type: Number })
    startCol = 0;

    private targetPosition: Vec3 = new Vec3();

    start() {
        this.field.eventTarget.on('cell-clicked', this.onCellClicked, this);
    }

    private onCellClicked(pos: { row: number; col: number }) {
        const worldPos = this.field.getGridPosition(pos.row, pos.col);
        this.targetPosition.set(worldPos);
        this.startMove();
    }

    private startMove() {
        tween(this.node)
            .to(this.moveDuration, { position: this.targetPosition })
            .call(() => console.log('移动完成'))
            .start();
    }

    onLoad() {

    }

    initPos() {
        const cellSize = this.field.cellSize;
        
        const playerUITrans = this.node.getComponent(UITransform) || this.node.addComponent(UITransform);
        playerUITrans.width = cellSize;
        playerUITrans.height = cellSize;
        
        this.node.setPosition(this.field.getGridPosition(this.startRow, this.startCol));
    }
}