<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="h-7 w-7"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-for="(path, index) in icon.paths" :key="`p-${index}`">
      <path :d="path" />
    </template>
    <template v-for="(line, index) in icon.lines" :key="`l-${index}`">
      <line :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" />
    </template>
    <template v-for="(circle, index) in icon.circles" :key="`c-${index}`">
      <circle :cx="circle.cx" :cy="circle.cy" :r="circle.r" />
    </template>
    <template v-for="(rect, index) in icon.rects" :key="`r-${index}`">
      <rect :x="rect.x" :y="rect.y" :width="rect.width" :height="rect.height" :rx="rect.rx || 0" />
    </template>
    <template v-for="(polyline, index) in icon.polylines" :key="`pl-${index}`">
      <polyline :points="polyline" />
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  soundId: {
    type: String,
    default: ''
  },
  categoryId: {
    type: String,
    default: ''
  }
})

const ICONS = {
  noise: {
    circles: [{ cx: 12, cy: 12, r: 2.2 }],
    lines: [
      { x1: 12, y1: 4, x2: 12, y2: 6.2 },
      { x1: 12, y1: 17.8, x2: 12, y2: 20 },
      { x1: 4, y1: 12, x2: 6.2, y2: 12 },
      { x1: 17.8, y1: 12, x2: 20, y2: 12 },
      { x1: 6.1, y1: 6.1, x2: 7.6, y2: 7.6 },
      { x1: 16.4, y1: 16.4, x2: 17.9, y2: 17.9 },
      { x1: 16.4, y1: 7.6, x2: 17.9, y2: 6.1 },
      { x1: 6.1, y1: 17.9, x2: 7.6, y2: 16.4 }
    ]
  },
  rain: {
    paths: ['M7 14a4 4 0 1 1 .7-7.94A4.8 4.8 0 0 1 17.5 8a3.5 3.5 0 1 1-.1 7H7Z'],
    lines: [
      { x1: 9, y1: 16.3, x2: 8.4, y2: 18.9 },
      { x1: 12.5, y1: 16.3, x2: 11.9, y2: 18.9 },
      { x1: 16, y1: 16.3, x2: 15.4, y2: 18.9 }
    ]
  },
  thunder: {
    paths: [
      'M7 13.8a4 4 0 1 1 .7-7.94A4.8 4.8 0 0 1 17.5 7.8a3.5 3.5 0 1 1-.1 6H7Z'
    ],
    polylines: ['11 14.5 9.8 18 12.4 18 11.4 21 15 16.6 12.5 16.6 13.7 14.5']
  },
  drop: {
    paths: ['M12 4.5C9.3 8 7.8 10.2 7.8 13a4.2 4.2 0 0 0 8.4 0c0-2.8-1.5-5-4.2-8.5Z']
  },
  fire: {
    paths: [
      'M12.3 4.6c.2 2.1-1.4 3.3-2.2 4.7-.7 1.1-.6 2.4.2 3.3.1-1 1-1.8 1.8-2.5.9-.8 1.7-1.8 1.8-3.1 1.8 1.2 3 3.4 3 5.9a4.9 4.9 0 1 1-9.8 0c0-2.9 1.9-5.4 5.2-8.3Z'
    ]
  },
  waves: {
    paths: [
      'M3.5 9.2c1.7 0 1.7-1 3.4-1s1.7 1 3.4 1 1.7-1 3.4-1 1.7 1 3.4 1 1.7-1 3.4-1',
      'M3.5 14c1.7 0 1.7-1 3.4-1s1.7 1 3.4 1 1.7-1 3.4-1 1.7 1 3.4 1 1.7-1 3.4-1'
    ]
  },
  wind: {
    paths: [
      'M4 10.2h10.8a2.2 2.2 0 1 0-2.1-2.9',
      'M4 14.5h13.4a2 2 0 1 1-1.9 2.7',
      'M6.2 18.6h7.5a1.8 1.8 0 1 0-1.8-2.2'
    ]
  },
  leaf: {
    paths: [
      'M18.5 5.5c-6 .3-10.5 3.8-11.7 10.3-.2 1.1-.3 2-.3 2 0 .3.2.5.5.5 0 0 .9-.1 2-.3C15.5 16.8 19 12.3 19.3 6.3c0-.5-.3-.8-.8-.8Z',
      'M9.2 14.8c1.6-2.1 3.7-4 6.3-5.6'
    ]
  },
  bird: {
    paths: [
      'M4.5 13.3c2.1-2.6 3.8-3.9 5.4-3.9 1.3 0 2 .9 2.8 1.9.8 1 1.5 1.8 2.8 1.8 1 0 2.2-.5 3.9-1.8',
      'M7.6 10.3c.6-.8 1.4-1.5 2.5-2'
    ]
  },
  paw: {
    circles: [
      { cx: 8.2, cy: 9.2, r: 1.2 },
      { cx: 11.5, cy: 7.5, r: 1.2 },
      { cx: 15, cy: 7.7, r: 1.2 },
      { cx: 17.2, cy: 10.6, r: 1.2 }
    ],
    paths: ['M12.2 11.2c-2.2 0-4 1.7-4 3.7 0 2.1 1.8 3.6 4 3.6s4.1-1.5 4.1-3.6c0-2-1.9-3.7-4.1-3.7Z']
  },
  city: {
    rects: [
      { x: 4.5, y: 9, width: 4, height: 10, rx: 0.8 },
      { x: 10, y: 5.8, width: 4.4, height: 13.2, rx: 0.8 },
      { x: 15.7, y: 11.2, width: 3.8, height: 7.8, rx: 0.8 }
    ],
    lines: [
      { x1: 6.2, y1: 11.5, x2: 6.2, y2: 11.5 },
      { x1: 6.2, y1: 14.2, x2: 6.2, y2: 14.2 },
      { x1: 12.2, y1: 8.4, x2: 12.2, y2: 8.4 },
      { x1: 12.2, y1: 11.2, x2: 12.2, y2: 11.2 }
    ]
  },
  cup: {
    paths: [
      'M6 9h9v4.2A3.8 3.8 0 0 1 11.2 17H9.8A3.8 3.8 0 0 1 6 13.2V9Z',
      'M15 10h1.5a2 2 0 1 1 0 4H15',
      'M7 19h8'
    ]
  },
  book: {
    paths: [
      'M6.2 6.2h4.6c1.2 0 2.3.4 3.2 1.1v10.5a4.9 4.9 0 0 0-3.2-1.1H6.2a1 1 0 0 1-1-1V7.2a1 1 0 0 1 1-1Z',
      'M17.8 6.2h-4.6c-1.2 0-2.3.4-3.2 1.1'
    ]
  },
  building: {
    paths: [
      'M4.8 18.5h14.4',
      'M6.5 18.5V9.5L12 5.5l5.5 4v9',
      'M9.5 18.5V13h5v5'
    ]
  },
  plane: {
    paths: [
      'M3.8 12.1 20 7.2l-3.4 5 3.4 4.6-5.5-1.5-3.2 3.2v-4l-4-1.1'
    ]
  },
  train: {
    rects: [{ x: 6, y: 5.5, width: 12, height: 11, rx: 2.3 }],
    lines: [
      { x1: 9, y1: 9.2, x2: 11.2, y2: 9.2 },
      { x1: 12.8, y1: 9.2, x2: 15, y2: 9.2 },
      { x1: 9, y1: 18.5, x2: 7.2, y2: 20.2 },
      { x1: 15, y1: 18.5, x2: 16.8, y2: 20.2 }
    ],
    circles: [
      { cx: 9.4, cy: 13.1, r: 0.8 },
      { cx: 14.6, cy: 13.1, r: 0.8 }
    ]
  },
  boat: {
    paths: [
      'M7.5 18h9L18.8 13H5.2L7.5 18Z',
      'M12 6v7',
      'M12 6 16.2 8.8 12 11.4'
    ],
    lines: [{ x1: 4.6, y1: 19.2, x2: 19.4, y2: 19.2 }]
  },
  device: {
    rects: [{ x: 5.5, y: 7, width: 13, height: 10, rx: 2.2 }],
    lines: [
      { x1: 8.5, y1: 10.2, x2: 15.5, y2: 10.2 },
      { x1: 8.5, y1: 13.2, x2: 12.5, y2: 13.2 }
    ]
  },
  clock: {
    circles: [{ cx: 12, cy: 12, r: 7.2 }],
    lines: [
      { x1: 12, y1: 8.7, x2: 12, y2: 12.2 },
      { x1: 12, y1: 12.2, x2: 14.8, y2: 13.8 }
    ]
  },
  keyboard: {
    rects: [{ x: 4.4, y: 7.2, width: 15.2, height: 9.6, rx: 2.2 }],
    lines: [
      { x1: 7, y1: 10, x2: 7, y2: 10 },
      { x1: 10, y1: 10, x2: 10, y2: 10 },
      { x1: 13, y1: 10, x2: 13, y2: 10 },
      { x1: 16, y1: 10, x2: 16, y2: 10 },
      { x1: 7, y1: 13, x2: 16, y2: 13 }
    ]
  },
  fan: {
    circles: [{ cx: 12, cy: 12, r: 1.5 }],
    paths: [
      'M12 10.6c1.2-3.3 3.8-4 5.1-3.3 1.2.8 1 3-2.1 5.2',
      'M13.3 12.7c3.4.7 4.4 3.2 3.9 4.6-.6 1.3-2.8 1.5-5.5-1.2',
      'M10.7 13.3c-.7 3.4-3.2 4.4-4.6 3.9-1.3-.6-1.5-2.8 1.2-5.5',
      'M10.6 10.7c-3.3-1.2-4-3.8-3.3-5.1.8-1.2 3-1 5.2 2.1'
    ]
  },
  chime: {
    lines: [
      { x1: 6, y1: 5.8, x2: 18, y2: 5.8 },
      { x1: 8, y1: 5.8, x2: 8, y2: 14.5 },
      { x1: 12, y1: 5.8, x2: 12, y2: 16.2 },
      { x1: 16, y1: 5.8, x2: 16, y2: 13.2 },
      { x1: 12, y1: 16.2, x2: 12, y2: 19.2 }
    ],
    circles: [{ cx: 12, cy: 20.2, r: 0.9 }]
  },
  washer: {
    rects: [{ x: 5.2, y: 4.8, width: 13.6, height: 14.4, rx: 2 }],
    circles: [
      { cx: 12, cy: 13, r: 3.4 },
      { cx: 8.2, cy: 8.2, r: 0.7 },
      { cx: 11, cy: 8.2, r: 0.7 }
    ]
  },
  spark: {
    lines: [
      { x1: 12, y1: 4.5, x2: 12, y2: 8 },
      { x1: 12, y1: 16, x2: 12, y2: 19.5 },
      { x1: 4.5, y1: 12, x2: 8, y2: 12 },
      { x1: 16, y1: 12, x2: 19.5, y2: 12 },
      { x1: 6.8, y1: 6.8, x2: 9.1, y2: 9.1 },
      { x1: 14.9, y1: 14.9, x2: 17.2, y2: 17.2 },
      { x1: 14.9, y1: 9.1, x2: 17.2, y2: 6.8 },
      { x1: 6.8, y1: 17.2, x2: 9.1, y2: 14.9 }
    ],
    circles: [{ cx: 12, cy: 12, r: 2.4 }]
  },
  waveform: {
    paths: ['M4 12h2.3l1.4-4 2.6 8 2.2-5 1.8 3H20']
  },
  footsteps: {
    paths: [
      'M8.5 8.2c0 1-.7 1.8-1.6 1.8s-1.6-.8-1.6-1.8.7-1.8 1.6-1.8 1.6.8 1.6 1.8Z',
      'M15.8 13.8c0 1-.7 1.8-1.6 1.8s-1.6-.8-1.6-1.8.7-1.8 1.6-1.8 1.6.8 1.6 1.8Z',
      'M8.2 10.4c.9.6 1.5 1.6 1.5 2.7',
      'M15.2 16c.9.6 1.5 1.6 1.5 2.7'
    ]
  }
}

