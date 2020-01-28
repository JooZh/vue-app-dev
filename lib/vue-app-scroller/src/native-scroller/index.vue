<template>
    <div
        ref="container"
        class="scroller-container"
        :class="{
            'no-scroll-bar': !scrollBar,
            'scroll-touch': touchScrolling,
            'scrolling-x': scrollingX,
            'scrolling-y': scrollingY
        }"
    >
        <div class="scroller-wapper" style="overflow:hidden">
            <div ref="content" class="scroller-content" :class="{ 'is-dropped': refreshDropped || loadmoreDropped }" :style="transform">
                <slot v-if="onPullRefresh" name="pullRefresh">
                    <div class="pull-refresh">
                        <arrow v-if="arrowRefresh" class="arrow" :class="{ 'active': refreshStatus === 'drop' }" />
                        <spinner v-else class="spinner" />
                    </div>
                </slot>
                <slot></slot>
                <slot v-if="onReachBottom" name="reachBottom">
                    <div class="reach-bottom">
                        <spinner v-if="onReachBottomShowloading" class="spinner" />
                        <span v-else class="loading-more">没有更多数据</span>
                    </div>
                </slot>
                <slot v-if="onLoadMore" name="loadMore">
                    <div class="load-more">
                        <arrow v-if="arrowLoadmore" class="arrow" :class="{ 'active': loadmoreStatus === 'drop' }" />
                        <spinner v-else class="spinner" />
                    </div>
                </slot>
            </div>
        </div>
    </div>
</template>

