import { App, Plugin } from 'vue';
import Vue3NumberScroll from './Vue3NumberScroll.vue';

const install: Plugin = (app: App): void => {
    app.component('vue3-number-scroll', Vue3NumberScroll);
};

export default {install}
export {
    Vue3NumberScroll
}