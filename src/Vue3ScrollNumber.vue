<template>
  <span>{{ displayValue }}</span>
</template>

<script setup>
import {ref, computed, watch, onMounted, onBeforeUnmount} from 'vue'
import {requestAnimationFrame, cancelAnimationFrame} from './requestAnimationFrame.js'

// 定义组件属性
const props = defineProps({
  startVal: {
    type: Number,
    default: 0
  },
  endVal: {
    type: Number,
    default: 2017
  },
  duration: {
    type: Number,
    default: 3000
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  decimals: {
    type: Number,
    default: 0,
    validator(value) {
      return value >= 0
    }
  },
  decimal: {
    type: String,
    default: '.'
  },
  separator: {
    type: String,
    default: ','
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  useEasing: {
    type: Boolean,
    default: true
  },
  easingFn: {
    type: Function,
    default: (t, b, c, d) => c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b
  },
  repeatAnimation: {
    type: Number,
    default: undefined
  }
})

// 定义事件
const emit = defineEmits(['callback', 'mountedCallback'])

// 数字格式化函数
const formatNumber = (num) => {
  // 保留小数位数
  num = num.toFixed(props.decimals)
  const [x1, x2] = num.split('.')
  const x2Formatted = x2 ? props.decimal + x2 : ''
  const rgx = /(\d+)(\d{3})/
  let x1Formatted = x1

  // 添加千位分隔符
  while (rgx.test(x1Formatted)) {
    x1Formatted = x1Formatted.replace(rgx, '$1' + props.separator + '$2')
  }

  return props.prefix + x1Formatted + x2Formatted + props.suffix
}

// 响应式属性和变量
const localStartVal = ref(props.startVal)  // 局部起始值
const displayValue = ref(formatNumber(props.startVal))  // 显示值
const printVal = ref(null)  // 当前计数值
const paused = ref(false)  // 是否暂停
const localDuration = ref(props.duration)  // 局部持续时间
const startTime = ref(null)  // 动画开始时间
const timestamp = ref(null)  // 当前时间戳
const remaining = ref(null)  // 剩余时间
const rAF = ref(null)  // requestAnimationFrame 标识
const countDown = computed(() => props.startVal > props.endVal)  // 是否倒计时

// 动画控制函数
const start = () => {
  localStartVal.value = props.startVal
  startTime.value = null
  localDuration.value = props.duration
  paused.value = false
  rAF.value = requestAnimationFrame(count)
}

// 暂停动画
const pause = () => {
  cancelAnimationFrame(rAF.value)
}

// 恢复动画
const resume = () => {
  startTime.value = null
  localDuration.value = +remaining.value
  localStartVal.value = +printVal.value
  rAF.value = requestAnimationFrame(count)
}

// 切换暂停/恢复
const pauseResume = () => {
  if (paused.value) {
    resume()
  } else {
    pause()
  }
  paused.value = !paused.value
}

// 重置动画
const reset = () => {
  startTime.value = null
  cancelAnimationFrame(rAF.value)
  displayValue.value = formatNumber(props.startVal)
}

// 动画计数函数
const count = (timestampVal) => {
  if (!startTime.value) startTime.value = timestampVal
  timestamp.value = timestampVal
  const progress = timestampVal - startTime.value
  remaining.value = localDuration.value - progress

  // 使用缓动函数计算当前值
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

  // 确保值不会超出范围
  if (countDown.value) {
    printVal.value = printVal.value < props.endVal ? props.endVal : printVal.value
  } else {
    printVal.value = printVal.value > props.endVal ? props.endVal : printVal.value
  }

  displayValue.value = formatNumber(printVal.value)

  if (progress < localDuration.value) {
    rAF.value = requestAnimationFrame(count)
  } else {
    emit('callback')
  }
}

// 监听属性变化
watch(() => props.startVal, (newVal) => {
  if (props.autoplay) start()
})

watch(() => props.endVal, (newVal) => {
  if (props.autoplay) start()
})

// 监听重复动画属性变化
watch(() => props.repeatAnimation, (val) => {
  if (val) {
    setInterval(() => {
      start()
    }, val)
  } else {
    pause()
  }
}, {immediate: true})

// 生命周期钩子
onMounted(() => {
  if (props.autoplay) start()
  emit('mountedCallback', 'start')
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rAF.value)
})

// 暴露函数
defineExpose({
  start,
  pause,
  resume,
  pauseResume,
  reset
})
</script>
