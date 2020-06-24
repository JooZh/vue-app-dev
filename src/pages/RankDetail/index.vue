<template>
    <PageLoadView :title="headerTitle">
        <vue-mescroller
            :queryParams="queryParams"
            :loadDataCallBack="loadData"
            :getData="getData"
            :dataHandle="dataHandle"
            :enableRefresh="true"
            :autoRefresh="true"
            :enablePagination="false"
            :stickyConfig="stickyConfig"
        >
            <div id="ranking-list">
                <div class="container">
                    <div id="infos" class="infos">
                        <div class="singer-bg">
                            <img
                                v-lazy="{ src: img, error: defaultImg, loading: defaultImg }"
                                class="background"
                            />
                        </div>
                        <div class="info-content">
                            <img
                                v-lazy="{ src: img, error: defaultImg, loading: defaultImg }"
                                class="min-avatar"
                            />
                            <div class="info">
                                <div class="name">{{topInfo.pts}}</div>
                                <div class="fans">{{topInfo.listen_str}} 粉丝</div>
                                <div class="fans">{{topInfo.update_time}} 更新</div>
                            </div>
                        </div>
                    </div>
                    <TabPosition :total="topInfo.total" @playAll="handlePlayAll" />
                    <SongList class="nav-sticky-songlist" :data="songlist"></SongList>
                </div>
            </div>
        </vue-mescroller>
    </PageLoadView>
</template>

<script>
import SongList from '@/components/Lists/SongList';
import TabPosition from './tabPosition';

import { topDetail } from '@/service/api';
import { mapMutations } from 'vuex';

export default {
    name: 'ranking-detail',
    components: {
        SongList,
        TabPosition
    },
    data() {
        return {
            stickyConfig: {
                el: '.tab',
                className: 'nav-sticky'
            },
            id: '',
            tabTop: 220,
            headerTitle: '',
            img: '',
            fixed: false,
            songlist: [],
            topInfo: {},
            defaultImg: require('@/assets/images/album.png'),
            queryParams: {
                top_id: this.$route.params.id
            }
        };
    },
    created() {
        this.headerTitle = this.$route.params.title;
        this.img = this.$route.params.img;
    },
    methods: {
        ...mapMutations(['playAll']),
        loadData() {
            return topDetail();
        },
        dataHandle(data) {
            return data;
        },
        getData(data) {
            let topInfo = data;
            topInfo.pts = `第${topInfo.week}周`;
            this.topInfo = topInfo;
            this.songlist = data.song_list;
        },
        handlePlayAll() {
            this.playAll(this.songlist);
        }
    }
};
</script>

<style lang="stylus" scoped>
@import '../../assets/css/common'
#ranking-list
  width 100%
  height 100%
  position relative
  z-index 12
  background $bgColor
  .container
    .nav-sticky-songlist
      position relative
      z-index 1
    .infos
      height: 220px;
      width: 100%;
      position relative
      .singer-bg
        background: #353535;
        height: 100%;
        overflow hidden;
        opacity: 0.4;
        .background
          width: 100%;
          height: 100%;
        //   filter: blur(20px);
      .info-content
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        color: #ccc;
        .min-avatar
          width: 120px;
          height: 120px;
          flex: 0 0 120px;
          margin: 45px 30px;
          background: #353535;
        .info
          display: inline-block;
          margin: 45px 20px 0 0;
          flex: 1;
          height: 100px;
          .name
            font-size: 18px;
            line-height: 1.2;
            padding: 10px 0;
            overflow: hidden;
            color: #ffcd32;
          .fans
            font-size: 14px;
            line-height: 1.5
</style>
