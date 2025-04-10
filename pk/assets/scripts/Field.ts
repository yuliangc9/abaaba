import { _decorator, Component, Node, Color, EventTarget, Vec3, Sprite, UITransform, SpriteFrame, builtinResMgr } from 'cc';
import { Texture2D } from 'cc';
import { EventBus } from './Common';
const { ccclass, property } = _decorator;

@ccclass('Field')
export class Field extends Component {
    getNeighbors(row: number, col: number): { row: number; col: number }[] {
        const neighbors = [];
        if (row > 0) neighbors.push({ row: row - 1, col });
        if (row < this.gridRows - 1) neighbors.push({ row: row + 1, col });
        if (col > 0) neighbors.push({ row, col: col - 1 });
        if (col < this.gridColumns - 1) neighbors.push({ row, col: col + 1 });
        return neighbors;
    }

    @property({ type: Number })
    gridRows = 3;

    @property({ type: Number })
    gridColumns = 3;

    @property({ type: Color })
    colorA = new Color(150, 190, 170);

    @property({ type: Color })
    colorB = new Color(170, 210, 190);

    private gridMap: Node[][] = [];

    start() {
        this.generateGrid();
    }

    private _cellSize: number = 0;

    get cellSize() {
        return this._cellSize;
    }

    onLoad() {
        const uiTrans = this.node.getComponent(UITransform);
        this._cellSize = Math.min(uiTrans.width / this.gridColumns, uiTrans.height / this.gridRows);
    }

    private generateGrid() {
        const cellSize = this._cellSize;
        const startX = -(this.gridColumns * cellSize) / 2;
        const startY = -(this.gridRows * cellSize) / 2;

        for (let row = 0; row < this.gridRows; row++) {
            this.gridMap[row] = [];
            for (let col = 0; col < this.gridColumns; col++) {
                const cell = new Node();
                this.node.addChild(cell);
                cell.active = true;
                
                // 设置网格位置
                cell.setPosition(new Vec3(
                    startX + col * cellSize + cellSize/2,
                    startY + row * cellSize + cellSize/2,
                    0
                ));

                // 交替设置背景颜色
                const sprite = cell.addComponent(Sprite);
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                sprite.spriteFrame = builtinResMgr.get('white-sprite-frame');
                // 创建纯色纹理
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.reset({ width: 1, height: 1 });
                // 由于 Texture2D 没有 setPixels 方法，使用 imageData 来设置像素数据
                const data = new Uint8Array([255, 255, 255, 255]);
                texture.uploadData(data);
                spriteFrame.texture = texture;
                sprite.spriteFrame = spriteFrame;
                // 由于Sprite类型没有width属性，使用UITransform组件的width属性来设置宽度
                const uiTransform = cell.getComponent(UITransform) || cell.addComponent(UITransform);
                uiTransform.width = cellSize;
                // 由于Sprite类型没有height属性，使用UITransform组件的height属性来设置高度
                uiTransform.height = cellSize;
                sprite.color = (row + col) % 2 === 0 ? this.colorA : this.colorB;

                // 添加点击事件
                cell.on(Node.EventType.TOUCH_END, () => {
                    EventBus.emit('cell-clicked', { row, col });
                });

                this.gridMap[row][col] = cell;
            }
        }
    }

    getGridPosition(row: number, col: number): Vec3 {
        const uiTrans = this.node.getComponent(UITransform);
        const cellSize = this._cellSize;
        const startX = -(this.gridColumns * cellSize) / 2;
        const startY = -(this.gridRows * cellSize) / 2;
        return new Vec3(
            startX + col * cellSize + cellSize/2,
            startY + row * cellSize + cellSize/2,
            0
        );
    }

    // 移除原有的豆豆管理方法
}