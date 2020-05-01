<template>
    <div ref="mescroll" class="mescroll">
        <div>
            <slot></slot>
        </div>
    </div>
</template>

<script>
import MeScroll from 'mescroll.js';
import 'mescroll.js/mescroll.min.css';

export default {
    name: 'MeScrollVue',
    props: {
        autoLoad: {
            type: Boolean,
            required: true,
            description: '是否自动加载第一页数据',
            default: true
        },
        onScroll: {
            type: Function,
            required: false,
            description: '监听滚动',
            default: null
        },
        onPullRefresh: {
            type: Function,
            required: false,
            description: '下拉刷新',
            default: null
        },
        onLoadData: {
            type: Function,
            required: false,
            description: '加载数据',
            default: null
        },
    },
    data() {
        return {
            mescroll: null,
            lastScrollTop: 0, // 路由切换时滚动条的位置
            lastBounce: null, // 路由切换时是否禁止ios回弹
        };
    },
    mounted() {
        this.initMeScroll();
    },
    methods: {
        initMeScroll() {
            this.mescroll = new MeScroll(this.$refs.mescroll, {
                up: {
                    // 是否在初始化时以上拉加载的方式自动加载第一页数据; 默认true
                    auto: this.autoLoad,
                    // 上拉回调,此处可简写; 相当于 callback: function (page, mescroll) { getListData(page); }
                    callback: this.onLoadData, // 上拉回调,此处可简写; 相当于 callback: function (page) { upCallback(page); }
                    noMoreSize: 4, // 如果列表已无数据,可设置列表的总数量要大于半页才显示无更多数据;避免列表数据过少(比如只有一条数据),显示无更多数据会不好看; 默认5
                    empty: {
                        // warpId: emptyWarpId, // 父布局的id;
                        icon: 'http://www.mescroll.com/img/mescroll-empty.png', // 图标,默认null
                        tip: '暂无相关数据~', // 提示
                        btntext: '去逛逛 >', // 按钮,默认""
                        btnClick: function () { // 点击按钮的回调,默认null
                            alert('点击了按钮,具体逻辑自行实现');
                        }
                    },
                    toTop: { // 配置回到顶部按钮
                        src: 'http://www.mescroll.com/img/mescroll-totop.png' // 图片路径,默认null (建议写成网络图,不必考虑相对路径)
                    }
                },
                down: {
                    auto: this.autoLoad,
                    callback: this.pullRefreshHandle
                }
            });
        },
        pullRefreshHandle() {
            this.mescroll.resetUpScroll();
        },
        beforeRouteEnter() {
            if (this.mescroll) {
                // 滚动到之前列表的位置
                if (this.lastScrollTop) {
                    this.mescroll.setScrollTop(this.lastScrollTop);
                    setTimeout(() => { // 需延时,因为setScrollTop内部会触发onScroll,可能会渐显回到顶部按钮
                        this.mescroll.setTopBtnFadeDuration(0); // 设置回到顶部按钮显示时无渐显动画
                    }, 16);
                }
                // 恢复到之前设置的isBounce状态
                if (this.lastBounce != null) this.mescroll.setBounce(this.lastBounce);
            }
        },
        beforeRouteLeave() {
            if (this.mescroll) {
                this.lastScrollTop = this.mescroll.getScrollTop(); // 记录当前滚动条的位置
                this.mescroll.hideTopBtn(0); // 隐藏回到顶部按钮,无渐隐动画
                this.lastBounce = this.mescroll.optUp.isBounce; // 记录当前是否禁止ios回弹
                this.mescroll.setBounce(true); // 允许bounce
            }
        }
    }
};
</script>

<style>
</style>
