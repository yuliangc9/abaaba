import { _decorator, Component, Node, EventTouch, Input, input, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {
    @property(Node)
    stick: Node = null!;
    
    private _maxRadius = 50;
    private _inputVector = Vec2.ZERO;
    
    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    
    private onTouchStart(event: EventTouch) {
        const touchPos = event.getUILocation();
        this.node.setWorldPosition(touchPos.x, touchPos.y, 0);
    }
    
    private onTouchMove(event: EventTouch) {
        const touchPos = event.getUILocation();
        const stickPos = this.node.worldPosition;
        const delta = new Vec2(touchPos.x - stickPos.x, touchPos.y - stickPos.y);
        
        if (delta.length() > this._maxRadius) {
            delta.normalize().multiplyScalar(this._maxRadius);
        }
        
        this.stick.setPosition(delta.x, delta.y, 0);
        this._inputVector = delta.normalize();
    }
    
    private onTouchEnd() {
        this.stick.setPosition(0, 0, 0);
        this._inputVector = Vec2.ZERO;
    }
    
    get direction(): Vec2 {
        return this._inputVector.clone();
    }
}