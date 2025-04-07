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
    map: Node = null!;
    
    @property
    moveSpeed = 100;
    
    @property
    moveCostPerUnit = 0.1;
    
    private _accumulatedDistance = 0;
    private _path: Vec3[] = [];
    private _currentPathIndex = 0;
    private _isMoving = false;

    private _joystickComp: any = null;
    private _mapBoundary = { minX: -350, maxX: 350, minY: -350, maxY: 350 };

    onLoad() {
        // 检查 onMapClick 方法是否存在
        if (typeof this.onMapClick === 'function') {
            input.on(Input.EventType.TOUCH_END, this.onMapClick, this);
        } else {
            console.error('PlayerController 上不存在 onMapClick 方法');
        }
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
        if (!this._isMoving) return;

        const targetPos = this._path[this._currentPathIndex];
        const moveDelta = targetPos.subtract(this.node.position).normalize().multiplyScalar(this.moveSpeed * deltaTime);

        this.node.position = this.node.position.add(moveDelta);

        if (this.node.position.subtract(targetPos).length() < 5) {
            this._currentPathIndex++;
            if (this._currentPathIndex >= this._path.length) {
                this._isMoving = false;
                // 假设添加一个检查豆子的方法
                this.checkBeansAtPosition(targetPos);
            }
        }

        // 更新遮罩位置和尺寸
        this.updateMask();
    }

        // 添加一个检查豆子的方法
    private checkBeansAtPosition(position: Vec3) {
        const beanManager = this.node.parent?.getComponent('BeanManager') as any;
        if (beanManager) {
            const beans = beanManager.getBeans();
            beans.forEach((beanNode: Node) => {
                const bean = beanNode.getComponent(Bean);
                if (bean && Vec3.distance(beanNode.position, position) < 5) {
                    beanManager.removeBean(beanNode);
                }
            });
        }
    }

    private updateMask() {
        if (!this.maskSprite) return;
    
        const targetRadius = this._gameManager.getCurrentEnergy() / this.moveCostPerUnit;
    
        // 同步位置
        this.maskSprite.setPosition(this.node.position);
        this.maskSprite.getComponent(UITransform).contentSize = new Size(targetRadius * 2, targetRadius * 2);
    }
    private onMapClick(event: any) {
        if (this._isMoving) return;

        const touchPos = event.getUILocation();
        const targetGridPos = this.convertToGridPosition(new Vec3(touchPos.x, touchPos.y, 0));
        
        const currentGridPos = this.convertToGridPosition(this.node.position);
        
        // 假设我们使用一个简单的路径查找函数，这里只是示例，实际可能需要更复杂的实现
        const path = this.simpleFindPath(currentGridPos, targetGridPos);
    }

    private simpleFindPath(start: Vec3, end: Vec3): Vec3[] {
        // 添加障碍物检测逻辑
        const beanManager = this.node.parent?.getComponent('BeanManager') as any;
        const occupiedGrids = beanManager?.getOccupiedGrids() || new Set();

        // A*寻路算法简化实现
        const openList = [start];
        const closedList = new Set();
        const cameFrom = new Map();

        while (openList.length > 0) {
            let current = openList.reduce((a, b) => a.z < b.z ? a : b);
            
            if (current.equals(end)) {
                return this.reconstructPath(cameFrom, current);
            }

            openList.splice(openList.indexOf(current), 1);
            closedList.add(current.toString());

            // 生成相邻网格（四方向）
            const neighbors = [
                current.add(new Vec3(1, 0, 0)),
                current.subtract(new Vec3(1, 0, 0)),
                current.add(new Vec3(0, 1, 0)),
                current.subtract(new Vec3(0, 1, 0))
            ];

            neighbors.forEach(neighbor => {
                const gridKey = neighbor.toString();
                if (occupiedGrids.has(gridKey) || closedList.has(gridKey)) return;

                if (!openList.some(n => n.equals(neighbor))) {
                    cameFrom.set(neighbor.toString(), current);
                    neighbor.z = neighbor.distanceSqrt(end);
                    openList.push(neighbor);
                }
            });
        }
        return [];
    }

    private reconstructPath(cameFrom: Map<string, Vec3>, current: Vec3): Vec3[] {
        const path = [current];
        while (cameFrom.has(current.toString())) {
            current = cameFrom.get(current.toString());
            path.unshift(current);
        }
        return path;
    }

    // 原来的代码继续

        if (path && path.length > 0) {
            this._path = path.map(p => this.convertToWorldPosition(p));
            this._currentPathIndex = 0;
            this._isMoving = true;
        }
    }

    private convertToGridPosition(worldPos: Vec3): Vec3 {
        const gridSize = 9;
        const mapTransform = this.map.getComponent(UITransform);
        const gridWidth = mapTransform.contentSize.width / gridSize;
        return new Vec3(
            Math.floor((worldPos.x - this._mapBoundary.minX) / gridWidth),
            Math.floor((worldPos.y - this._mapBoundary.minY) / gridWidth),
            0
        );
    }

    private convertToWorldPosition(gridPos: Vec3): Vec3 {
        const gridSize = 9;
        const mapTransform = this.map.getComponent(UITransform);
        const gridWidth = mapTransform.contentSize.width / gridSize;
        return new Vec3(
            -mapTransform.width/2 + gridPos.x * gridWidth + gridWidth/2,
            -mapTransform.height/2 + gridPos.y * gridWidth + gridWidth/2,
            0
        );
    }

    setMovementEnabled(enabled: boolean) {
        if (enabled) {
            this.node.active = true;
        } else {
            this.node.active = false;
        }
    }
}