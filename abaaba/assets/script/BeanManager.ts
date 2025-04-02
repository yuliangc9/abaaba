
const { ccclass, property } = _decorator;
import { Bean, BeanType } from './Bean';
import { GameManager } from './GameManager';
import { Sprite } from 'cc';
import { _decorator, Component, Prefab, Node, instantiate, Vec3, CCInteger, Collider2D, PolygonCollider2D, UITransform } from 'cc';
import { Size } from 'cc';
import { Vec2 } from 'cc';

@ccclass('BeanManager')
export class BeanManager extends Component {
    @property(Prefab)
    beanPrefab: Prefab = null!;
    
    @property(CCInteger)
    beanCount = 50;
    
    

    private _beans: Node[] = [];
    
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
        const playerPos = this.node.getChildByName('Cat')?.position;
        const safeDistance = 50;
        
        // 初始化10x10网格
        const gridSize = 16;
        const gridOccupied: boolean[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
        
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
        this.node.getComponent(GameManager).setTotalBeans(this._beans.length);
    }

    public removeBean(beanNode: Node) {
        const energy = beanNode.getComponent(Bean)?.energyValue;
        const index = this._beans.indexOf(beanNode);
        if (index !== -1) {
            const beanType = beanNode.getComponent(Bean)?.type;
            beanNode.destroy();
            this._beans.splice(index, 1);
            
            const gameManager = this.node.getComponent(GameManager) as any;
            if (gameManager && beanType) {
                gameManager.beanEaten(beanType, energy);
            } else {
                console.error('GameManager component not found in BeanManager');
            }
        }
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
}