<template>
    <PageLoadView
        isTab
        :onScroll="onScroll"
        :onLoadData="loadData"
        :onPullRefresh="onPullRefresh"
    >
        <div v-if="load" class="container">
            <!-- <Swiper :items="imageList"></!-->
            <Mvlist v-if="mvlist.length" :data="mvlist"></Mvlist>
            <Empty v-else></Empty>
        </div>
    </PageLoadView>
</template>

<script>
import Mvlist from '@/components/Lists/MvList';
import { recommendMvList } from '@/service/api';
export default {
    name: 'recommend',
    components: {
        Mvlist
    },
    data() {
        return {
            load: false,
            // 路由使用
            headerTitle: '推荐',
            imageList: [],
            mvlist: [],
            // 滑动控制
            current: 0,
            timer: null,
            startX: 0,
            startY: 0
        };
    },
    methods: {
        onScroll(e) {
            // console.log(e);
        },
        onPullRefresh(done) {
            setTimeout(() => {
                this.getData(done);
            }, 500);
        },
        loadData(done) {
            this.getData(done);
        },
        getData(done) {
            recommendMvList().then(res => {
                this.mvlist = res.mv_list;
                // this.mvlist = [];
                this.load = true;
                done && done(true, !this.mvlist.length);
            });
        }
    }
};
</script>

<style lang="stylus" scoped>
@import '../../assets/css/common'
.recomment
  position absolute
  left 0
  right 0
  top 0
  width 100%
  height 100%
  .pulldown-wrapper
    height 50px
    width 100%
    text-align center
    position absolute
    top 40px
  .scroll-layout
    top 40px
    bottom 50px
    .hd
      margin-top 10px
      height 40px
      line-height 40px
      text-align center
      color $themeColor
      font-size $fontM
</style>
