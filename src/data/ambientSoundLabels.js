export const ambientSoundCategoryMeta = {
  noise: {
    titleZh: '噪音',
    titleEn: 'Noise',
    icon: '◌',
    description: '适合屏蔽环境干扰，快速进入专注状态。'
  },
  rain: {
    titleZh: '雨声',
    titleEn: 'Rain',
    icon: '☔',
    description: '适合沉浸阅读、夜间学习和放松思绪。'
  },
  nature: {
    titleZh: '自然',
    titleEn: 'Nature',
    icon: '∿',
    description: '更偏自然流动感，适合长时间稳定专注。'
  },
  animals: {
    titleZh: '动物',
    titleEn: 'Animals',
    icon: '🐾',
    description: '轻微生命感背景音，适合营造柔和氛围。'
  },
  urban: {
    titleZh: '城市',
    titleEn: 'Urban',
    icon: '▦',
    description: '带一点城市现场感，适合模拟外部环境。'
  },
  places: {
    titleZh: '场景',
    titleEn: 'Places',
    icon: '⌂',
    description: '咖啡馆、图书馆、办公室等地点氛围声。'
  },
  transport: {
    titleZh: '交通',
    titleEn: 'Transport',
    icon: '↗',
    description: '适合喜欢稳定移动声场的人群。'
  },
  things: {
    titleZh: '物件',
    titleEn: 'Things',
    icon: '⚙',
    description: '机械、器物与生活物件的细碎环境声。'
  },
  binaural: {
    titleZh: '双耳节拍',
    titleEn: 'Binaural',
    icon: '◉',
    description: '更偏节奏引导，适合深度专注或放松。'
  }
}

export const ambientSoundNameMap = {
  'noise/brown-noise': '棕噪音',
  'noise/pink-noise': '粉噪音',
  'noise/white-noise': '白噪音',

  'rain/heavy-rain': '暴雨',
  'rain/light-rain': '小雨',
  'rain/rain-on-car-roof': '车顶雨声',
  'rain/rain-on-leaves': '叶面雨声',
  'rain/rain-on-tent': '帐篷雨声',
  'rain/rain-on-umbrella': '雨伞雨声',
  'rain/rain-on-window': '窗外雨声',
  'rain/thunder': '雷雨',

  'nature/campfire': '篝火',
  'nature/droplets': '水滴',
  'nature/howling-wind': '呼啸风声',
  'nature/jungle': '丛林',
  'nature/river': '河流',
  'nature/walk-in-snow': '踏雪声',
  'nature/walk-on-gravel': '碎石脚步',
  'nature/walk-on-leaves': '落叶脚步',
  'nature/waterfall': '瀑布',
  'nature/waves': '海浪',
  'nature/wind': '微风',
  'nature/wind-in-trees': '林间风声',

  'animals/beehive': '蜂群',
  'animals/birds': '鸟鸣',
  'animals/cat-purring': '猫呼噜',
  'animals/chickens': '鸡群',
  'animals/cows': '牛群',
  'animals/crickets': '蟋蟀',
  'animals/crows': '乌鸦',
  'animals/dog-barking': '狗吠',
  'animals/frog': '蛙鸣',
  'animals/horse-gallop': '马蹄',
  'animals/owl': '猫头鹰',
  'animals/seagulls': '海鸥',
  'animals/sheep': '羊群',
  'animals/whale': '鲸鸣',
  'animals/wolf': '狼嚎',
  'animals/woodpecker': '啄木鸟',

  'urban/ambulance-siren': '救护车警笛',
  'urban/busy-street': '繁忙街道',
  'urban/crowd': '人群',
  'urban/fireworks': '烟花',
  'urban/highway': '高速公路',
  'urban/road': '道路',
  'urban/traffic': '车流',

  'places/airport': '机场',
  'places/cafe': '咖啡馆',
  'places/carousel': '旋转木马',
  'places/church': '教堂',
  'places/construction-site': '工地',
  'places/crowded-bar': '拥挤酒吧',
  'places/laboratory': '实验室',
  'places/laundry-room': '洗衣房',
  'places/library': '图书馆',
  'places/night-village': '夜晚村庄',
  'places/office': '办公室',
  'places/restaurant': '餐厅',
  'places/subway-station': '地铁站',
  'places/supermarket': '超市',
  'places/temple': '寺庙',
  'places/underwater': '水下',

  'transport/airplane': '飞机',
  'transport/inside-a-train': '列车车厢',
  'transport/rowing-boat': '划艇',
  'transport/sailboat': '帆船',
  'transport/submarine': '潜艇',
  'transport/train': '列车',

  'things/boiling-water': '沸水',
  'things/bubbles': '气泡',
  'things/ceiling-fan': '吊扇',
  'things/clock': '时钟',
  'things/dryer': '烘干机',
  'things/keyboard': '键盘',
  'things/morse-code': '摩尔斯电码',
  'things/paper': '纸张',
  'things/singing-bowl': '颂钵',
  'things/slide-projector': '幻灯机',
  'things/tuning-radio': '调频收音机',
  'things/typewriter': '打字机',
  'things/vinyl-effect': '黑胶效果',
  'things/washing-machine': '洗衣机',
  'things/wind-chimes': '风铃',
  'things/windshield-wipers': '雨刷',

  'binaural/binaural-alpha': '阿尔法节拍',
  'binaural/binaural-beta': '贝塔节拍',
  'binaural/binaural-delta': '德尔塔节拍',
  'binaural/binaural-gamma': '伽马节拍',
  'binaural/binaural-theta': '西塔节拍'
}

