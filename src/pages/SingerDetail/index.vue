<template>
    <PageLoadView
        :title="headerTitle"
        :loadControl="loadControl"
        :onScroll="onScroll"
        :onLoadData="loadData"
        :setScrollTop="setScrollTop"
    >
        <div class="singer-detail">
            <div id="infos" class="infos">
                <div class="singer-bg">
                    <img
                        v-lazy="{
                            src: singerInfo.singer_avatar,
                            error: defaultImg,
                            loading: defaultImg
                        }"
                        class="background"
                    />
                </div>
                <div class="info-content">
                    <div class="info">
                        <div class="fans">粉丝: {{singerInfo.singer_fance}}</div>
                    </div>
                </div>
            </div>
            <TabPosition
                :total="totals"
                :fixed="fixed"
                :index="tabCurrent"
                @tabChange="tabChange"
            />
            <div class="list-warpper">
                <component :is="componentPlan" :data="componentData" />
            </div>
        </div>
    </PageLoadView>
</template>

<script>
import SongList from '@/components/Lists/SongList';
import MvList from '@/components/Lists/MvList';
import AlbumList from '@/components/Lists/AlbumList';
import TabPosition from './tabPosition';

import {
    singerAlbum,
    singerSong,
    singerMv,
    singerAttention
} from '@/service/api';
export default {
    name: 'singer-detail',
    components: {
        TabPosition
    },
    data() {
        return {

            isInit: false,
            componentPlan: SongList,
            componentData: [],
            loadFnName: 'loadDataSong',

            headerTitle: '',
            fixed: false,
            totals: {
                song_total: 0,
                album_total: 0,
                mv_total: 0
            },
            tabCurrent: 0,
            mid: -1,
            song: {
                loadFn: 'loadDataSong',
                component: SongList,
                done: false,
                begin: 0,
                num: 30,
                top: 0,
                list: []
            },
            mv: {
                loadFn: 'loadDataMv',
                component: MvList,
                done: false,
                begin: 0,
                num: 20,
                top: 0,
                list: []
            },
            album: {
                loadFn: 'loadDataAlbum',
                component: AlbumList,
                done: false,
                begin: 0,
                num: 20,
                top: 0,
                list: []
            },
            singerInfo: {
                singer_avatar: '',
                singer_fance: 0
            },
            setScrollTop: 0,
            loadControl: true,
            loadCount: 0,
            defaultImg: require('@/assets/images/singer.png')
        };
    },
    mounted() {
        // 获取参数
        this.mid = this.$route.params.mid;
        this.headerTitle = this.$route.params.name;
        this.singerInfo.singer_avatar = `https://y.gtimg.cn/music/photo_new/T001R800x800M000${this.mid}.jpg?max_age=2592000`;
        // 获取当前页面高度
        this.getFance();
    },
    methods: {
        onScroll(pos) {
            this.fixed = 290 - pos.y <= 0;
            if (this.tabCurrent === 0) {
                this.song.top = pos.y;
            } else if (this.tabCurrent === 1) {
                this.album.top = pos.y;
            } else if (this.tabCurrent === 2) {
                this.mv.top = pos.y;
            }
        },
        tabChange(data) {
            this.tabCurrent = data.index;
            if (this.tabCurrent === 0) {
                this.changeHandler('song');
            } else if (this.tabCurrent === 1) {
                this.changeHandler('album');
            } else if (this.tabCurrent === 2) {
                this.changeHandler('mv');
            }
        },
        changeHandler(type) {
            this.loadFnName = this[type].loadFn;
            this.componentData = [];
            this.componentData = this[type].list;
            // if (this.fixed && this[type].top === 0) {
            //     this.setScrollTop = 290;
            // } else if (this.fixed && this[type].top !== 0) {
            //     this.setScrollTop = this[type].top;
            // }
            this.componentPlan = this[type].component;
            this.checkDone(type);
        },
        checkDone(type) {
            if (this[type].list.length === this.totals[type + '_total']) {
                this.loadControl = false;
                this[type].done = true;
            } else {
                this.loadControl = true;
                this[type].done = false;
            }
        },
        loadData(done) {
            if (!this.isInit) {
                this.isInit = true;
                this.loadDataMv(done);
                this.loadDataSong(done);
                this.loadDataAlbum(done);
            } else {
                this[this.loadFnName](done);
            }
        },
        loadDataMv(done) {
            singerMv({
                singer_mid: this.mid,
                begin: this.mv.begin,
                num: this.mv.num
            }).then(res => {
                this.dataHandler('mv', res, done);
            });
        },
        loadDataSong(done) {
            singerSong({
                singer_mid: this.mid,
                begin: this.song.begin,
                num: this.song.num
            }).then(res => {
                this.dataHandler('song', res, done);
            });
        },
        loadDataAlbum(done) {
            singerAlbum({
                singer_mid: this.mid,
                begin: this.album.begin,
                num: this.album.num
            }).then(res => {
                this.dataHandler('album', res, done);
            });
        },
        dataHandler(type, res, done) {
            this.loadCount++;
            this.totals[type + '_total'] = res.total;
            this[type].list = this[type].list.concat(res.list);
            this.componentData = this[type].list;
            this[type].begin = this[type].begin + this[type].num;
            this[type].done = this[type].list.length === res.total;
            if (this.loadCount === 3) {
                this.componentData = this.song.list;
                let done = this.song.list.length === this.totals.song_total;
                done && done(done);
            } else {
                done && done(this[type].done);
            }
        },
        // 获取粉丝
        getFance() {
            singerAttention({
                singer_mid: this.mid
            }).then(res => {
                this.singerInfo.singer_fance = res.str;
            });
        },
    }
};
</script>

<style lang="stylus" scoped>
@import '~@/assets/css/variable'
.singer-detail
  position relative
  width 100%
  background $bgColor
  z-index 12
.infos{
  height: 290px;
  width: 100%;
  position relative
  overflow hidden
}
.infos .singer-bg{
  background: #353535;
  // height:100%;
  // filter: blur(30px);
  opacity: 0.8;
  overflow: hidden;
  margin-top: -40px;
  margin-bottom -40px
}
.infos .singer-bg .background{
  width: 100%;
  /* height: 280px; */
}
.infos .info-content{
  position: absolute;
  top: 0;
  bottom 0;
  right 0;
  left: 0;
  width: 100%
  display: flex;
  /* display: none; */
}
.infos .info-content .min-avatar{
  width: 100px;
  height: 100px;
  flex: 0 0 100px;
  border-radius: 50%;
  margin: 25px;
  background: #353535;
}
.infos .info-content .info{
  display:flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50px;
}
.infos .info-content .info .name{
  font-size: 14px;
  line-height: 2.5;
  height: 30px;
  overflow: hidden;
}
.infos .info-content .info .fans{
  display: inline-block;
  padding: 2px 15px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(0,0,0,0.8);
  background: rgba(255,205,50,0.8);
  border-radius: 50px;
}
</style>
