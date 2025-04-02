import { _decorator, Component, Node, SpriteFrame } from 'cc';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

export enum BeanType {
    caomei = 'caomei',
    tudou = 'tudou',
    mifan = 'mifan',
    nangua = 'nangua',
    qiezi = 'qiezi',
    huluobo = 'huluobo',
    bingqilin = 'bingqilin',
    wawacai = 'wawacai',
    qingcai = 'qingcai',
    baozi = 'baozi'
}

@ccclass('Bean')
export class Bean extends Component {

    public type: BeanType = BeanType.mifan;

    @property
    private _energyValue: number = 10;

    public getEnergy() {
        return this._energyValue;
    }

    @property({ type: SpriteFrame })
    public caomei: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public tudou: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public nangua: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public qiezi: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public huluobo: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public bingqilin: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public wawacai: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public qingcai: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public baozi: SpriteFrame = null!;

    @property({ type: SpriteFrame })
    public mifan: SpriteFrame = null!;

    getCurrentSprite(): SpriteFrame {
        switch(this.type) {
            case BeanType.mifan:
                return this.mifan;
            case BeanType.nangua:
                return this.nangua;
            case BeanType.caomei:
                return this.caomei;
            case BeanType.bingqilin:
                return this.bingqilin;
            case BeanType.baozi:
                return this.baozi;
            case BeanType.tudou:
                return this.tudou;
            case BeanType.qiezi:
                return this.qiezi;
            case BeanType.wawacai:
                return this.wawacai;
            case BeanType.qingcai:
                return this.qingcai;
            case BeanType.huluobo:
                return this.huluobo;
        }
    }

    setType(type: BeanType, energyValue: number) {
        this.type = type;
        this._energyValue = energyValue;
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            sprite.spriteFrame = this.getCurrentSprite();
        }
    }
}