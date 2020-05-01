<template>
    <vue-app-mescroller
        :onLoadData="loadMore"
        :onScroll="onScroll"
        :onPullRefresh="refresh"
    >
        <!-- <div slot="header">131231</div> -->
        <div v-for="(item, index) in items" :key="index" class="list">
            <div class="detail" @click="goDetail(index + 1, `MV`)">
                <img class="img" :src="defaultImg" />
                <div class="title-box">
                    <div class="title">vue-app-effect MV {{index + 1}}</div>
                </div>
                <div class="date">播放: {{index + 1}}.99 万</div>
            </div>
        </div>
        <!-- <div slot="footer">2323</div> -->
    </vue-app-mescroller>
</template>
<script>
export default {
    name: 'movie',
    data() {
        return {
            load: true,
            count: 0,
            items: [],
            defaultImg: require('../../assets/images/mv.png')
        };
    },
    created() {
        //
    },
    mounted() {
        // setTimeout(() => {
        //     this.load = true;
        // }, 1000);
    },
    methods: {
        onScroll(e) {
            console.log(e);
        },
        refresh(done) {
            setTimeout(() => {
                this.items = [];
                for (let i = 0; i < 10; i++) {
                    this.items.push({ index: this.count++ });
                }
                done();
            }, 1000);
        },
        loadMore() {
            setTimeout(() => {
                for (let i = 0; i < 10; i++) {
                    this.items.push({ index: this.count++ });
                }
                // done(this.items.length === 50);
            }, 5000);
        }
    }
};
</script>
<style lang="stylus">

</style>
