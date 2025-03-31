import { _decorator, Component, Prefab, Node, instantiate, Vec3, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BeanManager')
export class BeanManager extends Component {
    @property(Prefab)
    beanPrefab: Prefab = null!;
    
    @property(CCInteger)
    beanCount = 50;
    
    @property
    spawnArea = 500;

    private _beans: Node[] = [];
    
    start() {
        this.spawnBeans();
    }

    private spawnBeans() {
        for (let i = 0; i < this.beanCount; i++) {
            const bean = instantiate(this.beanPrefab);
            bean.setPosition(
                Math.random() * this.spawnArea - this.spawnArea/2,
                Math.random() * this.spawnArea - this.spawnArea/2,
                0
            );
            this.node.addChild(bean);
            this._beans.push(bean);
        }
    }

    public removeBean(beanNode: Node) {
        const index = this._beans.indexOf(beanNode);
        if (index !== -1) {
            beanNode.destroy();
            this._beans.splice(index, 1);
            // 修复：将 getComponentInParent 替换为 getComponentInChildren
            // 假设 GameManager 类有 beanEaten 方法，需要确保类型正确
            const gameManager = this.node.getComponentInChildren('GameManager') as any;
            gameManager?.beanEaten();
        }
    }
}