class Attributes {
    constructor(options) {
        this.opt = options;
        this.handles = {
            scroll: [], // 发送滚动监听事件
            loading: [] // 发送下拉加载事件
        };
        this.content = null;     // 滚动区域容器节点
        this.container = null;   // 可视区域容器节点

        this.minScrollX = 0; // 最小允许横向滚动宽度
        this.minScrollY = 0; // 最小允许纵向滚动高度
        this.maxScrollX = 0; // 最大允许横向滚动宽度
        this.maxScrollY = 0; // 最大允许纵向滚动高度

        this.contentW = 0; // 滚动内容宽度
        this.contentH = 0; // 滚动内容高度
        this.containerW = 0; // 可视容器宽度
        this.containerH = 0; // 可视容器高度

        this.isTracking = false;

        this.startTouchX = 0;
        this.startTouchY = 0;
        this.startTouchT = 0;

        this.moveTouchX = 0;
        this.moveTouchY = 0;
        this.moveTouchT = 0;

        this.endTouchX = 0;
        this.endTouchY = 0;
        this.endTouchT = 0;

        this.touchRecord = [];

        this.enableScrollX = false;
        this.enableScrollY = false;

        this.scrollX = 0;       // 当前在x轴上的滚动位置
        this.scrollY = 0;       // 当前在y轴上的滚动位置

        this.velocityX = 0;
        this.velocityY = 0;
        this.minVelocity = 1;   // 开始减速需要多少速度
    }
}

export default Attributes;
