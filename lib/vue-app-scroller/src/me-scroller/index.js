import mescroll from './component.js';

function install(Vue, config) {
    if (install.installed) return;
    install.installed = true;
    Vue.component('vue-mescroller', mescroll(config));
}

export default install;
