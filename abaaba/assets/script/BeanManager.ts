
const { ccclass, property } = _decorator;
import { Bean, BeanType } from './Bean';
import { GameManager } from './GameManager';
import { Sprite } from 'cc';
import { _decorator, Component, Prefab, Node, instantiate, Vec3, CCInteger, Collider2D, PolygonCollider2D, UITransform, Tween, Label, Color } from 'cc';
import { Size } from 'cc';
import { Vec2 } from 'cc';

@ccclass('BeanManager')
export class BeanManager extends Component {
    @property(Prefab)
    beanPrefab: Prefab = null!;
    
    @property(CCInteger)
    beanCount = 50;
    
    

    public _beans: Node[] = [];

    public getBeans(): Node[] {
        return this._beans;
    }
    
    private beanConfigs = [
        { type: BeanType.caomei, energy: 10, weight: 1 },
        { type: BeanType.nangua, energy: 10, weight: 1 },
        { type: BeanType.qiezi, energy: 10, weight: 1 },
        { type: BeanType.tudou, energy: 20, weight: 1 },
        { type: BeanType.wawacai, energy: 10, weight: 1 },
        { type: BeanType.qingcai, energy: 10, weight: 1 },
        { type: BeanType.mifan, energy: 20, weight: 1 },
        { type: BeanType.bingqilin, energy: 40, weight: 1 },
        { type: BeanType.baozi, energy: 40, weight: 1 },
        { type: BeanType.huluobo, energy: 10, weight: 1 }
    ];

    start() {
        this.scheduleOnce(() => this.spawnBeans(), 0.5);
    }

    private spawnBeans() {
        const gridSize = 9; // 改为9x9网格
        const gridOccupied: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    
        // 初始化玩家位置到中心格
        const centerGrid = Math.floor(gridSize / 2);
        this.node.parent.getChildByName('Cat')?.setPosition(this.convertGridToWorld(new Vec3(centerGrid, centerGrid, 0)));
    
        // 生成类型池（3的倍数）
        const typePool = this.generateTypePool();

        // 假设使用 cc.Size 来替换未定义的 Size
        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) {
            console.error('UITransform component missing on BeanManager node!');
            return;
        }
        const nodeSize = uiTransform.contentSize;
        const anchor = uiTransform.anchorPoint;
        
        const minX = -nodeSize.width * anchor.x;
        const maxX = nodeSize.width * (1 - anchor.x);
        const minY = -nodeSize.height * anchor.y;
        const maxY = nodeSize.height * (1 - anchor.y);

        console.log("地图尺寸计算:", 
            `宽: ${nodeSize.width} 高: ${nodeSize.height}`, 
            `锚点: (${anchor.x}, ${anchor.y})`,
            `X范围: [${minX}, ${maxX}]`,
            `Y范围: [${minY}, ${maxY}]`);
        
        for (let i = 0; i < this.beanCount; i++) {
            let isValidPos = false;
            let attempts = 0;
            let bean: Node;

            bean = instantiate(this.beanPrefab);
            // 设置豆豆类型
            const typeData = typePool[i % typePool.length];
            // 假设 Bean 类有 setType 方法，修正类型获取方式
            const beanComp = bean.getComponent(Bean);
            if (beanComp) {
                beanComp.setType(typeData.type, typeData.energy);
            }
            
            while (!isValidPos && attempts < 10) {            
                
                // 获取随机未占用网格
                let gridX, gridY;
                do {
                    gridX = Math.floor(Math.random() * gridSize);
                    gridY = Math.floor(Math.random() * gridSize);
                } while (gridOccupied[gridX][gridY]);
                gridOccupied[gridX][gridY] = true;

                // 转换网格坐标为世界坐标
                const gridWidth = (maxX - minX) / gridSize;
                const gridHeight = (maxY - minY) / gridSize;
                const newPos = new Vec3(
                    minX + gridX * gridWidth + gridWidth/2,
                    minY + gridY * gridHeight + gridHeight/2,
                    0
                );
                
                // 碰撞检测
                isValidPos = this.checkSafePosition(newPos, playerPos, safeDistance);
                
                if (isValidPos) {
                    this.node.addChild(bean);
                    bean.setPosition(newPos);
                    bean.active = true;
                    this._beans.push(bean);
                }
                attempts++;
            }

        }
        // 新增：通知GameManager总豆豆数
        this.node.parent.getComponent(GameManager).setTotalBeans(this._beans.length);
    }

    public removeBean(beanNode: Node) {
        const energy = beanNode.getComponent(Bean)?.getEnergy();
        const index = this._beans.indexOf(beanNode);
        if (index !== -1) {
            const beanType = beanNode.getComponent(Bean)?.type;
            
            // 执行缩小动画
            new Tween(beanNode)
                .to(0.3, { scale: new Vec3(0.1, 0.1, 1) }, { easing: 'sineOut' })
                .call(() => {
                    beanNode.destroy();
                    this.showEnergyLabel(beanNode.position, energy);
                })
                .start();

            this._beans.splice(index, 1);
            
            const gameManager = this.node.parent.getComponent(GameManager) as any;
            if (gameManager && beanType) {
                gameManager.beanEaten(beanType, energy);
            } else {
                console.error('GameManager component not found in BeanManager');
            }
        }
    }

    private showEnergyLabel(position: Vec3, energy: number) {
        const labelNode = new Node();
        const label = labelNode.addComponent(Label);
        label.string = `+${energy}`;
        label.fontSize = 30;
        label.color = Color.GREEN;
        
        this.node.addChild(labelNode);
        labelNode.setPosition(position);

        
        // 执行上漂渐隐动画
        new Tween(labelNode)
            .to(0.8, { 
                position: new Vec3(position.x, position.y + 80, 0)
            })
            .call(() => labelNode.destroy())
            .start();
    }

    private generateTypePool(): any[] {
        const pool: any[] = [];
        this.beanConfigs.forEach(config => {
            const count = Math.floor(config.weight * 3);
            pool.push(...Array(count).fill(config));
        });
        return pool.sort(() => Math.random() - 0.5);
    }

    private checkSafePosition(pos: Vec3, playerPos: Vec3, minDistance: number): boolean {
        // 检查玩家距离
        if (pos.subtract(playerPos).length() < 150) return false;
        
        // 检查已有豆豆距离
        return this._beans.every(bean => {
            const res = bean.position.clone().subtract(pos).length() >= minDistance;
            return res;
        });
    }
    
    // 添加豆豆位置查询方法
    public getBeanPositions(): Vec3[] {
        return this._beans.map(bean => this.convertWorldToGrid(bean.position));
    }

    private convertGridToWorld(gridPos: Vec3): Vec3 {
        const gridWidth = (maxX - minX) / gridSize;
        return new Vec3(
            minX + gridPos.x * gridWidth + gridWidth/2,
            minY + gridPos.y * gridWidth + gridWidth/2,
            0
        );
    }

    private convertWorldToGrid(worldPos: Vec3): Vec3 {
        const gridWidth = (maxX - minX) / gridSize;
        return new Vec3(
            Math.floor((worldPos.x - minX) / gridWidth),
            Math.floor((worldPos.y - minY) / gridWidth),
            0
        );
    }
}