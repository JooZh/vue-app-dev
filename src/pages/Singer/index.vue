<template>
    <PageView isTab noScrollTouch>
        <div class="areas-fix">
            <div class="areas border-half-bottom">
                <vue-app-scroller :scrollBar="false">
                    <div ref="areas" class="areas-list">
                        <div
                            v-for="(item, key) in tags.area"
                            :key="key"
                            class="area"
                            :class="item.id === area ? 'select' : ''"
                            @click="areaChange(item.id)"
                        >
                            <span>{{item.name}}</span>
                        </div>
                    </div>
                </vue-app-scroller>
            </div>
            <div class="areas border-half-bottom">
                <vue-app-scroller :scrollBar="false">
                    <div ref="sexs" class="areas-list">
                        <div
                            v-for="(item, key) in tags.sex"
                            :key="key"
                            class="area"
                            :class="item.id === sex ? 'select' : ''"
                            @click="sexChange(item.id)"
                        >
                            <span>{{item.name}}</span>
                        </div>
                    </div>
                </vue-app-scroller>
            </div>
            <div class="areas border-half-bottom">
                <vue-app-scroller :scrollBar="false">
                    <div ref="genres" class="areas-list">
                        <div
                            v-for="(item, key) in tags.genre"
                            :key="key"
                            class="area"
                            :class="item.id === genre ? 'select' : ''"
                            @click="genreChange(item.id)"
                        >
                            <span>{{item.name}}</span>
                        </div>
                    </div>
                </vue-app-scroller>
            </div>
        </div>
        <!-- 字母 -->
        <div class="letters border-half-left">
            <vue-app-scroller :scrollBar="false">
                <div class="letters-list">
                    <div
                        v-for="(item, index) in tags.index"
                        :key="index"
                        class="letter"
                        :class="item.id === letter ? 'select' : ''"
                        @click="letterChange(item.id)"
                    >
                        <span>{{item.name}}</span>
                    </div>
                </div>
            </vue-app-scroller>
        </div>
        <!-- 列表 -->
        <div class="singers-list">
            <vue-app-scroller
                ref="scroll"
                :onLoadData="loadData"
                :onPullRefresh="onPullRefresh"
            >
                <div class="singers">
                    <template v-if="singerlist.length">
                        <div
                            v-for="(item,index) in singerlist"
                            :key="index"
                            class="singer"
                            @click="openSinger(item.singer_mid, item.singer_name)"
                        >
                            <img
                                v-lazy="{
                                    src: item.singer_avatar,
                                    error: defaultImg,
                                    loading: defaultImg
                                }"
                                class="avatar"
                            />
                            <div class="info">
                                <div class="name f-name">{{item.singer_name}}</div>
                            </div>
                        </div>
                    </template>
                    <Empty v-if="!singerlist.length && loaded"></Empty>
                </div>
            </vue-app-scroller>
        </div>
    </PageView>
</template>

<script>
import { singerList } from '@/service/api';
export default {
    name: 'singer',
    data() {
        return {
            init: false,
            loaded: false,
            // 路由使用
            singerlist: [],
            tags: {},
            total: 0,
            letter: -100,
            area: -100,
            genre: -100,
            sex: -100,
            sin: 0,
            page: 1,
            defaultImg: require('@/assets/images/singer.png')
        };
    },
    methods: {
        initScrollWidth(dom) {
            let areaList = this.$refs[dom].children;
            let width = 0;
            Array.from(areaList).forEach(item => {
                width += item.getBoundingClientRect().width;
            });
            this.$refs[dom].style.width = `${width}px`;
        },
        openSinger(mid, name) {
            this.$VueAppEffect.next({
                path: `/pages/SingerDetail/index`,
                params: { mid: mid, name: name }
            });
        },
        loadData(done) {
            this.getData(done);
        },
        // 点击切换类目 重置 各种数据
        sexChange(id) {
            this.changeSetData(id, 'sex');
        },
        genreChange(id) {
            this.changeSetData(id, 'genre');
        },
        letterChange(id) {
            this.changeSetData(id, 'letter');
        },
        areaChange(id) {
            this.changeSetData(id, 'area');
        },
        changeSetData(id, str) {
            if (id === this[str]) {
                return;
            }
            this.singerlist = [];
            this[str] = id;
            this.sin = 0;
            this.page = 1;
            this.$refs.scroll.load();
        },
        onPullRefresh(done) {
            this.loaded = false;
            this.sin = 0;
            this.page = 1;
            this.singerlist = [];
            let t = setTimeout(() => {
                this.getData(done);
                clearTimeout(t);
            }, 500);
        },
        // 获取数据
        getData(done) {
            this.loaded = false;
            singerList({
                picSize: 150,
                area: this.area,
                sex: this.sex,
                genre: this.genre,
                index: this.letter,
                sin: this.sin,
                cur_page: this.page
            }).then(res => {
                this.total = res.total;
                let singerarr = res.list;
                // 合并数组
                let addSingerlist = this.singerlist;
                let singerlist = addSingerlist.concat(singerarr);
                // 第一次的时候处理标签
                if (this.page === 1) {
                    let tags = res.tags;
                    tags.index[0].name = '热';
                    this.tags = tags;
                }
                this.singerlist = singerlist;
                this.sin = this.sin + 80;
                this.page = this.page + 1;

                let end = this.singerlist.length === this.total;
                let empty = this.singerlist.length === 0;
                this.loaded = true;
                done && done(end, empty);

                if (!this.init) {
                    let timer = setTimeout(() => {
                        this.initScrollWidth('genres');
                        this.initScrollWidth('areas');
                        this.initScrollWidth('sexs');
                        clearTimeout(timer);
                        this.init = true;
                    }, 30);
                }
            });
        }
    }
};
</script>

<style lang="stylus" scoped>
@import '~@/assets/css/variable';
.areas-fix
  position: absolute;
  left: 0;
  right: 30px;
  background $bgColor
  .areas
    overflow: hidden;
    white-space:nowrap;
    height:30px;
    .areas-list
      height: 30px;
      line-height: 30px;
      .area
        font-size: 13px;
        padding: 0 7px 0 10px;
        color: #999;
        display: inline-block
        &.select
          color: #ffcd32;
.letters
  width: 30px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  position: absolute;
  left auto
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 3;
  background $bgColor
  .letter
    width: 30px;
    height: 30px;
    line-height: 30px;
    overflow: hidden;
    color: #999
    &.select
      color: #ffcd32

.singers-list
  position absolute
  top 90px;
  left 0
  right 30px
  bottom 0
  .singers
    padding-bottom: 10px;
    .singer
      padding: 15px 0 0 25px;
      font-size: 12px;
      display: flex;
      .avatar
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: block;
        background: #ddd;
      .info
        margin: 0 0 0 15px;
        .name
          line-height: 40px;
        .f-name
          color: rgba(255,255,255,0.7);
  .no-singer
    width: 100%;
    height: 100%;
    color: #999;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
</style>
