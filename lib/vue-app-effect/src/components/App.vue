<template>
    <div id="vue-app-effect">
        <transition :name="Direction.transitionName" :css="!!Direction.type">
            <vnode-cache>
                <router-view id="vue-app-effect__page-view"></router-view>
            </vnode-cache>
        </transition>
        <component :is="commonComponent" v-if="showComponent"></component>
        <TabBar v-show="Direction.isTabBar"></TabBar>
    </div>
</template>
<script>
import { config, getComponent } from '../util';
export default {
    name: 'AppRoot',
    data() {
        return {
            showComponent: config.commonComponent,
            commonComponent: getComponent(config.commonComponent),
            Direction: {
                type: '',
                isTabBar: true,
                transitionName: ''
            }
        };
    },
    created() {
        this.$VueAppEffect.on('forward', direction => {
            this.Direction = direction;
        });
        this.$VueAppEffect.on('reverse', direction => {
            this.Direction = direction;
        });
    }
};
</script>
