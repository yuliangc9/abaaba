import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Label)
    countLabel: Label = null!;
    
    @property(Label)
    winLabel: Label = null!;

    private _remainingBeans = 0;

    start() {
        this.winLabel.node.active = false;
        this.updateCountLabel();
    }

    public beanEaten() {
        this._remainingBeans--;
        this.updateCountLabel();
        
        if (this._remainingBeans <= 0) {
            this.showWin();
        }
    }

    public setTotalBeans(count: number) {
        this._remainingBeans = count;
    }

    private updateCountLabel() {
        this.countLabel.string = `剩余豆豆: ${this._remainingBeans}`;
    }

    private showWin() {
        this.winLabel.node.active = true;
        this.winLabel.string = '游戏胜利！';
        this.scheduleOnce(() => {
            window.location.reload();
        }, 2);
    }
}