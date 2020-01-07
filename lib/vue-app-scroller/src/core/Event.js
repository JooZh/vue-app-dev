// SubScription 订阅事件 注册给定类型的事件处理程序， type -> 自定义事件类型， handler -> 自定义事件回调函数

class Event {
    constructor(selector) {
        this.handles = {
            scroll: [], // 发送滚动监听事件
            loading: [] // 发送下拉加载事件
        };
        // this._content = null; // 滚动区域容器节点
        // this._container = this._content.parentNode; // 可视区域容器节点
        this.initElement(selector);
    }
    initElement(selector) {
        if (!selector) throw new Error('Could not find node to mount scroll');
        // 初始化挂载节点
        if (typeof selector === 'string') {
            this.content = document.querySelector(selector);
        } else if (typeof selector === 'object' && selector.nodeType === 1) {
            this.content = selector;
        }
        this.container = this.content.parentNode;
    }
    //
    on(eventType, handle) {
        if (!this.handles.hasOwnProperty(eventType)) {
            this._handles[eventType] = [];
        }
        if (typeof handle === 'function') {
            this.handles[eventType].push(handle);
        } else {
            throw new Error('Missing callback function');
        }
    }
    // 发送 事件 以及附带参数和
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
