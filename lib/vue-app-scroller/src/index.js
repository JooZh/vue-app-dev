import VueInfiniteScroller from './infinite-scroller/index';
import VueMeScroller from './me-scroller/index';

function install(Vue) {
    if (install.installed) return;
    install.installed = true;
    Vue.component('vue-app-scroller', VueInfiniteScroller);
    Vue.component('vue-app-mescroller', VueMeScroller);
}

export default install;
