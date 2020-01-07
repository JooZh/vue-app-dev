import Touch from './Touch';

class Deceleration extends Touch {
    constructor(selector) {
        super(selector);
        this.minScrollX = 0; // 最小允许横向滚动宽度
        this.minScrollY = 0; // 最小允许纵向滚动高度
        this.maxScrollX = 0; // 最大允许横向滚动宽度
        this.maxScrollY = 0; // 最大允许纵向滚动高度
    }

    startDeceleration() {
        //
    }
    stepThroughDeceleration() {
        //
    }
}


export default Deceleration;
