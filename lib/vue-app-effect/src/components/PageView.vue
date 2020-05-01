<template>
    <div>
        <template v-if="!isTab">
            <div id="vue-app-effect__sub-router-view">
                <Navigation v-if="title" :title="title" :backShow="!isTab"></Navigation>
                <div class="bd-view" :class="{ 'bd-view-full': !title }">
                    <div ref="container" class="infinite-scroller-container">
                        <slot name="header"></slot>
                        <div
                            ref="content"
                            class="infinite-scroll-content"
                            :class="{ 'no-scroll-bar': !scrollBar }"
                            @scroll="scrollHandler"
                        >
                            <slot></slot>
                        </div>
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <Navigation v-if="title" :title="title" :backShow="!isTab"></Navigation>
            <div class="bd-view" :class="{ 'bd-view-full': !title }">
                <div ref="container" class="infinite-scroller-container">
                    <slot name="header"></slot>
                    <div
                        ref="content"
                        class="infinite-scroll-content"
                        :class="{ 'no-scroll-bar': !scrollBar, 'no-overflow-touch': noScrollTouch }"
                        @scroll="scrollHandler"
                    >
                        <slot></slot>
                    </div>
                    <slot name="footer"></slot>
                </div>
            </div>
        </template>
    </div>
</template>
<script>
import Navigation from './Navigation';
export default {
    name: 'AppPageView',
    components: {
        Navigation
    },
    props: {
        isTab: {
            type: Boolean,
            default: false,
            discription: '是否是tab页面'
        },
        title: {
            type: String,
            default: '',
            discription: '导航标题, 传值显示导航'
        },
        onScroll: {
            type: Function,
            default: null,
            discription: '监听滚动函数'
        },
        scrollBar: {
            type: Boolean,
            required: false,
            description: '是否需要显示滚动条',
            default: true
        },
        noScrollTouch: {
            type: Boolean,
            required: false,
            description: '是否启用滑动滚动',
            default: false
        },
        setScrollTop: {
            type: Number,
            required: false,
            description: '设置滚动条',
            default: 0
        }
    },
    data() {
        return {
            container: null,
            content: null,
            containerHeight: 0,

            scrollLeft: 0,
            scrollTop: 0,
        };
    },
    watch: {
        setScrollTop(val) {
            if (this.content) {
                console.log(val);
                this.content.scrollTop = val;
            }
        }
    },
    mounted() {
        this.initRefs();
    },
    activated() {
        if (this.content) {
            this.content.scrollTop = this.scrollTop;
            this.content.scrollLeft = this.scrollLeft;
        }
    },
    methods: {
        initRefs() {
            this.$nextTick(() => {
                this.content = this.$refs.content;
                this.container = this.$refs.container;
                this.containerHeight = this.container.getBoundingClientRect().height;
            });
        },
        scrollHandler(e) {
            this.scrollTop = e.target.scrollTop;
            this.scrollLeft = e.target.scrollLeft;
            if (this.onScroll) {
                this.onScroll({
                    x: this.scrollLeft,
                    y: this.scrollTop
                });
            }
        }
    }
};
</script>
<style scoped>
.infinite-scroller-container{
    position: absolute;
    bottom: 0;
    top: 0;
    left: 0;
    right: 0;
    overflow: auto;
}
.infinite-scroll-content{
    height:100%;
    overflow: auto;
    -webkit-overflow-scrolling : touch;
}
.infinite-scroll-content.no-overflow-touch{
    -webkit-overflow-scrolling: auto;
}
.infinite-scroll-content.no-scroll-bar::-webkit-scrollbar {
    display:none
}
</style>
