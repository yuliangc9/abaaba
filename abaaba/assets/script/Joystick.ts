import { _decorator, Component, Node, EventTouch, Input, input, Vec2, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {
    @property(Node)
    stick: Node = null!;
    
    private _maxRadius = 50;
    private _inputVector = Vec2.ZERO;
    private _isActive = false;
    
    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    
    private onTouchStart(event: EventTouch) {
        const touchPos = event.getUILocation();
        // 假设使用 getBoundingBoxToWorld 方法替代 getBoundingBox
        const nodeRect = this.node.getComponent(UITransform).getBoundingBoxToWorld();
        
        if (nodeRect.contains(new Vec2(touchPos.x, touchPos.y))) {
            this._isActive = true;
            // 保持摇杆底座位置不变，仅激活状态
        }
    }
    
    private onTouchMove(event: EventTouch) {
        if (!this._isActive) return;
        
        const touchPos = event.getUILocation();
        const stickWorldPos = this.node.worldPosition;
        
        // 计算触点与摇杆中心的相对位置
        const delta = new Vec2(
            touchPos.x - stickWorldPos.x,
            touchPos.y - stickWorldPos.y
        );

        if (delta.length() > this._maxRadius) {
            delta.normalize().multiplyScalar(this._maxRadius);
        }
        
        this.stick.setPosition(delta.x, delta.y, 0);
        this._inputVector = delta.normalize();
    }
    
    private onTouchEnd() {
        this._isActive = false;
        this.stick.setPosition(0, 0, 0);
        this._inputVector = Vec2.ZERO;
    }
    
    get direction(): Vec2 {
        return this._inputVector.clone();
    }
}