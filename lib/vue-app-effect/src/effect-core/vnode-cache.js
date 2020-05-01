export default (bus, tabbar) => {
    return {
        name: 'vnode-cache',
        abstract: true,
        props: {},
        data: () => ({
            routerLen: 0,
            route: {},
            to: {},
            from: {},
            tabBar: tabbar,
            paths: []
        }),
        computed: {},
        watch: {
            route(to, from) {
                this.to = to;
                this.from = from;
                let findTo = this.tabBar.findIndex(item => item === this.$route.fullPath);
                if (findTo === -1) {
                    this.paths.push(to.fullPath);
                    this.paths = [...new Set(this.paths)];
                }
            }
        },
        created() {
            this.cache = {};
            this.routerLen = this.$router.options.routes.length;
            this.route = this.$route;
            this.to = this.$route;
            // 监听返回事件
            bus.$on('reverse', () => {
                this.reverse();
            });
        },
        destroyed() {
            // eslint-disable-next-line guard-for-in
            for (const key in this.cache) {
                const vnode = this.cache[key];
                vnode && vnode.componentInstance.$destroy();
            }
        },
        methods: {
            reverse() {
                let beforePath = this.paths.pop();

                let routes = this.$router.options.routes;
                // 查询是不是导航路由
                let isTabBar = this.tabBar.findIndex(item => item === this.$route.fullPath);
                // 查询当前路由在路由列表中的位置
                let routerIndex = routes.findIndex(item => item.path === beforePath);
                // 当不是导航路由，并且不是默认配置路由
                if (isTabBar === -1 && routerIndex >= this.routerLen) {
                    // 清除对应历史记录
                    delete window.$VueAppEffect[beforePath];
                    window.$VueAppEffect.count -= 1;
                }
                // 当不是导航的时候 删除上一个缓存
                let key = isTabBar === -1 ? this.$route.fullPath : '';
                if (this.cache[key]) {
                    this.cache[beforePath].componentInstance.$destroy();
                    delete this.cache[beforePath];
                }
            }
        },
        render() {
            // 保存路由
            this.route = this.$route;
            // 得到 vnode
            const vnode = this.$slots.default ? this.$slots.default[0] : null;
            // 如果 vnode 存在
            if (vnode) {
                let findTo = this.tabBar.findIndex(item => item === this.$route.fullPath);
                let key = findTo === -1 ? this.$route.fullPath : '/tab-bar';
                // 判断是否缓存过了
                if (this.cache[key]) {
                    vnode.componentInstance = this.cache[key].componentInstance;
                } else {
                    this.cache[key] = vnode;
                }

                vnode.data.keepAlive = true;
            }
            return vnode;
        }
    };
};
