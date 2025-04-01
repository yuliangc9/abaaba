
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
        { type: BeanType.Energy, energy: 10, weight: 1 },
        { type: BeanType.Shield, energy: 20, weight: 2 },
        { type: BeanType.Speed, energy: 30, weight: 3 }
    ];

    start() {
        this.scheduleOnce(() => this.spawnBeans(), 0.5);
    }

    private spawnBeans() {
        const playerPos = this.node.getChildByName('Cat')?.position;
        const safeDistance = 60;
        
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
                beanComp.setType(typeData);
            }
            
            while (!isValidPos && attempts < 10) {            
                
                const newPos = new Vec3(
                    minX + Math.random() * (maxX - minX),
                    minY + Math.random() * (maxY - minY),
                    0
                );
                
                // 碰撞检测
                isValidPos = this.checkSafePosition(newPos, playerPos, safeDistance);
                
                if (isValidPos) {
                    this.node.addChild(bean);
                    bean.setPosition(newPos);
                    bean.active = true;
                    console.log("new bean at", newPos, typeData);
                    this._beans.push(bean);
                }
                attempts++;
            }

        }
        // 新增：通知GameManager总豆豆数
        const gameManager = this.node.getComponent(GameManager).setTotalBeans(this._beans.length);
    }

    public removeBean(beanNode: Node) {
        const index = this._beans.indexOf(beanNode);
        if (index !== -1) {
            const energy = beanNode.getComponent(Bean)?.energyValue;
            beanNode.destroy();
            this._beans.splice(index, 1);
            
            const gameManager = this.node.getComponent(GameManager) as any;
            gameManager?.beanEaten(energy);
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
        if (pos.subtract(playerPos).length() < minDistance) return false;
        
        // 检查已有豆豆距离
        return this._beans.every(bean => {
            const res = bean.position.clone().subtract(pos).length() >= minDistance;
            return res;
        });
    }
}