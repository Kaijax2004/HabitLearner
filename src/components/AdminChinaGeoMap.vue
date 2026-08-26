<template>
  <div class="admin-china-geo-map">
    <div ref="chartRef" class="admin-china-geo-map__canvas" role="img" aria-label="中国省级用户分布地图"></div>
    <div v-if="loadError" class="admin-china-geo-map__error">{{ loadError }}</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  provinces: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)
const loadError = ref('')
let chart = null
let echartsApi = null
let resizeObserver = null

const provinceNameMap = {
  北京: '北京市',
  天津: '天津市',
  河北: '河北省',
  山西: '山西省',
  内蒙古: '内蒙古自治区',
  辽宁: '辽宁省',
  吉林: '吉林省',
  黑龙江: '黑龙江省',
  上海: '上海市',
  江苏: '江苏省',
  浙江: '浙江省',
  安徽: '安徽省',
  福建: '福建省',
  江西: '江西省',
  山东: '山东省',
  河南: '河南省',
  湖北: '湖北省',
  湖南: '湖南省',
  广东: '广东省',
  广西: '广西壮族自治区',
  海南: '海南省',
  重庆: '重庆市',
  四川: '四川省',
  贵州: '贵州省',
  云南: '云南省',
  西藏: '西藏自治区',
  陕西: '陕西省',
  甘肃: '甘肃省',
  青海: '青海省',
  宁夏: '宁夏回族自治区',
  新疆: '新疆维吾尔自治区',
  台湾: '台湾省',
  香港: '香港特别行政区',
  澳门: '澳门特别行政区'
}

const mapData = computed(() => props.provinces.map((item) => ({
  name: provinceNameMap[item.name] || item.name,
  shortName: item.name,
  value: Number(item.value || 0)
})))

const maxValue = computed(() => Math.max(1, ...mapData.value.map((item) => item.value || 0)))

const loadEcharts = async () => {
  if (echartsApi) return echartsApi
  const [core, charts, components, renderers] = await Promise.all([
    import('echarts/core'),
    import('echarts/charts'),
    import('echarts/components'),
    import('echarts/renderers')
  ])

  core.use([
    charts.MapChart,
    components.TooltipComponent,
    components.VisualMapComponent,
    components.GraphicComponent,
    renderers.CanvasRenderer
  ])

  echartsApi = core
  return echartsApi
}

const buildOptions = () => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    borderWidth: 0,
    padding: [10, 12],
    backgroundColor: 'rgba(24, 24, 27, 0.92)',
    textStyle: { color: '#ffffff', fontSize: 12 },
    formatter: (params) => {
      const item = mapData.value.find((entry) => entry.name === params.name)
      return `${item?.shortName || params.name}<br/>注册用户：${Number(params.value || 0)} 位`
    }
  },
  visualMap: {
    min: 0,
    max: maxValue.value,
    left: 10,
    bottom: 12,
    itemWidth: 10,
    itemHeight: 72,
    text: ['高', '低'],
    textStyle: { color: '#71717a', fontSize: 11 },
    inRange: {
      color: ['#f4f4f5', '#d6d3d1', '#78716c', '#27272a']
    },
    calculable: false
  },
  series: [{
    name: '注册用户',
    type: 'map',
    map: 'habitlearner-china',
    roam: false,
    zoom: 1.12,
    top: 16,
    bottom: 16,
    left: 12,
    right: 12,
    selectedMode: false,
    data: mapData.value,
    label: {
      show: true,
      color: '#52525b',
      fontSize: 10,
      formatter: (params) => {
        const item = mapData.value.find((entry) => entry.name === params.name)
        return item?.value ? item.shortName : ''
      }
    },
    itemStyle: {
      areaColor: '#f4f4f5',
      borderColor: 'rgba(113, 113, 122, 0.62)',
      borderWidth: 0.75
    },
    emphasis: {
      disabled: false,
      label: { show: true, color: '#18181b', fontWeight: 800 },
      itemStyle: {
        areaColor: '#a8a29e',
        borderColor: '#18181b',
        borderWidth: 1.1
      }
    }
  }]
})

const renderChart = async () => {
  if (!chartRef.value) return
  loadError.value = ''

  try {
    const echarts = await loadEcharts()
    const response = await fetch('/maps/china-provinces.json')
    if (!response.ok) throw new Error('省界地图数据加载失败')
    const geoJson = await response.json()

    echarts.registerMap('habitlearner-china', geoJson)
    await nextTick()
    chart = chart || echarts.init(chartRef.value, null, { renderer: 'canvas' })
    chart.setOption(buildOptions(), true)
  } catch (error) {
    loadError.value = error.message || '地图加载失败'
  }
}

const resizeChart = () => {
  chart?.resize()
}

watch(() => props.provinces, () => {
  if (chart) chart.setOption(buildOptions(), true)
}, { deep: true })

onMounted(async () => {
  await renderChart()
  resizeObserver = new ResizeObserver(resizeChart)
  if (chartRef.value) resizeObserver.observe(chartRef.value)
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.admin-china-geo-map {
  position: relative;
  min-height: 420px;
}

.admin-china-geo-map__canvas {
  width: 100%;
  min-height: 420px;
}

.admin-china-geo-map__error {
  position: absolute;
  inset: 50% auto auto 50%;
  transform: translate(-50%, -50%);
  border-radius: 18px;
  background: rgba(254, 226, 226, 0.88);
  padding: 14px 16px;
  color: rgb(185, 28, 28);
  font-size: 13px;
}

@media (max-width: 720px) {
  .admin-china-geo-map,
  .admin-china-geo-map__canvas {
    min-height: 320px;
  }
}
</style>
