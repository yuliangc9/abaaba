import { Sprite, Vec3, tween } from 'cc';
import { _decorator, Component, Node, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;

export enum BeanType {
    apple = 'apple',
    baicai = 'baicai',
    banana = 'banana',
    bingqilin = 'bingqilin',
    caomei = 'caomei',
    guozhi = 'guozhi',
    huluobo = 'huluobo',
    lanmei = 'lanmei',
    mangguo = 'mangguo',
    mihoutao = 'mihoutao',
    shanzhu = 'shanzhu',
    tudou = 'tudou',
    xigua = 'xigua'
}

@ccclass('Bean')
export class Bean extends Component {

    public type: BeanType = BeanType.apple;

    @property
    energyValue: number = 1;

    public getEnergy() {
        return this.energyValue;
    }

    @property({ type: SpriteFrame })
    public apple: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public baicai: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public banana: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public bingqilin: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public caomei: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public guozhi: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public huluobo: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public lanmei: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public mangguo: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public mihoutao: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public shanzhu: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public tudou: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public xigua: SpriteFrame = null!;

    getCurrentSprite(): SpriteFrame {
        switch(this.type) {
            case BeanType.apple:
                return this.apple;
            case BeanType.baicai:
                return this.baicai;
            case BeanType.banana:
                return this.banana;
            case BeanType.bingqilin:
                return this.bingqilin;
            case BeanType.caomei:
                return this.caomei;
            case BeanType.guozhi:
                return this.guozhi;
            case BeanType.huluobo:
                return this.huluobo;
            case BeanType.lanmei:
                return this.lanmei;
            case BeanType.mangguo:
                return this.mangguo;
            case BeanType.mihoutao:
                return this.mihoutao;
            case BeanType.shanzhu:
                return this.shanzhu;
            case BeanType.tudou:
                return this.tudou;
            case BeanType.xigua:
                return this.xigua;
        }
    }

    init(type: BeanType) {
        this.type = type;
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            sprite.spriteFrame = this.getCurrentSprite();
        }
    }

    onDestroy() {
        // 播放爆炸动画, don't work
        this.node.scale = new Vec3(1, 1, 1);
        tween(this.node)
            .to(0.1, { scale: new Vec3(1.5, 1.5, 1.5) })
            .to(0.3, { 
                scale: new Vec3(0, 0, 0)
            }, { easing: 'sineOut' })
            .call(() => {
            })
            .start();
    }
}