// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import store from './store/index';
import createApp from '../lib/vue-app-effect/src/index';

import 'iview/dist/styles/iview.css';
import './assets/css/reset.css';
import './assets/css/common.styl';

import lazyload from 'vue-lazyload';
import { Icon } from 'iview';
import Empty from './components/Base/Empty';

createApp({
    // 使用vuex
    store,
    // 添加使用的插件
    plugins: [lazyload],
    // 添加使用的第三方组件
    components: [
        ['Icon', Icon],
        ['Empty', Empty]
    ],
    // 使用vue的自定义配置
    config: {
        productionTip: false
    }
});
