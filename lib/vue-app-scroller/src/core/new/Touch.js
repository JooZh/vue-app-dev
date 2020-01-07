import Event from './Event';
import { isTouch } from './utils';

class Touch extends Event {
    // eslint-disable-next-line no-useless-constructor
    constructor(selector, options) {
        super(selector, options);
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
        if (!this.isTracking) return;

        let currentTouchX = touches[0].pageX;
        let currentTouchY = touches[0].pageY;

        let moveX = currentTouchX - this.moveTouchX;
        let moveY = currentTouchY - this.moveTouchY;

        // 是否开启了横向滚动
        if (this.enableScrollX) this.doTouchMoveScroll(moveX, 'X');

        // 是否开启了纵向滚动
        if (this.enableScrollY) this.doTouchMoveScroll(moveY, 'Y');

        // 防止列表无限增长(保持最小10，最大20测量点)
        if (this.touchRecord.length > 100) this.touchRecord.splice(0, 20);

        this.publishScroll(this.scrollX, this.scrollY);

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
        if (!this.isTracking) return;

        this.endTouchX = this.moveTouchX;
        this.endTouchY = this.moveTouchY;
        this.endTouchT = timeStamp;

        this.touchRecord.push({
            x: this.scrollX,
            y: this.scrollY,
            t: timeStamp
        });

        this.isTracking = false;

        // 计算减速
        if (this.hasDeceleration()) {
            // 开始减速
            this.startDeceleration();
        }

    }
    hasDeceleration() {

        let flag = false;
        let allLength = this.touchRecord.length;
        let endIndex = allLength - 1;
        let startIndex = allLength - 1;

        // 然后计算出100毫秒前滚动的位置
        let movedX = 0;
        let movedY = 0;
        let timeOffset = 0;
        // 这里需要处理几种极端的滑动场景

        // 当只记录到一个滑动记录的时候，数组里面最少有三个
        if (allLength === 3) {
            movedX = 1;
            movedY = 1;
            timeOffset = 12;
        }
        if (allLength > 10) {
            // 如果是极端短距离滑动，直接设置开始为记录值的第一个
            if (allLength > 3 && allLength <= 10) {
                startIndex = 0;
            }
            // 正常滑动 将指针移动到100ms前测量的位置
            if (allLength > 10) {
                for (let i = endIndex; i > 0 && this.touchRecord[i].t > this.moveTouchT - 100; i -= 1) {
                    startIndex = i;
                }
            }
            movedX = this.scrollX - this.touchRecord[startIndex].x;
            movedY = this.scrollY - this.touchRecord[startIndex].y;
            timeOffset = this.touchRecord[endIndex].t - this.touchRecord[startIndex].t;
        }
        // 计算这两点之间的相对运动
        // 基于50ms计算每个渲染步骤的移动
        this.velocityX = (movedX / timeOffset) * (1000 / 60);
        this.velocityY = (movedY / timeOffset) * (1000 / 60);

        // let minVelocity = m.ops.paging || m.ops.snap ? 4 : 1;

        // 验证我们有足够的速度开始减速
        let isVelocityX = Math.abs(this.velocityX) > this.minVelocity;
        let isVelocityY = Math.abs(this.velocityY) > this.minVelocity;

        if (isVelocityX || isVelocityY) flag = true;

        return flag;
    }
}


export default Touch;
