class Obderver {
    constructor(selector) {
        let m = this;
        let dom = null;
        if (typeof selector === 'string') {
            dom = document.querySelector(selector);
        } else if (typeof selector === 'object' && selector.nodeType === 1) {
            dom = selector;
        }
        // 启动 dom 变化 监听事件 用于更新滚动区域后重新计算当前可滚动区域
        let MutationObserver =
      m.w.MutationObserver ||
      m.w.WebKitMutationObserver ||
      m.w.MozMutationObserver;
        let observerMutationSupport = !!MutationObserver;
        if (observerMutationSupport) {
            let observer = new MutationObserver(mutations => {
                let length = mutations.length - 1;
                mutations.forEach((item, index) => {
                    if (m.ops.snap) {
                        m.refresh();
                    } else {
                        if (length === index) {
                            let timer = setTimeout(() => {
                                m.refresh();
                                clearTimeout(timer);
                            }, 500);
                        }
                    }
                });
            });
            observer.observe(dom.children[1], {
                childList: true, // 子节点的变动
                subtree: true, // 所有后代节点的变动
                // "attributes" : true,//属性的变动
                characterData: true // 节点内容或节点文本的变动
                // "attributeOldValue" : true,//表示观察attributes变动时，是否需要记录变动前的属性
                // characterDataOldValue: true //表示观察characterData变动时，是否需要记录变动前的值
            });
        }
    }
    init() {}
}

export default Obderver;
