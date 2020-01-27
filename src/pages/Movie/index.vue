<template>
    <PageScrollView isTab :lockBody="true" :onScroll="onScroll" :onReachBottom="onReachBottom">
        <div v-for="(item, index) in items" :key="index" class="list">
            <div class="detail" @click="goDetail(index + 1, `MV`)">
                <img class="img" :src="defaultImg" />
                <div class="title-box">
                    <div class="title">vue-app-effect MV {{index + 1}}</div>
                </div>
                <div class="date">播放: {{index + 1}}.99 万</div>
            </div>
        </div>
    </PageScrollView>
</template>
<script>
export default {
    name: 'movie',
    data() {
        return {
            i: 0,
            top: 0,
            scrollTop: 0,
            show: false,
            items: [],
            defaultImg: require('../../assets/images/mv.png')
        };
    },
    created() {
        setTimeout(() => {
            this.items = new Array(5);
        }, 100);
    },
    mounted() {
        this.show = true;
    },
    methods: {
        goDetail(index, name) {
            this.$vueAppEffect.next({
                path: `/pages/MovieDetail/index/${index}`,
                params: { id: index, name: name }
            });
        },
        onScroll(e) {
            // console.log(e);
        },
        onReachBottom(done) {
            if (this.items.length >= 15) {
                done();
            } else {
                setTimeout(() => {
                    this.items = this.items.concat(new Array(5));
                }, 1000);
            }
        }
    }
};
</script>
<style lang="stylus" scoped>
    .mv-list
        height 300px;
        overflow scroll
        margin-top -1px;
</style>
