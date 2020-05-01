<template>
    <div v-if="navs.length > 0" id="vue-app-effect__tab-bar">
        <div class="nav border-half-top">
            <template v-for="(nav, index) in navs">
                <router-link :key="index" class="bar" :to="nav.path" replace>
                    <div class="button">
                        <div v-if="nav.iconFont" class="icon" v-html="nav.iconFont"></div>
                        <div v-else-if="nav.iconImagePath" class="icon">
                            <img :src="nav.iconImagePath" alt="" />
                        </div>
                        <div class="text">{{nav.text}}</div>
                    </div>
                </router-link>
            </template>
        </div>
    </div>
</template>
<script>
import { config } from '../util';
export default {
    name: 'AppTabBar',
    data() {
        let tabBar = config.tabBar;
        return {
            navs: tabBar.list.map(item => {
                item.path = '/' + item.path;
                return item;
            })
        };
    }
};
</script>
