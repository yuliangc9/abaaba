import { _decorator, Component, Node, Vec3, Sprite, input, Input, Vec2, Collider, Collider2D, Contact2DType, math, Size, UITransform } from 'cc';
import { PhysicsSystem2D } from 'cc';
import { Bean } from './Bean'; // 请根据实际路径修改
import { GameManager } from './GameManager';
import { Tween } from 'cc';
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
    moveSpeed = 100;
    
    @property
    moveCostPerUnit = 0.1;
    
    private _accumulatedDistance = 0;

    private _joystickComp: any = null;
    private _mapBoundary = { minX: -350, maxX: 350, minY: -350, maxY: 350 };

    onLoad() {
        this._joystickComp = this.joystick.getComponent('Joystick');
    }

    @property(Node)
    maskSprite: Node = null!;

    private _gameManager: GameManager;

    start() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            // 假设Contact2DType.BEGIN_CONTACT 是一个字符串，需要确保它是正确的事件类型
            // 这里根据错误信息进行类型转换，确保类型匹配
            console.log('1');
            collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionBegin, this);
        }
        this._gameManager = this.node.parent.parent.getComponent(GameManager);
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

    private _targetAngle = 0;
    private _currentAngle = 0;
    private _rotationSpeed = 20;

    update(deltaTime: number) {
        const direction = this._joystickComp.direction;
        const moveDelta = new Vec3(direction.x * this.moveSpeed * deltaTime, direction.y * this.moveSpeed * deltaTime, 0);
        
        // 计算目标角度（弧度转角度，并调整初始方向）
        if (!direction.equals(Vec2.ZERO)) {
            this._targetAngle = Math.atan2(direction.y, direction.x) * 180 / Math.PI - 90;
        }
        
        // 添加角度差值函数
        function lerp(a: number, b: number, t: number) {
          return a + (b - a) * Math.min(t, 1);
        }
        
        // 平滑旋转过渡
        this._currentAngle = lerp(this._currentAngle, this._targetAngle, deltaTime * this._rotationSpeed);
        this.node.angle = this._targetAngle;
        
        // 累计移动距离
        this._accumulatedDistance += moveDelta.length();
        
        // 触发能量消耗
        if (true) {
            const gameManager = this.node.parent.parent.getComponent('GameManager') as any;
            const leftEnergy = gameManager?.decreaseEnergy(this.moveCostPerUnit * this._accumulatedDistance);
            if (leftEnergy <= 0) {
                // 能量耗尽，停止移动
                moveDelta.set(0, 0, 0);
                this.setMovementEnabled(false);
                return;
            }
            this._accumulatedDistance = 0;
        }
        
        const newPos = this.node.position.add(moveDelta);
        newPos.x = Math.max(Math.min(newPos.x, this._mapBoundary.maxX), this._mapBoundary.minX);
        newPos.y = Math.max(Math.min(newPos.y, this._mapBoundary.maxY), this._mapBoundary.minY);
        
        this.node.setPosition(newPos);
        
        // 更新遮罩位置和尺寸
        this.updateMask();
    }

    private updateMask() {
        if (!this.maskSprite) return;
    
        const targetRadius = this._gameManager.getCurrentEnergy() / this.moveCostPerUnit;
    
        // 同步位置
        this.maskSprite.setPosition(this.node.position);
        this.maskSprite.getComponent(UITransform).contentSize = new Size(targetRadius * 2, targetRadius * 2);
    }
    setMovementEnabled(enabled: boolean) {
        if (enabled) {
            this.node.active = true;
        } else {
            this.node.active = false;
        }
    }
}