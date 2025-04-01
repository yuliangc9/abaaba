import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

export enum BeanType {
    Energy = 'energy',
    Speed = 'speed',
    Shield = 'shield'
}

@ccclass('Bean')
export class Bean extends Component {

    public type: BeanType = BeanType.Energy;

    @property
    public energyValue: number = 10;

    @property({ type: SpriteFrame })
    public energySprite: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public speedSprite: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public shieldSprite: SpriteFrame = null!;

    getCurrentSprite(): SpriteFrame {
        switch(this.type) {
            case BeanType.Energy:
                return this.energySprite;
            case BeanType.Speed:
                return this.speedSprite;
            case BeanType.Shield:
                return this.shieldSprite;
        }
    }

    setType(typeConfig: any) {
        this.type = typeConfig.type;
        this.energyValue = typeConfig.energy;
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            sprite.spriteFrame = this.getCurrentSprite();
        }
    }
}