const ambientSoundIconOverrides = {
  'noise/brown-noise': '◎',
  'noise/pink-noise': '◍',
  'noise/white-noise': '◯',
  'rain/heavy-rain': '⛈',
  'rain/light-rain': '☂',
  'rain/thunder': '⚡',
  'nature/campfire': '✦',
  'nature/waterfall': '≋',
  'nature/waves': '〰',
  'nature/wind': '◜',
  'animals/birds': '✧',
  'urban/fireworks': '✺',
  'places/cafe': '☕',
  'places/library': '⌘',
  'transport/airplane': '✈',
  'transport/train': '⇄',
  'things/clock': '◴',
  'things/keyboard': '⌨',
  'binaural/binaural-alpha': 'α',
  'binaural/binaural-beta': 'β',
  'binaural/binaural-delta': 'δ',
  'binaural/binaural-gamma': 'γ',
  'binaural/binaural-theta': 'θ'
}

export function getAmbientSoundCategoryDisplayMeta(categoryId) {
  return ambientSoundCategoryMeta[categoryId] || {
    titleZh: categoryId || '',
    titleEn: categoryId || '',
    icon: '◌',
    description: ''
  }
}

export function getAmbientSoundDisplayName(sound) {
  if (!sound) return ''

  return ambientSoundNameMap[sound.id] || sound.label || sound.slug || ''
}

export function getAmbientSoundDisplayIcon(sound) {
  if (!sound) return '◌'

  if (ambientSoundIconOverrides[sound.id]) {
    return ambientSoundIconOverrides[sound.id]
  }

  return getAmbientSoundCategoryDisplayMeta(sound.categoryId).icon
}

export function getAmbientSoundDisplayMeta(sound) {
  if (!sound) {
    return {
      name: '',
      icon: '◌',
      categoryId: '',
      categoryTitleZh: '',
      categoryTitleEn: '',
      categoryDescription: ''
    }
  }

  const category = getAmbientSoundCategoryDisplayMeta(sound.categoryId)

  return {
    name: getAmbientSoundDisplayName(sound),
    icon: getAmbientSoundDisplayIcon(sound),
    categoryId: sound.categoryId || '',
    categoryTitleZh: category.titleZh,
    categoryTitleEn: category.titleEn,
    categoryDescription: category.description
  }
}
