import { ref, computed } from 'vue'

export function useWordCount() {
  const showWordCount = ref(false)

  // 计算文本内容的字数
  const countWords = (text) => {
    if (!text || typeof text !== 'string') return 0
    // 移除多余空格，按空格分割，过滤空字符串
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  // 计算字符数（包括空格）
  const countCharacters = (text) => {
    if (!text || typeof text !== 'string') return 0
    return text.length
  }

  // 计算字符数（不包括空格）
  const countCharactersNoSpaces = (text) => {
    if (!text || typeof text !== 'string') return 0
    return text.replace(/\s/g, '').length
  }

  // 计算段落数
  const countParagraphs = (text) => {
    if (!text || typeof text !== 'string') return 0
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    return paragraphs.length
  }

  // 计算行数
  const countLines = (text) => {
    if (!text || typeof text !== 'string') return 0
    return text.split('\n').length
  }

  // 从块内容中提取文本
  const extractTextFromBlock = (block) => {
    if (!block || !block.content) return ''
    
    switch (block.type) {
      case 'heading':
        return block.content.text || ''
      case 'text':
        return block.content.text || ''
      case 'todo':
        return block.content.text || ''
      case 'quote':
        return block.content.text || ''
      case 'code':
        return block.content.code || ''
      case 'list':
        if (block.content.items && Array.isArray(block.content.items)) {
          return block.content.items.join(' ')
        }
        return ''
      case 'table':
        let tableText = ''
        if (block.content.headers && Array.isArray(block.content.headers)) {
          tableText += block.content.headers.join(' ')
        }
        if (block.content.rows && Array.isArray(block.content.rows)) {
          block.content.rows.forEach(row => {
            if (Array.isArray(row)) {
              tableText += ' ' + row.join(' ')
            }
          })
        }
        return tableText
      case 'callout':
        return block.content.text || ''
      case 'image':
        return (block.content.alt || '') + ' ' + (block.content.url || '')
      case 'video':
        return (block.content.title || '') + ' ' + (block.content.url || '')
      case 'audio':
        return (block.content.title || '') + ' ' + (block.content.url || '')
      case 'formula':
        return block.content.latex || ''
      case 'collapse':
        return (block.content.title || '') + ' ' + (block.content.text || '')
      case 'columns':
        if (block.content.columns && Array.isArray(block.content.columns)) {
          return block.content.columns.join(' ')
        }
        return ''
      default:
        return block.content.text || ''
    }
  }

  // 计算计划的字数统计
  const calculatePlanStats = (blocks) => {
    let totalText = ''
    let blockStats = []
    
    blocks.forEach((block, index) => {
      const blockText = extractTextFromBlock(block)
      totalText += blockText + ' '
      
      const stats = {
        blockIndex: index,
        blockType: block.type,
        words: countWords(blockText),
        characters: countCharacters(blockText),
        charactersNoSpaces: countCharactersNoSpaces(blockText),
        paragraphs: countParagraphs(blockText),
        lines: countLines(blockText)
      }
      
      blockStats.push(stats)
    })
    
    return {
      total: {
        words: countWords(totalText),
        characters: countCharacters(totalText),
        charactersNoSpaces: countCharactersNoSpaces(totalText),
        paragraphs: countParagraphs(totalText),
        lines: countLines(totalText),
        blocks: blocks.length
      },
      byBlock: blockStats
    }
  }

  // 获取块类型的中文名称
  const getBlockTypeName = (type) => {
    const names = {
      text: '文本',
      heading: '标题',
      todo: '待办',
      image: '图片',
      video: '视频',
      audio: '音频',
      quote: '引用',
      callout: '标注',
      formula: '公式',
      collapse: '折叠',
      code: '代码',
      columns: '多列',
      table: '表格',
      list: '列表'
    }
    return names[type] || '未知'
  }

  // 格式化数字
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // 获取阅读时间估算（按每分钟200字计算）
  const getReadingTime = (wordCount) => {
    const minutes = Math.ceil(wordCount / 200)
    if (minutes < 1) return '不到1分钟'
    if (minutes === 1) return '约1分钟'
    return `约${minutes}分钟`
  }

  return {
    showWordCount,
    countWords,
    countCharacters,
    countCharactersNoSpaces,
    countParagraphs,
    countLines,
    extractTextFromBlock,
    calculatePlanStats,
    getBlockTypeName,
    formatNumber,
    getReadingTime
  }
}
