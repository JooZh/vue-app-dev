import Deceleration from './Deceleration';

class Scroller extends Deceleration {
    constructor(selector, options) {
        super(selector);
        this.contentW = 0; // 滚动内容宽度
        this.contentH = 0; // 滚动内容高度
        this.containerW = 0; // 可视容器宽度
        this.containerH = 0; // 可视容器高度
    }
    getDimensions() {
        this.contentW = this.content.offsetWidth;
        this.contentH = this.content.offsetHeight;
        this.containerW = this.container.offsetWidth;
        this.containerH = this.container.offsetHeight;

        // 判断是否能开启滚动
        if (this.contentW > this.containerW && this.ops.scrollingX) {
            this.enableScrollX = this.ops.scrollingX;
        }
        if (this.contentH > this.containerH && this.ops.scrollingY) {
            this.enableScrollY = this.ops.scrollingY;
        }
    }
    updateDimensions() {
        //
    }
    doTouchMoveScroll(move, D) {
        let m = this;
        let scroll = 'scroll' + D;
        let maxScroll = 'maxScroll' + D;
        m[scroll] -= move * m.ops.speedRatio;
        if (m[scroll] > m[maxScroll] || m[scroll] < 0) {
            // 在边缘放慢速度
            if (m.ops.bouncing) {
                m[scroll] += (move / 1.5) * m.ops.speedRatio;
                D === 'Y' && this.doTouchMovePullRefresh();
            } else if (m[scroll] > m[maxScroll]) {
                m[scroll] = m[maxScroll];
            } else {
                m[scroll] = 0;
            }
        }
    }
    puhlishScroll() {
        //
    }
}

export default Scroller;