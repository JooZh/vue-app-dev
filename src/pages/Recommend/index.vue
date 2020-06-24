<template>
    <PageLoadView isTab>
        <vue-mescroller
            :loadDataCallBack="loadData"
            :getData="getData"
            :dataHandle="dataHandle"
            :enableRefresh="true"
            :autoRefresh="true"
            :enablePagination="false"
        >
            <Mvlist :data="mvlist"></Mvlist>
        </vue-mescroller>
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
            mvlist: [],
        };
    },
    methods: {
        loadData() {
            return recommendMvList();
        },
        dataHandle(data) {
            return data.mv_list;
        },
        getData(data) {
            this.mvlist = data;
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
