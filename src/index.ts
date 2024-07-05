import { App } from 'vue';
import Vue3NumberScroll from './Vue3NumberScroll.vue';

const install: any = (app: App): void => {
    app.component('vue3-number-scroll', Vue3NumberScroll);
    app.component('Vue3NumberScroll', Vue3NumberScroll);
};

export default {install}
export {
    Vue3NumberScroll
}