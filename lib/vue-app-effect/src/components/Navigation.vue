<template>
    <div v-if="title" class="hd-view">
        <div class="back-btn">
            <div @click="back"><i v-if="backShow" class="fa fa-angle-left"></i></div>
        </div>
        <div class="title">{{title}}</div>
        <div class="show-cd" @click="changePlayer">
            <!-- <Music v-if="music"></Music> -->
        </div>
    </div>
</template>

<script>
// import Music from '../../components/Music/index'
export default {
    name: 'AppNavigation',
    props: {
        title: {
            type: String,
            default: ''
        },
        backShow: {
            type: Boolean
            // default: false
        }
    },
    methods: {
        back() {
            this.$VueAppEffect.back();
        },
        changePlayer() {
            this.$VueAppEffect.next({
                path: `/pages/Player/index`
            });
        }
    }
};
</script>
