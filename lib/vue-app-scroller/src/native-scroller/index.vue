<template>
    <div
        ref="container"
        class="scroller-container"
        :class="{
            'no-scroll-bar': hideBar,
            'scroll-touch': touchScrolling,
            'scrolling-x': scrollingX,
            'scrolling-y': scrollingY
        }"
    >
        <div ref="content" class="scroller-content">
            <slot name="top"></slot>
            <slot></slot>
            <slot name="bottom">
                <template v-if="onReachBottom">
                    <div v-if="onReachBottomShowloading" class="loading-more">正在加载中....</div>
                    <div v-else class="loading-more">没有更多数据</div>
                </template>
            </slot>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        hideBar: {
            type: Boolean,
            required: false,
            description: '是否需要隐藏滚动条',
            default: false
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
            default: false,
            description: '是否横向滚动'
        },
        scrollingY: {
            type: Boolean,
            default: false,
            description: '是否纵向滚动'
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
            description: '上拉加载处理函数',
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
            content: null
        };
    },
    mounted() {
        this.initRefs().then(() => {
            this.lockBodyHandle();
            this.onScrollHandle();
            if (this.onPullRefresh) this.onPullRefreshHandle();
            if (this.onReachBottom) this.observerContent();
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
                    this.contentHeight = this.getHeight(this.content);
                    this.containerHeight = this.getHeight(this.container);
                    resolve(true);
                });
            });
        },
        getHeight(el) {
            return el.getBoundingClientRect().height;
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
        onPullRefreshHandle() {
            //
        },
        onReachBottomDone() {
            this.onReachBottomloading = false;
            this.onReachBottomShowloading = false;
        },
        canReachBottom() {
            if (this.onReachBottomShowloading) {
                let timer = setTimeout(() => {
                    this.contentHeight = this.getHeight(this.content);
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
.loading-more{
    text-align: center;
    color: #fff;
    height: 70px;
    line-height: 70px;
}
</style>
