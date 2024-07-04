<script setup>
import {ref, reactive, watch, onMounted} from 'vue';

import Vue3ScrollNumber1 from "./Vue3ScrollNumber.vue";

const asdas=ref()
onMounted(()=>{
  console.log(asdas.value)
})
</script>

<template>
  <div>
     <Vue3ScrollNumber1 ref="asdas"  :number="1000" :duration="1000" />
  </div>
</template>

<style scoped>

</style>