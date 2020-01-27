import VueNativeScroller from './native-scroller/index';
import VueSimulateScroller from './simulate-scroller/index';

function install(Vue, type = 'native') {
    if (type !== 'native' && type !== 'simulate') {
        throw new Error(`can not register component '${type}'`);
    }
    if (install.installed) return;
    install.installed = true;
    if (type === 'native') {
        Vue.component('vue-app-scroller', VueNativeScroller);
    }
    if (type === 'simulate') {
        Vue.component('vue-app-scroller', VueSimulateScroller);
    }
}

const VueAppScroller = {
    install,
    VueNativeScroller,
    VueSimulateScroller
};

export default VueAppScroller;
