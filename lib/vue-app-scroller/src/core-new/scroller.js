import Animate from './animate';
import PublicApi from './api';
import Render from './render';
import utils from './utils';
import Event from './Event';

class Scroller extends Event {
    constructor(selector, options) {
        super();
        let m = this;
        m.w = window;
        // 空函数用于初始化操作结束的回调
        m._NOOP = function() {};
        // 默认参数
        m.ops = {
            listenScroll: false, // 是否启用滚动监听实时获取滚动位置
            isPullRefresh: false, // 是否监听下拉刷新
            isReachBottom: false, // 是否监听触底事件
            scrollingX: false, // 启用x轴滚动
            scrollingY: false, // 启用y轴滚动
            animating: true, // 启用动画减速，弹回，缩放和滚动
            animationDuration: 250, // 由scrollTo/zoomTo触发的动画持续时间
            mousewheel: false, // 是否启用鼠标滚轮事件
            paging: false, // 启用分页模式(在全容器内容窗格之间切换)
            snap: false, // 启用对已配置像素网格的内容进行快照
            snapAlign: 'top', // snapAlign使用的方式 [top, middle] 居中对齐和顶部对齐
            snapSelect: 0, // snap默认选中的值
            snapListIndex: 0, // snap多列的时候的当前列
            bouncing: true, // 启用弹跳(内容可以慢慢移到外面，释放后再弹回来)
            speedRatio: 1, // 增加或减少滚动速度
            scrollingComplete: m._NOOP, // 在触摸端或减速端后端触发的回调，前提是另一个滚动动作尚未开始。用于知道何时淡出滚动条
            snapComplete: m._NOOP, // snap 滑动完成后的执行事件
            peneDece: 0.07, // 这配置了到达边界时应用于减速的更改量
            peneAcce: 0.08 // 这配置了到达边界时施加于加速度的变化量
        };
        // 参数合并
        for (let key in options) {
            m.ops[key] = options[key];
        }
        // 初始化对外api
        m._initPublicApi();
        // 初始化内置参数
        m._initAttr(selector);
        // 初始化snap大小
        m._initSnapSize(m.ops.snap);
        // 初始化事件监听
        m._initEvent();
    }
    /* ---------------------------------------------------------------------------
    初始化私有方法
  --------------------------------------------------------------------------- */
    // 初始化dom选择器
    _initSelector(selector) {
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
        return dom;
    }
    // 初始化参数
    _initAttr(selector) {
        let m = this;
        let dom = m._initSelector(selector);
        // 当前的滚动容器信息
        m._render = Render(dom); // 渲染函数
        m._content = dom; // 滚动区域容器节点
        m._container = dom.parentNode; // 可视区域容器节点
        m._animate = Animate; // 执行动画

        // 动画控制
        m._isDecelerating = false; // 是否正在减速中
        m._isAnimating = false; // 是否动画正在运行中
        m._interrupted = true; // 中止动画

        // 状态 {Boolean}
        m._isTracking = false; // 触摸事件序列是否正在进行中
        m.completeDeceleration = false; // 是否完成减速动画
        m._isDragging = false; // 用户移动的距离是否已达到启用拖动模式的程度。 提示:只有在移动了一些像素后，才可以不被点击等打断。

        m.enableScrollX = false; // 是否开启横向滚动
        m.enableScrollY = false; // 是否开启纵向向滚动
        m._refreshActive = false; // 现在释放事件时是否启用刷新进程
        m._reachActive = false; // 是否已经发送了触底事件
        m.snapAlignInit = false; // 是否已经初始化了snap type = center

        //  {Function}
        m._refreshStartCb = null; // 执行回调以启动实际刷新
        m._refreshCancelCb = null; // 在停用时执行的回调。这是为了通知用户刷新被取消
        m._refreshActiveCb = null; // 回调函数，以在激活时执行。这是为了在用户释放时通知他即将发生刷新
        // {Number}
        m.scrollX = 0; // 当前在x轴上的滚动位置
        m.scrollY = 0; // 当前在y轴上的滚动位置
        m.minScrollX = 0; // 最小允许横向滚动宽度
        m.minScrollY = 0; // 最小允许纵向滚动高度
        m.maxScrollX = 0; // 最大允许横向滚动宽度
        m.maxScrollY = 0; // 最大允许纵向滚动高度
        m._prevScrollX = 0; // 上一个横向滚动位置
        m._prevScrollY = 0; // 上一个纵向滚动位置

        m._scheduledX = 0; // 预定左侧位置(动画时的最终位置)
        m._scheduledY = 0; // 预定的顶部位置(动画时的最终位置)

        m._startTouchX = 0; // 开始时手指的左侧位置
        m._startTouchY = 0; // 开始时手指的顶部位置
        m._startTouchT = null; // {Date} 手指最后移动的时间戳。用于限制减速速度的跟踪范围。

        m._moveTouchX = 0; // 移动时候的手指左侧位置
        m._moveTouchY = 0; // 移动时候的手指顶部位置
        m._moveTouchT = null; // {Date} 手指最后移动的时间戳。用于限制减速速度的跟踪范围。

        m._endTouchX = 0; // 移动时候的手指左侧位置
        m._endTouchY = 0; // 移动时候的手指顶部位置
        m._endTouchT = null; // {Date} 手指最后移动的时间戳。用于限制减速速度的跟踪范围。

        m._velocityX = 0; // 当前因素修改水平滚动的位置与每一步
        m._velocityY = 0; // 当前因素修改垂直滚动位置与每一步

        m._refreshH = 0; // 下拉刷新区域的高度
        m._loadingH = 0; // 上拉加载区域的高度
        m._contentW = 0; // 滚动内容宽度
        m._contentH = 0; // 滚动内容高度
        m._containerW = 0; // 可视容器宽度
        m._containerH = 0; // 可视容器高度
        m._snapW = 50; // 开启网格滑动时网格宽度
        m._snapH = 50; // 开启网格滑动时网格高度

        m._minDeceX = 0; // 最小减速时X滚动位置
        m._minDeceY = 0; // 最小减速时Y滚动位置
        m._maxDeceX = 0; // 最大减速时X滚动位置
        m._maxDeceY = 0; // 最大减速时Y滚动位置
        // {Array} List
        m._touchArr = []; // 位置列表，每个状态使用三个索引=左、上、时间戳
    }
    // 初始化事件监听
    _initEvent() {
        let m = this;
        let el = m._container;
        // 判断是否支持触摸事件
        const supportTouch =
      (window.Modernizr && !!window.Modernizr.touch) ||
      (() => {
          return !!(
              'ontouchstart' in window ||
          (window.DocumentTouch && document instanceof window.DocumentTouch)
          );
      })();
        const _event = {
            start: supportTouch ? 'touchstart' : 'mousedown',
            move: supportTouch ? 'touchmove' : 'mousemove',
            end: supportTouch ? 'touchend' : 'mouseup'
        };
        // 触摸开始事件
        el.addEventListener(
            _event.start,
            e => {
                if (e.target.tagName.match(/input|textarea|select/i)) return;
                e.preventDefault();
                m.doTouchStart(e.touches, e.timeStamp);
            },
            false
        );
        // 触摸移动事件
        el.addEventListener(
            _event.move,
            e => {
                e.preventDefault();
                m.doTouchMove(e.touches, e.timeStamp);
            },
            false
        );
        // 触摸结束事件
        el.addEventListener(
            _event.end,
            e => {
                e.preventDefault();
                m.doTouchEnd(e.timeStamp);
            },
            false
        );
        // 鼠标滚动事件
        if (m.ops.mousewheel) {
            el.addEventListener(
                'mousewheel',
                e => {
                    m.scrollY = m.scrollY += e.deltaY;
                    if (m.scrollY > m.maxScrollY) {
                        m.scrollY = m.maxScrollY;
                    }
                    if (m.scrollY < 0) {
                        m.scrollY = 0;
                    }
                    m._publish(m.scrollX, m.scrollY, true);
                },
                false
            );
        }
    }
    // 初始化snap大小
    _initSnapSize(snap) {
        let m = this;
        if (typeof snap === 'number') {
            m._snapW = snap;
            m._snapH = snap;
        } else if (Array.isArray(snap)) {
            m._snapW = snap[0];
            m._snapH = snap[1];
        }
    }
    // 设置滚动可视区域
    _setDimensions() {
        let m = this;
        // 获取容器尺寸
        m._containerW = m._container.offsetWidth;
        m._containerH = m._container.offsetHeight;
        m._contentW = m._content.offsetWidth;
        m._contentH = m._content.offsetHeight;
        // 判断是否能开启滚动
        if (m._contentW > m._containerW && m.ops.scrollingX) {
            m.enableScrollX = m.ops.scrollingX;
        }
        if (m._contentH > m._containerH && m.ops.scrollingY) {
            m.enableScrollY = m.ops.scrollingY;
        }
        // 保留上一次的最大可滚动值
        // let prevMaxScroll = m.maxScrollY;
        // 获取子节点
        let childrens = m._content.children;
        // 保存下拉刷新和上拉加载的高度
        m._refreshH = m.ops.isPullRefresh ? childrens[0].offsetHeight : 0;
        m._loadingH = m.ops.isReachBottom
            ? childrens[childrens.length - 1].offsetHeight
            : 0;
        // 剧中类型的选择
        if (m.ops.snapAlign === 'middle') {
            let itemCount = Math.floor(Math.round(m._containerH / m._snapH) / 2);
            m._content.style.padding = `${itemCount * m._snapH}px 0`;
            if (!m.snapAlignInit) {
                m.scrollY = m.minScrollY + m.ops.snapSelect * m._snapH;
                m.snapAlignInit = true;
            }
        }
        // 更新可滚动区域的尺寸。
        m.maxScrollX = Math.max(m._contentW - m._containerW, 0);
        m.maxScrollY = Math.max(m._contentH - m._containerH, 0) - m._refreshH;
        // 更新可上拉加载状态区域
        m._reachActive = false;
        // 更新滚动位置
        m._scrollTo(m.scrollX, m.scrollY, true);
    }
    // 初始化公共api函数
    _initPublicApi() {
        let m = this;
        let apis = PublicApi(m);
        for (let api in apis) {
            m[api] = apis[api];
        }
    }
    /* ---------------------------------------------------------------------------
    触摸事件监听操作
  --------------------------------------------------------------------------- */
    // 触摸开始的时候，如果有动画正在运行，或者正在减速的时候都需要停止当前动画
    doTouchStart(touches, timeStamp) {
        utils._isTouch(timeStamp, touches);
        let m = this;
        m._isTracking = true;

        // 停止动画
        m._stopScroll();
        // 存储初始数据
        m._startTouchX = touches[0].pageX;
        m._startTouchY = touches[0].pageY;
        m._startTouchT = timeStamp;
        // 存储移动时候的数据
        m._moveTouchX = touches[0].pageX;
        m._moveTouchY = touches[0].pageY;
        m._moveTouchT = timeStamp;

        m._touchArr.push({
            x: m.scrollX,
            y: m.scrollY,
            t: timeStamp
        });
        console.log(this.scrollY, m._startTouchT, m._startTouchY);
    }
    // 触摸滑动的时候，
    doTouchMove(touches, timeStamp) {
        utils._isTouch(timeStamp, touches);
        let m = this;
        if (!m._isTracking) return;

        // 得到当前滑动的位置
        let currentTouchX = touches[0].pageX;
        let currentTouchY = touches[0].pageY;
        // 判断滑动方向需要在move的时候就判断
        // 是否已经进入了拖拽模式
        if (m._isDragging) {
            // 计算移动的距离
            let moveX = currentTouchX - m._moveTouchX;
            let moveY = currentTouchY - m._moveTouchY;
            // 是否开启了横向滚动
            if (m.enableScrollX) {
                m._doTouchMoveActive(moveX, 'X');
            }
            // 是否开启了纵向滚动
            if (m.enableScrollY) {
                m._doTouchMoveActive(moveY, 'Y');
            }
            // 防止列表无限增长(保持最小10，最大20测量点)
            if (m._touchArr.length > 100) {
                m._touchArr.splice(0, 20);
            }
            // 跟踪滚动的运动
            m._touchArr.push({
                x: m.scrollX,
                y: m.scrollY,
                t: timeStamp
            });
            // 同步滚动位置
            m._publish(m.scrollX, m.scrollY);

            // 否则，看看我们现在是否切换到拖拽模式。
        } else {
            // 给定进入拖拽的最小距离
            let minMoveDistance = 4;
            let distanceX = Math.abs(currentTouchX - m._moveTouchX); // 横向滑动距离绝对值
            let distanceY = Math.abs(currentTouchY - m._moveTouchY); // 纵向滑动距离绝对值
            // 有一定的触摸滑动距离后开启拖拽模式
            m._isDragging =
        distanceX >= minMoveDistance || distanceY >= minMoveDistance;
            // 如果进入拖拽模式解除动画中断标志
            if (m._isDragging) {
                m._interrupted = false;
            }
        }
        // 为下一个事件更新上次触摸的位置和时间戳
        m._moveTouchX = currentTouchX;
        m._moveTouchY = currentTouchY;
        m._moveTouchT = timeStamp;

        console.log(this.scrollY, m._moveTouchT, m._moveTouchY);
    }
    // 触摸事件结束
    doTouchEnd(timeStamp) {
        utils._isTouch(timeStamp);
        let m = this;
        if (!m._isTracking) return;

        m._endTouchX = m._moveTouchX;
        m._endTouchY = m._moveTouchY;
        m._endTouchT = timeStamp;

        m._touchArr.push({
            x: m.scrollX,
            y: m.scrollY,
            t: timeStamp
        });

        console.log(this.scrollY, timeStamp, m._moveTouchY, m._isDragging);

        // 不再触摸(当两根手指触碰屏幕时，有两个触摸结束事件)
        m._isTracking = false;

        // 是否进入拖拽状态 然后再验证是否
        if (m._isDragging) {
            // console.log("m._isDragging");
            // 重置拖拽标志
            m._isDragging = false;
            // 计算减速速度
            m._doTouchCanDeceleration();
            // 判断是否拉到了边界
            if (
                m.ops.animating &&
        (m.scrollX < 0 ||
          m.scrollX > m.maxScrollX ||
          m.scrollY < 0 ||
          m.scrollY > m.maxScrollY)
            ) {
                // console.log("回弹");
                // 启动回弹减速
                // m._stopScroll();
                // m._scrollTo(m.scrollX, m.scrollY, true);
                // m._getScrollToValues();
                if (m.enableScrollY) {
                    if (m._startTouchY - m._moveTouchY > 0) {
                        m._velocityY = -20;
                    } else if (m._startTouchY - m._moveTouchY < 0) {
                        m._velocityY = 20;
                    } else {
                        m._velocityY = 0;
                    }
                    // console.log(m._velocityY);
                }
                m._startDeceleration();
            } else {
                m._startDeceleration();
            }
            // 开始减速 验证最后一次检测到的移动是否在某个相关的时间范围内
            //   if (m.ops.animating && timeStamp - m._moveTouchT <= 100) {
            //     let isDeceleration = m._doTouchCanDeceleration();
            //     // 开始减速 当没有下拉刷新状态
            //     if (isDeceleration) {
            //       if (!m._refreshActive) {
            //         m._startDeceleration();
            //       }
            //     } else {
            //       m._scrollingComplete();
            //     }
            //   }
            // }
            // 如果这是一个较慢的移动，它是默认不减速，但这个仍然意味着我们想要回到这里的边界。为了提高边缘盒的稳定性，将其置于上述条件之外
            // 例如，touchend在没有启用拖放的情况下被触发。这通常不应该修改了滚动条的位置，甚至显示了滚动条。

            // if (!m._isDecelerating) {
            //   console.log("!m._isDecelerating");
            //   // 如果有下拉刷新事件时
            //   if (m._refreshActive && m._refreshStartCb) {
            //     console.log(1);
            //     // 使用publish而不是scrollTo来允许滚动到超出边界位置
            //     // 我们不需要在这里对scrollLeft、zoomLevel等进行规范化，因为我们只在启用了滚动刷新时进行y滚动
            //     m._publish(m.scrollX, -m._refreshH, true);
            //     if (m._refreshStartCb) {
            //       m._refreshStartCb();
            //     }
            //   } else {
            //     if (m._interrupted || m._isDragging) {
            //       console.log(2);
            //       m._scrollingComplete();
            //     }
            //     if (timeStamp - m._lastTouchT > 300) {
            //       console.log(3);
            //       m._scrollTo(m.scrollX, m.scrollY, true);
            //       m._getScrollToValues();
            //     } else {
            //       console.log(4);
            //       if (m.enableScrollY) {
            //         if (m._startTouchY - m._moveTouchY > 0) {
            //           m._velocityY = -20;
            //         } else if (m._startTouchY - m._moveTouchY < 0) {
            //           m._velocityY = 20;
            //         } else {
            //           m._velocityY = 0;
            //         }
            //       }
            //       m._startDeceleration();
            //     }
            //     // 在刷新时不做任何操作
            //     if (m._refreshActive) {
            //       console.log(5);
            //       m._refreshActive = false;
            //       if (m._refreshCancelCb) {
            //         m._refreshCancelCb();
            //       }
            //     }
            //   }
        }
        // 清空记录列表
        m._touchArr.length = 0;
    }
    /* ---------------------------------------------------------------------------
    触摸事件的 私有方法
  --------------------------------------------------------------------------- */
    // 拖拽滚动
    _doTouchMoveActive(move, D) {
        let m = this;
        let scroll = 'scroll' + D;
        let maxScroll = 'maxScroll' + D;
        m[scroll] -= move * m.ops.speedRatio;
        if (m[scroll] > m[maxScroll] || m[scroll] < 0) {
            // 在边缘放慢速度
            if (m.ops.bouncing) {
                m[scroll] += (move / 1.5) * m.ops.speedRatio;
                D === 'Y' && m._doTouchMovePullRefresh();
            } else if (m[scroll] > m[maxScroll]) {
                m[scroll] = m[maxScroll];
            } else {
                m[scroll] = 0;
            }
        }
    }
    // 支持下拉刷新(仅当只有y可滚动时)
    _doTouchMovePullRefresh() {
        let m = this;
        if (!m.enableScrollX && m._refreshH != null) {
            if (!m._refreshActive && m.scrollY <= -m._refreshH) {
                m._refreshActive = true;
                if (m._refreshActiveCb) {
                    m._refreshActiveCb();
                }
            } else if (m._refreshActive && m.scrollY > -m._refreshH) {
                m._refreshActive = false;
                if (m._refreshCancelCb) {
                    m._refreshCancelCb();
                }
            }
        }
    // console.log(m._refreshActive);
    }
    // 是否可以减速
    _doTouchCanDeceleration() {
        let m = this;
        let flag = false;
        // 然后计算出100毫秒前滚动的位置
        let touchArrLength = m._touchArr.length - 1;
        let endIndex = touchArrLength;
        let startIndex = touchArrLength;
        //
        let movedX = 0;
        let movedY = 0;
        let timeOffset = 0;
        // 这里需要处理几种极端的滑动场景
        // 当只记录到一个滑动记录的时候
        console.log(JSON.stringify(m._touchArr));
        if (m._touchArr.length === 1) {
            timeOffset = 12;
            movedX = m.scrollX - m._prevScrollX;
            movedY = m.scrollY - m._prevScrollY;
        }
        // 记录到多个滑动记录
        if (m._touchArr.length > 1) {
            if (m._touchArr.length > 1 && m._touchArr.length <= 6) {
                // 如果是极端短距离滑动，直接设置开始为记录值的第一个
                startIndex = 0;
            } else if (m._touchArr.length > 6) {
                // 正常滑动 将指针移动到100ms前测量的位置
                for (
                    let i = touchArrLength;
                    i > 0 && m._touchArr[i].t > m._moveTouchT - 100;
                    i -= 1
                ) {
                    startIndex = i;
                }
            }
            timeOffset = m._touchArr[endIndex].t - m._touchArr[startIndex].t;
            movedX = m.scrollX - m._touchArr[startIndex].x;
            movedY = m.scrollY - m._touchArr[startIndex].y;
        }

        // 如果开始和停止位置在100ms时间内相同，我们无法计算任何有用的减速。
        // console.log(JSON.stringify(m._touchArr));
        // console.log(JSON.stringify(m._touchArr[startIndex]));
        // console.log(JSON.stringify(m._touchArr[endIndex]));
        // if (endIndex !== startIndex) {
        // 计算这两点之间的相对运动

        // 基于50ms计算每个渲染步骤的移动
        m._velocityX = (movedX / timeOffset) * (1000 / 60);
        m._velocityY = (movedY / timeOffset) * (1000 / 60);
        // 开始减速需要多少速度
        // let minVelocityToStartDeceleration = m.ops.paging || m.ops.snap ? 4 : 1;
        // 验证我们有足够的速度开始减速
        // let isVelocityX = Math.abs(m._velocityX) > minVelocityToStartDeceleration;
        // let isVelocityY = Math.abs(m._velocityY) > minVelocityToStartDeceleration;
        // if (isVelocityX || isVelocityY) {
        flag = true;
        // }
        // } else {

        // }
        return flag;
    }
    /* ---------------------------------------------------------------------------
    下拉刷新
  --------------------------------------------------------------------------- */
    // 激活pull-to-refresh。列表顶部的一个特殊区域，用于在用户事件在此区域可见期间被释放时启动列表刷新。
    activatePullToRefresh(activateCb, deactivateCb, startCb) {
        let m = this;
        m._refreshStartCb = startCb; // 下拉刷新开始
        m._refreshActiveCb = activateCb; // 下拉刷新激活
        m._refreshCancelCb = deactivateCb; // 下拉刷新取消
    }
    // 标志下拉刷新完成。
    finishPullToRefresh() {
        let m = this;
        m._refreshActive = false;
        if (m._refreshCancelCb) {
            m._refreshCancelCb();
        }
        m._scrollTo(m.scrollX, m.scrollY, true);
    }
    /* ---------------------------------------------------------------------------
    PRIVATE API
  --------------------------------------------------------------------------- */
    // 停止滚动，停止动画
    _stopScroll() {
        let m = this;
        // 重置中断动画标志
        m._interrupted = true;
        // 当减速停止时候停止动画
        if (m._isDecelerating) {
            m._animate.stop(m._isDecelerating);
            m._isDecelerating = false;
            m._interrupted = true;
        }
        // 当动画正在运行时候停止动画
        if (m._isAnimating) {
            m._animate.stop(m._isAnimating);
            m._isAnimating = false;
            m._interrupted = true;
        }
        // 复位减速完成标志
        m.completeDeceleration = false;
        // 清除数据结构
        m._touchArr = [];
    }
    // 滚动到指定位置。边界限制，自动截断。
    _scrollTo(left, top, animate) {
        let m = this;
        // 停止减速
        if (m._isDecelerating) {
            m._animate.stop(m._isDecelerating);
            m._isDecelerating = false;
        }
        if (!m.ops.scrollingX) {
            left = m.scrollX;
        } else {
            if (m.ops.paging) {
                left = Math.round(left / m._containerW) * m._containerW;
            } else if (m.ops.snap) {
                left = Math.round(left / m._snapW) * m._snapW;
            }
        }
        if (!m.ops.scrollingY) {
            top = m.scrollY;
        } else {
            if (m.ops.paging) {
                top = Math.round(top / m._containerH) * m._containerH;
            } else if (m.ops.snap) {
                top = Math.round(top / m._snapH) * m._snapH;
            }
        }
        // 容许范围极限
        left = Math.max(Math.min(m.maxScrollX, left), 0);
        top = Math.max(Math.min(m.maxScrollY, top), 0);
        // 当没有检测到更改时，不要动画，仍然调用publish以确保呈现的位置与内部数据是同步的
        if (left === m.scrollX && top === m.scrollY) {
            animate = false;
        }
        // 发布新值
        if (!m._isTracking) {
            m._publish(left, top, animate);
        }
    }
    // 滚动到指定节点。尊重边界，自动截断。
    // _scrollToElement(left, top, animate) {}
    // 按给定的偏移量滚动
    _scrollBy(left, top, animate) {
        let m = this;
        let startX = m._isAnimating ? m._scheduledX : m.scrollX;
        let startY = m._isAnimating ? m._scheduledY : m.scrollY;
        m._scrollTo(startX + (left || 0), startY + (top || 0), animate);
    }
    // 将滚动位置应用于内容元素
    _publish(left, top, animate) {
        let m = this;
        // 记住我们是否有动画，然后我们尝试基于动画的当前“驱动器”继续
        // 当前主要服务于 snap
        let wasAnimating = m._isAnimating;
        if (wasAnimating) {
            m._animate.stop(wasAnimating);
            m._isAnimating = false;
            m._interrupted = true;
        }

        if (animate && m.ops.animating) {
            // 为scrollBy/zoomBy功能保留预定位置
            m._scheduledX = left;
            m._scheduledY = top;
            let oldLeft = m.scrollX;
            let oldTop = m.scrollY;
            let diffLeft = left - oldLeft;
            let diffTop = top - oldTop;
            let step = (percent, now, render) => {
                if (render) {
                    m.scrollX = oldLeft + diffLeft * percent;
                    m.scrollY = oldTop + diffTop * percent;
                    // 将值返回
                    if (m._render) {
                        m._render(m.scrollX, m.scrollY);
                    }
                }
            };
            let verify = id => {
                return m._isAnimating === id;
            };
            let completed = (renderedFramesPerSecond, animationId, wasFinished) => {
                if (animationId === m._isAnimating) {
                    m._isAnimating = false;
                }
                if (m.completeDeceleration || wasFinished) {
                    m._scrollingComplete();
                    m._snapComplete();
                }
            };
            // 当继续基于之前的动画时，我们选择一个ease-out动画而不是ease-in-out
            let animatType = wasAnimating ? utils._easeOut : utils._easeInOut;
            m._isAnimating = m._animate.start(
                step,
                verify,
                completed,
                m.ops.animationDuration,
                animatType
            );
        } else {
            m._scheduledX = m.scrollX = left;
            m._scheduledY = m.scrollY = top;
            // 将值返回
            if (m._render) {
                m._render(left, top);
            }
        }
        // 节流 是否需要监听触底事件
        if (m.ops.isReachBottom && !m._reachActive) {
            let scrollYn = Number(m.scrollY.toFixed());
            let absMaxScrollYn = m.maxScrollY - m._loadingH;
            if (scrollYn > absMaxScrollYn && absMaxScrollYn > 0) {
                m.emit('loading', {
                    hasMore: true
                });
                m._reachActive = true;
            }
        }
        // 是否需要监听滚动事件
        if (m.ops.listenScroll) {
            // 节流 只判断整数变化
            let isChangeX = m._prevScrollX.toFixed() !== m.scrollX.toFixed();
            let isChangeY = m._prevScrollY.toFixed() !== m.scrollY.toFixed();
            if (isChangeX || isChangeY) {
                m.emit('scroll', {
                    x: Math.floor(m.scrollX),
                    y: Math.floor(m.scrollY)
                });
            }
        }
    }
    // 完成动画的操作 可能有多种滚动完成事件
    _scrollingComplete() {
        let m = this;
        m.ops.scrollingComplete();
    }
    // 选择器完成事件，只在指定的情况下触法
    _snapComplete() {
        let m = this;
        if (m.ops.snapAlign === 'middle') {
            m.ops.snapComplete(m._getSnapValue());
        }
    }
    // 计算当前snap选择的是哪个节点
    _getSnapValue() {
        let m = this;
        let minScrollY = Math.abs(m.minScrollY);
        let scrollY =
      m.scrollY < 0
          ? minScrollY - Math.abs(m.scrollY)
          : minScrollY + Math.abs(m.scrollY);
        let num = scrollY / m._snapH;
        return {
            listIndex: m.ops.snapListIndex,
            selectIndex: Math.floor(num)
        };
    }
    // 修复调用scrollTo 方法时候无法获取当前滚动高度的方法，只在非进入减速状态下调用
    _getScrollToValues() {
        let m = this;
        let interTimer = setInterval(() => {
            // 节流 只判断整数变化
            let isChangeX = m._prevScrollX.toFixed() !== m.scrollX.toFixed();
            let isChangeY = m._prevScrollY.toFixed() !== m.scrollY.toFixed();
            if (isChangeX || isChangeY) {
                m.emit('scroll', {
                    x: Math.floor(m.scrollX),
                    y: Math.floor(m.scrollY)
                });
            } else {
                let outTimer = setTimeout(() => {
                    let x = m.scrollX;
                    let y = m.scrollY;
                    if (m.scrollY === 0) y = 0;
                    if (m.scrollX === 0) x = 0;
                    if (m.scrollY === m.maxScrollY) y = m.maxScrollY;
                    if (m.scrollX === m.maxScrollX) x = m.maxScrollX;
                    m.emit('scroll', {
                        x: Math.floor(x),
                        y: Math.floor(y)
                    });
                    clearInterval(interTimer);
                    clearTimeout(outTimer);
                }, 50);
            }
        }, 30);
    }
    /* ---------------------------------------------------------------------------
    ANIMATION (DECELERATION) SUPPORT
  --------------------------------------------------------------------------- */
    // 开始进入减速模式
    _startDeceleration() {
        let m = this;
        // 是否分屏
        if (m.ops.paging) {
            let scrollX = Math.max(Math.min(m.scrollX, m.maxScrollX), 0);
            let scrollY = Math.max(Math.min(m.scrollY, m.maxScrollY), 0);
            // 我们不是将减速限制在允许范围的最小/最大值，而是将减速限制在可见客户机区域的大小。每个页面都应该有准确的客户区域大小。
            m._minDeceX = Math.floor(scrollX / m._containerW) * m._containerW;
            m._minDeceY = Math.floor(scrollY / m._containerH) * m._containerH;
            m._maxDeceX = Math.ceil(scrollX / m._containerW) * m._containerW;
            m._maxDeceY = Math.ceil(scrollY / m._containerH) * m._containerH;
        } else {
            m._minDeceX = 0;
            m._minDeceY = 0;
            m._maxDeceX = m.maxScrollX;
            m._maxDeceY = m.maxScrollY;
        }
        // 包装类方法
        let step = (percent, now, render) => {
            m._stepThroughDeceleration(render);
        };
        // 保持减速运行需要多少速度
        let minVelocityToKeepDecelerating = m.ops.snap ? 2 : 0.001;
        // 检测是否仍然值得继续动画步骤 如果我们已经慢到无法再被用户感知，我们就会在这里停止整个过程。
        let verify = () => {
            let shouldContinue =
        Math.abs(m._velocityX) >= minVelocityToKeepDecelerating ||
        Math.abs(m._velocityY) >= minVelocityToKeepDecelerating;
            if (!shouldContinue) {
                m.completeDeceleration = true;
            }
            return shouldContinue;
        };
        //
        let completed = () => {
            // let completed = (renderedFramesPerSecond, animationId, wasFinished) => {
            m._isDecelerating = false;
            if (m.completeDeceleration) {
                m._scrollingComplete();
            }
            // 动画网格时，捕捉是活跃的，否则只是固定边界外的位置
            m._scrollTo(m.scrollX, m.scrollY, m.ops.snap);
        };
        // 启动动画并打开标志
        m._isDecelerating = m._animate.start(step, verify, completed);
    // console.log(m._isDecelerating);
    }
    // 调用动画的每一步
    _stepThroughDeceleration(render) {
        let m = this;
        // 计算下一个滚动位置 增加减速到滚动位置
        let scrollX = m.scrollX + m._velocityX;
        let scrollY = m.scrollY + m._velocityY;
        // 硬性限制滚动位置为非弹跳模式
        if (!m.ops.bouncing) {
            let scrollLeftFixed = Math.max(
                Math.min(m._maxDeceX, scrollX),
                m._minDeceX
            );
            if (scrollLeftFixed !== scrollX) {
                scrollX = scrollLeftFixed;
                m._velocityX = 0;
            }
            let scrollTopFixed = Math.max(
                Math.min(m._maxDeceY, scrollY),
                m._minDeceY
            );
            if (scrollTopFixed !== scrollY) {
                scrollY = scrollTopFixed;
                m._velocityY = 0;
            }
        }
        // 记录上一个滚动位置
        m._prevScrollX = m.scrollX;
        m._prevScrollY = m.scrollY;
        // 更新滚动位置
        if (render) {
            m._publish(scrollX, scrollY);
        } else {
            m.scrollX = scrollX;
            m.scrollY = scrollY;
        }
        // 在每次迭代中减慢速度 模拟自然行为
        if (!m.ops.paging) {
            let frictionFactor = 0.97;
            m._velocityX *= frictionFactor;
            m._velocityY *= frictionFactor;
        }
        // 跳跃的支持
        if (m.ops.bouncing) {
            let scrollOutsideX = 0;
            let scrollOutsideY = 0;
            // 这配置了到达边界时应用于减速/加速的更改量
            let peneDece = m.ops.peneDece;
            let peneAcce = m.ops.peneAcce;
            // 检查限制
            if (scrollX < m._minDeceX) {
                scrollOutsideX = m._minDeceX - scrollX;
            } else if (scrollX > m._maxDeceX) {
                scrollOutsideX = m._maxDeceX - scrollX;
            }
            if (scrollY < m._minDeceY) {
                scrollOutsideY = m._minDeceY - scrollY;
            } else if (scrollY > m._maxDeceY) {
                scrollOutsideY = m._maxDeceY - scrollY;
            }
            // 慢下来，直到足够慢，然后翻转回弹起位置
            if (scrollOutsideX !== 0) {
                if (scrollOutsideX * m._velocityX <= 0) {
                    m._velocityX += scrollOutsideX * peneDece;
                } else {
                    m._velocityX = scrollOutsideX * peneAcce;
                }
            }
            if (scrollOutsideY !== 0) {
                if (scrollOutsideY * m._velocityY <= 0) {
                    m._velocityY += scrollOutsideY * peneDece;
                } else {
                    m._velocityY = scrollOutsideY * peneAcce;
                }
            }
        }
    }
}

export default Scroller;