
const { ccclass, property } = _decorator;

import { BeanType } from './Bean';
import { Prefab } from 'cc';
import { _decorator, Component, Sprite, tween, Vec3, instantiate, Node } from 'cc';
import { Bean } from './Bean';

@ccclass('SlotComponent')
export class SlotComponent extends Component {
    @property(Prefab)
    beanPrefab: Prefab = null!;

    private _currentType: BeanType | null = null;
    private _bean: Node;

    showBean(type: BeanType) {
        this._currentType = type;


        this._bean = instantiate(this.beanPrefab);
        // 设置豆豆类型
        // 假设 Bean 类有 setType 方法，修正类型获取方式
        const beanComp = this._bean.getComponent(Bean);
        if (beanComp) {
            beanComp.setType(type, 0);
        }
        this.node.addChild(this._bean);
        this._bean.setPosition(Vec3.ZERO);
        this._bean.active = true;
    }

    playClearAnimation(callback: () => void) {
        tween(this.node)
            .to(0.3, { scale: new Vec3(1.2, 1.2, 1) })
            .to(0.2, { scale: Vec3.ZERO })
            .call(() => {
                this._bean.active = false;
                this._bean.destroy();
                this.node.scale = Vec3.ONE;
                callback();
            })
            .start();
    }
}