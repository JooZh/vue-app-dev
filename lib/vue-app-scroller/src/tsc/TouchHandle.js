
import Deceleration from './Deceleration';
import { isTouch } from './utils';

class TouchHandle extends Deceleration {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }
    doTouchStart(touches, timeStamp) {
        isTouch(timeStamp, touches);
        this.isTracking = true;
        // 执行停止动画
        this.startTouchX = touches[0].pageX;
        this.startTouchY = touches[0].pageY;
        this.startTouchT = timeStamp;
        this.moveTouchX = touches[0].pageX;
        this.moveTouchY = touches[0].pageY;
        this.moveTouchT = timeStamp;
        this.touchRecord.push({
            x: this.scrollX,
            y: this.scrollY,
            t: timeStamp
        });
    }
    doTouchMove(touches, timeStamp) {
        isTouch(timeStamp, touches);
        if (!this.isTracking) { return }
        let currentTouchX = touches[0].pageX;
        let currentTouchY = touches[0].pageY;
        let moveX = currentTouchX - this.moveTouchX;
        let moveY = currentTouchY - this.moveTouchY;

        if (this.enableScrollX) { this.doTouchMoveScroll(moveX, 'X') }
        if (this.enableScrollY) { this.doTouchMoveScroll(moveY, 'Y') }

        if (this.touchRecord.length > 100) {
            this.touchRecord.splice(0, 20);
        }

        this.publish(this.scrollX, this.scrollY);
        // 跟踪滚动的运动
        this.touchRecord.push({
            x: this.scrollX,
            y: this.scrollY,
            t: timeStamp
        });
        this.moveTouchX = currentTouchX;
        this.moveTouchY = currentTouchY;
        this.moveTouchT = timeStamp;
    }
    doTouchEnd(timeStamp) {
        isTouch(timeStamp);
        if (!this.isTracking) { return }
        this.endTouchX = this.moveTouchX;
        this.endTouchY = this.moveTouchY;
        this.endTouchT = timeStamp;
        this.touchRecord.push({
            x: this.scrollX,
            y: this.scrollY,
            t: timeStamp
        });
        this.isTracking = false;
        this.emit('touchEnd');
    }
    doTouchMoveScroll(move, type) {
        let scroll = 'scroll' + type;
        let maxScroll = 'maxScroll' + type;
        this[scroll] -= move * this.ops.speedRatio;
        if (this[scroll] > this[maxScroll] || this[scroll] < 0) {
            if (this.ops.bouncing) {
                this[scroll] += (move / 1.5) * this.ops.speedRatio;
                if (type === 'Y' && !!this.ops.onPullRefresh) {
                    this.emit('pullRefresh');
                }
            }
            else if (this[scroll] < 0) {
                this[scroll] = 0;
            }
            else {
                this[scroll] = this[maxScroll];
            }
        }
    }
}
export default TouchHandle;
