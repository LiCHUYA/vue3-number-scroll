<template>
  <span>{{ displayValue }}</span>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { requestAnimationFrame, cancelAnimationFrame } from './requestAnimationFrame.js'

// 定义组件属性
interface Props {
  startVal: number
  endVal: number
  duration: number
  autoplay: boolean
  decimals: number
  decimal: string
  separator: string
  prefix: string
  suffix: string
  useEasing: boolean
  easingFn: (t: number, b: number, c: number, d: number) => number
  repeatAnimation?: number
  [x: string]: any
}

const props = withDefaults(defineProps<Props>(), {
  startVal: 0,
  endVal: 2000,
  duration: 3000,
  autoplay: true,
  decimals: 0,
  decimal: '.',
  separator: ',',
  prefix: '',
  suffix: '',
  useEasing: true,
  easingFn: (t: number, b: number, c: number, d: number) => c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b,
  repeatAnimation: undefined
})

// 定义事件
const emit = defineEmits(['onFinish', 'init'])

// 数字格式化函数
const formatNumber = (num: number| any) => {
  num = num.toFixed(props.decimals)
  const [x1, x2] = num.split('.')
  const x2Formatted = x2 ? props.decimal + x2 : ''
  const rgx = /(\d+)(\d{3})/
  let x1Formatted = x1

  while (rgx.test(x1Formatted)) {
    x1Formatted = x1Formatted.replace(rgx, '$1' + props.separator + '$2')
  }

  return props.prefix + x1Formatted + x2Formatted + props.suffix
}

const localStartVal = ref<number>(props.startVal)
const displayValue = ref<string>(formatNumber(props.startVal))
const printVal = ref<number | null>(null)
const paused = ref<boolean>(false)
const localDuration = ref<number>(props.duration)
const startTime = ref<number | null>(null)
const timestamp = ref<number | null>(null)
const remaining = ref<number | null>(null)
const rAF = ref<number | null>(null)
const countDown = computed<boolean>(() => props.startVal > props.endVal)

const start = () => {
  localStartVal.value = props.startVal
  startTime.value = null
  localDuration.value = props.duration
  paused.value = false
  rAF.value = requestAnimationFrame(count)
}

const pause = () => {
  if (rAF.value !== null) cancelAnimationFrame(rAF.value)
}

const resume = () => {
  startTime.value = null
  localDuration.value = remaining.value !== null ? remaining.value : props.duration
  localStartVal.value = printVal.value !== null ? printVal.value : props.startVal
  rAF.value = requestAnimationFrame(count)
}

const pauseResume = () => {
  if (paused.value) {
    resume()
  } else {
    pause()
  }
  paused.value = !paused.value
}

const reset = () => {
  startTime.value = null
  if (rAF.value !== null) cancelAnimationFrame(rAF.value)
  displayValue.value = formatNumber(props.startVal)
}

const count = (timestampVal: number) => {
  if (!startTime.value) startTime.value = timestampVal
  timestamp.value = timestampVal
  const progress = timestampVal - startTime.value
  remaining.value = localDuration.value - progress

  if (props.useEasing) {
    if (countDown.value) {
      printVal.value = localStartVal.value - props.easingFn(progress, 0, localStartVal.value - props.endVal, localDuration.value)
    } else {
      printVal.value = props.easingFn(progress, localStartVal.value, props.endVal - localStartVal.value, localDuration.value)
    }
  } else {
    if (countDown.value) {
      printVal.value = localStartVal.value - ((localStartVal.value - props.endVal) * (progress / localDuration.value))
    } else {
      printVal.value = localStartVal.value + ((props.endVal - localStartVal.value) * (progress / localDuration.value))
    }
  }

  if (countDown.value) {
    printVal.value = printVal.value < props.endVal ? props.endVal : printVal.value
  } else {
    printVal.value = printVal.value > props.endVal ? props.endVal : printVal.value
  }

  displayValue.value = formatNumber(printVal.value)

  if (progress < localDuration.value) {
    rAF.value = requestAnimationFrame(count)
  } else {
    emit('onFinish')
  }
}

watch(() => props.startVal, () => {
  if (props.autoplay) start()
})

watch(() => props.endVal, () => {
  if (props.autoplay) start()
})

watch(() => props.repeatAnimation, (val) => {
  if (val) {
    setInterval(() => {
      start()
    }, val)
  } else {
    pause()
  }
}, { immediate: true })

onMounted(() => {
  if (props.autoplay) start()
  emit('init')
})

onBeforeUnmount(() => {
  if (rAF.value !== null) cancelAnimationFrame(rAF.value)
})

defineExpose({
  start,
  pause,
  resume,
  pauseResume,
  reset
})
</script>
