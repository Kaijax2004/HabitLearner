<template>
  <div class="w-full h-full">
    <div ref="chartContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

// 响应式数据
const chartContainer = ref(null)

// 方法
const createChart = () => {
  if (!chartContainer.value || !props.data.length) return

  // 清空容器
  chartContainer.value.innerHTML = ''

  // 创建SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '100%')
  svg.setAttribute('height', '100%')
  svg.setAttribute('viewBox', '0 0 400 200')

  // 设置样式
  svg.style.background = 'transparent'

  // 图表配置
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }
  const width = 400 - margin.left - margin.right
  const height = 200 - margin.top - margin.bottom

  // 创建主组
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`)

  // 计算比例
  const xScale = width / (props.data.length - 1)
  const maxValue = Math.max(...props.data.map(d => d.completed))

  // 绘制网格线
  const gridLines = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  gridLines.setAttribute('class', 'grid-lines')

  // 水平网格线
  for (let i = 0; i <= 5; i++) {
    const y = (height / 5) * i
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', '0')
    line.setAttribute('y1', y)
    line.setAttribute('x2', width)
    line.setAttribute('y2', y)
    line.setAttribute('stroke', '#f3f4f6')
    line.setAttribute('stroke-width', '1')
    gridLines.appendChild(line)
  }

  // 垂直网格线
  for (let i = 0; i < props.data.length; i += 7) {
    const x = xScale * i
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x)
    line.setAttribute('y1', '0')
    line.setAttribute('x2', x)
    line.setAttribute('y2', height)
    line.setAttribute('stroke', '#f3f4f6')
    line.setAttribute('stroke-width', '1')
    gridLines.appendChild(line)
  }

  g.appendChild(gridLines)

  // 绘制数据点
  const dataPoints = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  dataPoints.setAttribute('class', 'data-points')

  props.data.forEach((point, index) => {
    const x = xScale * index
    const y = height - (point.completed / maxValue) * height

    // 数据点
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', x)
    circle.setAttribute('cy', y)
    circle.setAttribute('r', '4')
    circle.setAttribute('fill', point.completed > 0 ? '#34C759' : '#e5e7eb')
    circle.setAttribute('stroke', point.completed > 0 ? '#34C759' : '#e5e7eb')
    circle.setAttribute('stroke-width', '2')
    dataPoints.appendChild(circle)
  })

  g.appendChild(dataPoints)

  // 绘制连接线
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  let pathData = ''

  props.data.forEach((point, index) => {
    const x = xScale * index
    const y = height - (point.completed / maxValue) * height

    if (index === 0) {
      pathData += `M ${x} ${y}`
    } else {
      pathData += ` L ${x} ${y}`
    }
  })

  path.setAttribute('d', pathData)
  path.setAttribute('fill', 'none')
  path.setAttribute('stroke', '#34C759')
  path.setAttribute('stroke-width', '2')
  path.setAttribute('stroke-linecap', 'round')
  path.setAttribute('stroke-linejoin', 'round')

  g.appendChild(path)

  // 添加Y轴标签
  const yLabels = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  yLabels.setAttribute('class', 'y-labels')

  for (let i = 0; i <= 5; i++) {
    const y = (height / 5) * i
    const value = Math.round((maxValue / 5) * (5 - i))
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', '-10')
    text.setAttribute('y', y + 4)
    text.setAttribute('text-anchor', 'end')
    text.setAttribute('font-size', '12')
    text.setAttribute('fill', '#6b7280')
    text.textContent = value
    yLabels.appendChild(text)
  }

  g.appendChild(yLabels)

  // 添加X轴标签
  const xLabels = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  xLabels.setAttribute('class', 'x-labels')

  for (let i = 0; i < props.data.length; i += 7) {
    const x = xScale * i
    const date = new Date(props.data[i].date)
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', x)
    text.setAttribute('y', height + 20)
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('font-size', '10')
    text.setAttribute('fill', '#6b7280')
    text.textContent = `${month}/${day}`
    xLabels.appendChild(text)
  }

  g.appendChild(xLabels)

  svg.appendChild(g)
  chartContainer.value.appendChild(svg)
}

// 监听数据变化
watch(() => props.data, createChart, { deep: true })

// 生命周期
onMounted(() => {
  createChart()
})
</script>
