import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Label)
    countLabel: Label = null!;
    
    @property(Label)
    winLabel: Label = null!;

    private _remainingBeans = 0;
    private _totalEnergy = 50;

    // 新增：减少能量方法
    public decreaseEnergy(amount: number) : number{
        this._totalEnergy = Math.max(0, this._totalEnergy - amount);
        this.updateCountLabel();
        return this._totalEnergy
    }

    start() {
        this.winLabel.node.active = false;
        this.updateCountLabel();
    }

    public beanEaten(energy: number) {
        console.log('剩余豆豆数量:', this._remainingBeans);
        this._remainingBeans--;
        this.addEnergy(energy);
        
        console.log('更新后剩余:', this._remainingBeans);
        if (this._remainingBeans <= 0) {
            console.log('触发胜利条件');
            this.showWin();
        }
    }

    public setTotalBeans(count: number) {
        this._remainingBeans = count;
    }

    private updateCountLabel() {
        this.countLabel.string = `能量: ${Math.floor(this._totalEnergy)}`;
    }

    private showWin() {
        this.winLabel.node.active = true;
        this.winLabel.string = '游戏胜利！';
        this.scheduleOnce(() => {
            window.location.reload();
        }, 2);
    }

    public addEnergy(energy: number) {
        this._totalEnergy += energy;
        console.log('当前累计能量:', this._totalEnergy);
        this.updateCountLabel();
    }
}