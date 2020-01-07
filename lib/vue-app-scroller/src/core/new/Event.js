//  初始化 滑动容器
//  订阅事件 注册给定类型的事件处理程序， type -> 自定义事件类型， handler -> 自定义事件回调函数
import Attributes from './Attributes';
class Event extends Attributes {
    constructor(selector, options) {
        super(options);
        this.initElement(selector);
    }
    // 初始化节点
    initElement(selector) {
        // 验证
        if (!selector) {
            throw new Error('Could not find node to mount scroll');
        }
        // 初始化挂载节点
        if (typeof selector === 'string') {
            let el = document.querySelector(selector);
            if (el) {
                this.content = el;
            } else {
                throw new Error(`Could not find element "${selector}" `);
            }
        } else if (selector instanceof HTMLElement) {
            this.content = selector;
        }
        this.container = this.content.parentNode;
    }
    // 启动事件监听
    initEventListener() {
        let el = this.container;
        // 触摸开始事件
        el.addEventListener(
            'touchstart',
            e => {
                if (e.target.tagName.match(/input|textarea|select/i)) return;
                e.preventDefault();
                this.doTouchStart(e.touches, e.timeStamp);
            },
            false
        );
        // 触摸移动事件
        el.addEventListener(
            'touchmove',
            e => {
                e.preventDefault();
                this.doTouchMove(e.touches, e.timeStamp);
            },
            false
        );
        // 触摸结束事件
        el.addEventListener(
            'touchend',
            e => {
                e.preventDefault();
                this.doTouchEnd(e.timeStamp);
            },
            false
        );
    }
    // 订阅事件 监听事件 并做处理
    on(eventType, handle) {
        if (!this.handles.hasOwnProperty(eventType)) {
            this.handles[eventType] = [];
        }
        if (typeof handle === 'function') {
            this.handles[eventType].push(handle);
        } else {
            throw new Error('Missing callback function');
        }
    }
    // 订阅事件 发送事件 以及附带参数和
    emit(eventType, ...args) {
        if (this.handles.hasOwnProperty(eventType)) {
            this.handles[eventType].forEach(item => {
                item.apply(null, args);
            });
        } else {
            throw new Error(`"${eventType}" Event not registered`);
        }
    }
}

export default Event;