<script>
import Spinner from '../components/Spinner';
import Arrow from '../components/Arrow';
export default {
    components: {
        Spinner,
        Arrow
    },
    props: {
        scrollBar: {
            type: Boolean,
            required: false,
            description: '是否需要显示滚动条',
            default: true
        },
        lockBody: {
            type: Boolean,
            required: false,
            description: '是否需要锁定body',
            default: false
        },
        touchScrolling: {
            type: Boolean,
            required: false,
            description: '是否需要启用 overflow-scrolling',
            default: false
        },
        scrollingX: {
            type: Boolean,
            required: false,
            description: '是否横向滚动',
            default: false,
        },
        scrollingY: {
            type: Boolean,
            required: false,
            description: '是否纵向滚动',
            default: false,
        },
        onScroll: {
            type: Function,
            required: false,
            description: '滚动监听函数',
            default: null
        },
        onPullRefresh: {
            type: Function,
            required: false,
            description: '下拉刷新处理函数',
            default: null
        },
        onReachBottom: {
            type: Function,
            required: false,
            description: '上拉触底事件',
            default: null
        },
        onLoadMore: {
            type: Function,
            required: false,
            description: '上拉加载更多事件',
            default: null
        }
    },
    data() {
        return {
            ready: false,
            onReachBottomloading: true,
            onReachBottomShowloading: true,
            scrollTop: 0,
            scrollLeft: 0,
            contentHeight: 0,
            containerHeight: 0,
            container: null,
            content: null,

            maxDistance: 0,
            translate: 0,
            containerFilled: false,
            topText: '',
            bottomText: '',

            bottomReached: false,

            direction: '',
            startY: 0,
            startScrollTop: 0,
            currentY: 0,
            refreshStatus: '',
            refreshDropped: false,
            refreshDone: false,
            loadmoreStatus: '',
            loadmoreDropped: false,
            loadmoreDone: false,
        };
    },
    computed: {
        transform() {
            if (this.translate === 0) {
                return null;
            } else {
                return { 'transform': 'translate3d(0, ' + this.translate + 'px, 0)' };
            }
        },
        arrowRefresh() {
            return this.refreshStatus !== 'loading' && !this.refreshDone;
        },
        arrowLoadmore() {
            return this.loadmoreStatus !== 'loading' && !this.loadmoreDone;
        }
    },
    mounted() {
        this.initRefs().then(() => {
            this.lockBodyHandle();
            this.onScrollHandle();
            this.observerContent();
            if (this.onPullRefresh || this.onLoadMore) this.touchEvents();
            // if (this.onReachBottom) this.observerContent();
            this.ready = true;
        });
    },
    activated() {
        if (this.ready) {
            this.container.scrollLeft = this.scrollLeft;
            this.container.scrollTop = this.scrollTop;
        }
    },
    methods: {
        initRefs() {
            return new Promise(resolve => {
                this.$nextTick(() => {
                    this.container = this.$refs.container;
                    this.content = this.$refs.content;
                    this.contentHeight = this.getRect('content').height;
                    this.containerHeight = this.getRect('container').height;
                    resolve(true);
                });
            });
        },
        getRect(el) {
            return this[el].getBoundingClientRect();
        },
        lockBodyHandle() {
            if (this.lockBody) {
                let body = document.querySelector('body');
                let html = document.querySelector('html');
                body.style.overflow = 'hidden';
                body.style.width = '100%';
                body.style.height = '100%';
                html.style.width = '100%';
                html.style.height = '100%';
            }
        },
        onScrollHandle() {
            this.container.addEventListener('scroll', e => {
                this.scrollLeft = this.container.scrollLeft;
                this.scrollTop = this.container.scrollTop;
                if (this.onScroll) {
                    this.onScroll({
                        x: this.container.scrollLeft,
                        y: this.container.scrollTop
                    });
                }
                if (this.onReachBottom) {
                    let loadHeight = this.containerHeight + this.scrollTop;
                    if (this.onReachBottomloading && this.contentHeight < (loadHeight + 50)) {
                        this.onReachBottom(this.onReachBottomDone);
                        this.onReachBottomloading = false;
                    }
                }
            });
        },
        // ===== 触摸事件 =====
        touchEvents() {
            this.container.addEventListener('touchstart', this.handleTouchStart);
            this.container.addEventListener('touchmove', this.handleTouchMove);
            this.container.addEventListener('touchend', this.handleTouchEnd);
        },
        handleTouchStart(event) {
            // event.preventDefault();
            this.startY = event.touches[0].clientY;
            this.startScrollTop = this.scrollTop;
            this.bottomReached = false;
            if (this.refreshStatus !== 'loading') {
                this.refreshStatus = 'pull';
                this.refreshDropped = false;
                this.refreshDone = false;
            }
            if (this.loadmoreStatus !== 'loading') {
                this.loadmoreStatus = 'pull';
                this.loadmoreDropped = false;
                this.loadmoreDone = false;
            }
        },
        handleTouchMove(event) {
            // event.preventDefault();
            let containerTop = this.getRect('container').top;
            let containerBottom = this.getRect('container').bottom;
            if (this.startY < containerTop && this.startY > containerBottom) {
                return;
            }
            this.currentY = event.touches[0].clientY;
            let distance = (this.currentY - this.startY) / 2;
            this.direction = distance > 0 ? 'down' : 'up';

            this.onPullRefresh && this.onPullRefreshMoveHandle(distance);

            if (this.direction === 'up') {
                this.bottomReached = this.bottomReached || this.contentHeight - this.containerHeight - 100 === this.scrollTop;
            }
            this.onLoadMore && this.onLoadMoreMoveHandle(distance);
        },
        handleTouchEnd(event) {
            event.preventDefault();
            this.onPullRefresh && this.onPullRefreshEndHandle();
            this.onLoadMore && this.onLoadMoreEndHandle();
            this.direction = '';
        },
        // ====== 下拉加载 ========
        onPullRefreshMoveHandle(distance) {
            if (this.direction === 'down' && this.scrollTop === 0 && this.refreshStatus !== 'loading') {
                event.preventDefault();
                if (this.maxDistance > 0) {
                    this.translate = distance <= this.maxDistance ? distance - this.startScrollTop : this.translate;
                } else {
                    this.translate = distance - this.startScrollTop;
                }
                if (this.translate < 0) {
                    this.translate = 0;
                }
                this.refreshStatus = this.translate >= 70 ? 'drop' : 'pull';
            }
        },
        onPullRefreshEndHandle() {
            if (this.direction === 'down' && this.scrollTop === 0 && this.translate > 0) {
                this.refreshDropped = true;
                if (this.refreshStatus === 'drop') {
                    this.translate = '50';
                    this.refreshStatus = 'loading';
                    this.onPullRefresh(this.onPullRefreshDone);
                } else {
                    this.translate = '0';
                    this.refreshStatus = 'pull';
                }
            }
        },
        onPullRefreshDone() {
            this.translate = '0';
            this.refreshDone = true;
            this.refreshStatus = 'pull';
        },
        // ====== 上拉加载 ========
        onLoadMoreMoveHandle(distance) {
            if (this.direction === 'up' && this.bottomReached && this.loadmoreStatus !== 'loading') {
                event.preventDefault();
                if (this.maxDistance > 0) {
                    this.translate = Math.abs(distance) <= this.maxDistance ? this.scrollTop - this.startScrollTop + distance : this.translate;
                } else {
                    this.translate = this.scrollTop - this.startScrollTop + distance;
                }
                if (this.translate > 0) {
                    this.translate = 0;
                }
                this.loadmoreStatus = -this.translate >= 70 ? 'drop' : 'pull';
            }
        },
        onLoadMoreEndHandle() {
            if (this.direction === 'up' && this.bottomReached && this.translate < 0) {
                this.loadmoreDropped = true;
                this.bottomReached = false;
                if (this.loadmoreStatus === 'drop') {
                    this.translate = '-50';
                    this.loadmoreStatus = 'loading';
                    this.onLoadMore(this.onLoadMoreDone);
                } else {
                    this.translate = '0';
                    this.loadmoreStatus = 'pull';
                }
            }
        },
        onLoadMoreDone() {
            this.translate = '0';
            this.loadmoreDone = true;
            this.loadmoreStatus = 'pull';
        },

        //  ===== 触底事件处理 ======
        onReachBottomDone() {
            this.onReachBottomloading = false;
            this.onReachBottomShowloading = false;
        },
        canReachBottom() {
            if (this.onReachBottomShowloading) {
                let timer = setTimeout(() => {
                    if (this.contentHeight < this.containerHeight) {
                        this.onReachBottomShowloading = false;
                        this.onReachBottomloading = false;
                    } else {
                        this.onReachBottomShowloading = true;
                        this.onReachBottomloading = true;
                    }
                    clearTimeout(timer);
                }, 30);
            }
        },
        observerContent() {
            let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
            if (MutationObserver) {
                new MutationObserver(mutations => {
                    let length = mutations.length - 1;
                    mutations.forEach((item, index) => {
                        if (length === index) {
                            this.contentHeight = this.getRect('content').height;
                            this.canReachBottom();
                        }
                    });
                }).observe(this.content, {
                    childList: true, // 子节点的变动
                    subtree: true, // 所有后代节点的变动
                    characterData: true, // 节点内容或节点文本的变动
                    attributes: true, // 属性的变动
                });
            }
        }
    },
};
</script>

<style scoped>

.scroller-container{
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
}
.scroller-container.scrolling-x{
    overflow-x: scroll;
}
.scroller-container.scrolling-y{
    overflow-y: scroll;
}
.scroller-container.scroll-touch {
    -webkit-overflow-scrolling: touch;
}
.scroller-container.no-scroll-bar::-webkit-scrollbar {
    display:none
}
.is-dropped{
    transition: .2s;
}
.arrow{
    width: 16px;
    height: 16px;
    fill: #AAA;
    transition: transform 0.2s linear;
}
.pull-refresh{
    height: 50px;
    margin-top:-50px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}
.pull-refresh .arrow {
    transform: translate3d(0, 0, 0) rotate(0deg);
}
.pull-refresh .arrow.active {
    transform: translate3d(0, 0, 0) rotate(180deg);
}
.load-more {
    height: 50px;
    margin-bottom: -50px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}
.load-more .arrow {
    transform: translate3d(0, 0, 0) rotate(180deg);
}
.load-more .arrow.active {
    transform: translate3d(0, 0, 0) rotate(0deg);
}
.spinner{
    width: 18px;
    height: 18px;
    fill: #AAA;
    stroke: #AAA
}
.reach-bottom{
    color: #aaa;
    text-align: center;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