function pickIconKey(soundId, categoryId) {
  const id = String(soundId || '')

  if (id.includes('thunder')) return 'thunder'
  if (id.includes('rain')) return 'rain'
  if (id.includes('droplets') || id.includes('bubbles')) return 'drop'
  if (id.includes('campfire')) return 'fire'
  if (id.includes('river') || id.includes('waves') || id.includes('waterfall') || id.includes('underwater')) return 'waves'
  if (id.includes('wind') || id.includes('umbrella') || id.includes('leaves')) return 'wind'
  if (id.includes('jungle')) return 'leaf'
  if (id.includes('walk-')) return 'footsteps'
  if (id.includes('birds') || id.includes('seagulls') || id.includes('owl') || id.includes('crows') || id.includes('woodpecker')) return 'bird'
  if (id.includes('cat') || id.includes('dog') || id.includes('wolf') || id.includes('horse') || id.includes('frog') || id.includes('whale') || id.includes('sheep') || id.includes('cows') || id.includes('chickens') || id.includes('beehive')) return 'paw'
  if (id.includes('airport') || id.includes('airplane')) return 'plane'
  if (id.includes('train') || id.includes('subway')) return 'train'
  if (id.includes('boat') || id.includes('sailboat') || id.includes('rowing-boat') || id.includes('submarine')) return 'boat'
  if (id.includes('cafe') || id.includes('restaurant') || id.includes('bar')) return 'cup'
  if (id.includes('library')) return 'book'
  if (id.includes('church') || id.includes('temple')) return 'building'
  if (id.includes('city') || id.includes('street') || id.includes('highway') || id.includes('road') || id.includes('traffic') || id.includes('office') || id.includes('construction-site') || id.includes('supermarket')) return 'city'
  if (id.includes('laboratory')) return 'device'
  if (id.includes('laundry') || id.includes('washing-machine') || id.includes('dryer')) return 'washer'
  if (id.includes('keyboard') || id.includes('typewriter') || id.includes('morse-code')) return 'keyboard'
  if (id.includes('clock')) return 'clock'
  if (id.includes('fan')) return 'fan'
  if (id.includes('wind-chimes')) return 'chime'
  if (id.includes('slide-projector') || id.includes('vinyl-effect') || id.includes('tuning-radio') || id.includes('paper') || id.includes('singing-bowl')) return 'device'
  if (id.includes('fireworks')) return 'spark'
  if (id.includes('binaural')) return 'waveform'

  switch (categoryId) {
    case 'rain': return 'rain'
    case 'nature': return 'waves'
    case 'animals': return 'paw'
    case 'urban': return 'city'
    case 'places': return 'building'
    case 'transport': return 'train'
    case 'things': return 'device'
    case 'binaural': return 'waveform'
    default: return 'noise'
  }
}

const icon = computed(() => {
  const key = pickIconKey(props.soundId, props.categoryId)
  return ICONS[key] || ICONS.noise
})
</script>
