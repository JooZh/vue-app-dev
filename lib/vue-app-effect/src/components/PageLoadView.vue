<template>
    <div>
        <template v-if="!isTab">
            <div id="vue-app-effect__sub-router-view">
                <Navigation v-if="title" :title="title" :backShow="!isTab"></Navigation>
                <div class="bd-view" :class="{ 'bd-view-full': !title }">
                    <vue-app-scroller
                        :loadControl="loadControl"
                        :onScroll="onScroll"
                        :onPullRefresh="onPullRefresh"
                        :onLoadData="onLoadData"
                        :scrollBar="scrollBar"
                        :setScrollTop="setScrollTop"
                    >
                        <slot name="header"></slot>
                        <slot></slot>
                        <slot name="footer"></slot>
                    </vue-app-scroller>
                </div>
            </div>
        </template>
        <template v-else>
            <Navigation v-if="title" :title="title" :backShow="!isTab"></Navigation>
            <div class="bd-view" :class="{ 'bd-view-full': !title }">
                <vue-app-scroller
                    :loadControl="loadControl"
                    :onScroll="onScroll"
                    :onPullRefresh="onPullRefresh"
                    :onLoadData="onLoadData"
                    :scrollBar="scrollBar"
                    :setScrollTop="setScrollTop"
                >
                    <slot name="header"></slot>
                    <slot></slot>
                    <slot name="footer"></slot>
                </vue-app-scroller>
            </div>
        </template>
    </div>
</template>
<script>
import Navigation from './Navigation';
export default {
    name: 'AppPageLoadView',
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
        onPullRefresh: {
            type: Function,
            default: null,
            discription: '下拉刷新函数'
        },
        onLoadData: {
            type: Function,
            default: null,
            discription: '上拉加载函数'
        },
        onScroll: {
            type: Function,
            default: null,
            discription: '监听滚动函数'
        },
        loadControl: {
            type: Boolean,
            required: false,
            description: '是否加载数据',
            default: true
        },
        scrollBar: {
            type: Boolean,
            required: false,
            description: '是否需要显示滚动条',
            default: true
        },
        setScrollTop: {
            type: Number,
            required: false,
            description: '设置滚动条',
            default: 0
        }
    }
};
</script>
