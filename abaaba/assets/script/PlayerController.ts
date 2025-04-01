import { _decorator, Component, Node, Vec3, input, Input, Vec2, Collider, Collider2D, ICollisionEvent, BoxCollider2D, Contact2DType, IPhysics2DContact } from 'cc';
import { PhysicsSystem2D } from 'cc';
import { Bean } from './Bean'; // 请根据实际路径修改
const { ccclass, property } = _decorator;

// 开启物理系统
PhysicsSystem2D.instance.enable = true;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property(Node)
    joystick: Node = null!;

    @property(Node)
    map: Node = null!;
    
    @property
    moveSpeed = 200;
    
    @property
    moveCostPerUnit = 0.1;
    
    private _accumulatedDistance = 0;

    private _joystickComp: any = null;
    private _mapBoundary = { minX: -300, maxX: 300, minY: -300, maxY: 300 };

    onLoad() {
        this._joystickComp = this.joystick.getComponent('Joystick');
    }

    start() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            // 假设Contact2DType.BEGIN_CONTACT 是一个字符串，需要确保它是正确的事件类型
            // 这里根据错误信息进行类型转换，确保类型匹配
            console.log('1');
            collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionBegin, this);
        }
    }

    onCollisionBegin2(selfCollider: Collider2D, otherCollider: Collider2D) {
        console.log('2');
        if (otherCollider.node.name === 'Bean') {
            const beanManager = this.node.parent?.getComponent('BeanManager') as any;
            beanManager?.removeBean(otherCollider.node);
        }
    }

    onCollisionBegin(selfCollider: Collider2D, otherCollider: Collider2D) {
        if (otherCollider.node.name === 'Bean') {
            const bean = otherCollider.node.getComponent(Bean);
            const beanManager = this.node.parent?.getComponent('BeanManager') as any;
            beanManager?.removeBean(otherCollider.node);
        }
    }

    update(deltaTime: number) {
        const direction = this._joystickComp.direction;
        const moveDelta = new Vec3(direction.x * this.moveSpeed * deltaTime, direction.y * this.moveSpeed * deltaTime, 0);
        
        // 累计移动距离
        this._accumulatedDistance += moveDelta.length();
        
        // 触发能量消耗
        if (true) {
            const gameManager = this.node.parent?.getComponent('GameManager') as any;
            const leftEnergy = gameManager?.decreaseEnergy(this.moveCostPerUnit * this._accumulatedDistance);
            if (leftEnergy <= 0) {
                // 能量耗尽，停止移动
                moveDelta.set(0, 0, 0);
                this.node.active = false;
                return;
            }
            this._accumulatedDistance = 0;
        }
        
        const newPos = this.node.position.add(moveDelta);
        newPos.x = Math.max(Math.min(newPos.x, this._mapBoundary.maxX), this._mapBoundary.minX);
        newPos.y = Math.max(Math.min(newPos.y, this._mapBoundary.maxY), this._mapBoundary.minY);
        
        this.node.setPosition(newPos);
    }
}