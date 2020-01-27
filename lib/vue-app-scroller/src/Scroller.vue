<template>
    <component :is="component" v-bind="attrs"></component>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            default: 'native'
        },
        attrs: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            component: null
        };
    },
    created() {
        this.component = this.getComponent(this.type);
    },
    mounted() {
        //
    },
    methods: {
        getComponent(name) {
            if (name !== 'native' || name !== 'simulate') {
                throw new Error(`can not found component '${name}'`);
            }
            return require(`./src/${name}-scroller/index`).default;
        }
    }
};
</script>

<style>

</style>
