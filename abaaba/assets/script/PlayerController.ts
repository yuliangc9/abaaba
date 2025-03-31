import { _decorator, Component, Node, Vec3, input, Input, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property(Node)
    joystick: Node = null!;
    
    @property
    moveSpeed = 200;
    
    private _joystickComp: any = null;
    private _mapBoundary = { minX: -300, maxX: 300, minY: -300, maxY: 300 };

    onLoad() {
        this._joystickComp = this.joystick.getComponent('Joystick');
    }

    update(deltaTime: number) {
        const direction = this._joystickComp.direction;
        const moveDelta = new Vec3(direction.x * this.moveSpeed * deltaTime, direction.y * this.moveSpeed * deltaTime, 0);
        
        const newPos = this.node.position.add(moveDelta);
        newPos.x = Math.max(Math.min(newPos.x, this._mapBoundary.maxX), this._mapBoundary.minX);
        newPos.y = Math.max(Math.min(newPos.y, this._mapBoundary.maxY), this._mapBoundary.minY);
        
        this.node.setPosition(newPos);
    }
}