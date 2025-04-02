import { _decorator, Component, Node, EventTouch, Input, input, Vec2, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {
    @property(Node)
    stick: Node = null!;
    
    private _maxRadius = 50;
    private _inputVector = Vec2.ZERO;
    private _isActive = false;
    private _initialTouchPos = Vec2.ZERO;
    
    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    
    private onTouchStart(event: EventTouch) {
        const touchPos = event.getUILocation();
        const nodeRect = this.node.getComponent(UITransform).getBoundingBoxToWorld();
        
        console.log('joystick touch', touchPos, nodeRect, this.node.position);
        if (nodeRect.contains(new Vec2(touchPos.x, touchPos.y))) {
            this._isActive = true;
            // Bug 修复：使用 Vec2 类型来存储初始触摸位置
            this._initialTouchPos = new Vec2(touchPos.x, touchPos.y);
            //this.node.setPosition(touchPos.x, touchPos.y, 0);
        }
    }

    private onTouchEnd() {
        this._isActive = false;
        this.stick.setPosition(0, 0, 0);
        this._inputVector = Vec2.ZERO;
    }
    
    private onTouchMove(event: EventTouch) {
        if (!this._isActive) return;
        
        const touchPos = event.getUILocation();
        const delta = new Vec2(
            touchPos.x - this._initialTouchPos.x,
            touchPos.y - this._initialTouchPos.y
        );

        const length = delta.length();
        if (length > this._maxRadius) {
            delta.multiplyScalar(this._maxRadius / length);
        }
        
        this.stick.setPosition(delta.x, delta.y, 0);
        this._inputVector = delta.normalize();
    }
    
    get direction(): Vec2 {
        return this._inputVector.clone();
    }
}