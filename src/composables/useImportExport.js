import { ref } from 'vue'

export function useImportExport() {
  const isExporting = ref(false)
  const isImporting = ref(false)

  // 导出计划为Markdown格式
  const exportToMarkdown = (plan) => {
    let markdown = `# ${plan.title}\n\n`
    
    // 添加计划元数据
    if (plan.dueDate) {
      markdown += `**截止日期**: ${plan.dueDate}\n`
    }
    if (plan.status) {
      const statusMap = {
        'not_started': '未开始',
        'in_progress': '进行中',
        'done': '已完成'
      }
      markdown += `**状态**: ${statusMap[plan.status] || plan.status}\n`
    }
    if (plan.priority) {
      const priorityMap = {
        'low': '低优先级',
        'medium': '中优先级',
        'high': '高优先级'
      }
      markdown += `**优先级**: ${priorityMap[plan.priority] || plan.priority}\n`
    }
    markdown += '\n---\n\n'

    // 添加块内容
    if (plan.blocks && plan.blocks.length > 0) {
      plan.blocks.forEach(block => {
        markdown += convertBlockToMarkdown(block) + '\n\n'
      })
    }

    return markdown
  }

  // 将块转换为Markdown
  const convertBlockToMarkdown = (block) => {
    switch (block.type) {
      case 'heading':
        const level = '#'.repeat(block.content.level || 1)
        return `${level} ${block.content.text || ''}`
      
      case 'text':
        return block.content.text || ''
      
      case 'todo':
        const checkbox = block.content.done ? '[x]' : '[ ]'
        return `${checkbox} ${block.content.text || ''}`
      
      case 'quote':
        return `> ${block.content.text || ''}`
      
      case 'code':
        return `\`\`\`${block.content.lang || ''}\n${block.content.code || ''}\n\`\`\``
      
      case 'list':
        if (block.content.items && block.content.items.length > 0) {
          return block.content.items.map((item, index) => {
            if (block.content.listType === 'ordered') {
              return `${index + 1}. ${item}`
            } else {
              return `- ${item}`
            }
          }).join('\n')
        }
        return ''
      
      case 'table':
        if (block.content.headers && block.content.rows) {
          let table = '| ' + block.content.headers.join(' | ') + ' |\n'
          table += '| ' + block.content.headers.map(() => '---').join(' | ') + ' |\n'
          block.content.rows.forEach(row => {
            table += '| ' + row.join(' | ') + ' |\n'
          })
          return table
        }
        return ''
      
      case 'callout':
        return `> **${block.content.variant || 'info'}**: ${block.content.text || ''}`
      
      case 'image':
        return `![${block.content.alt || ''}](${block.content.url || ''})`
      
      case 'video':
        return `[视频: ${block.content.title || ''}](${block.content.url || ''})`
      
      case 'audio':
        return `[音频: ${block.content.title || ''}](${block.content.url || ''})`
      
      case 'formula':
        return `$$${block.content.latex || ''}$$`
      
      case 'collapse':
        return `<details>\n<summary>${block.content.title || ''}</summary>\n\n${block.content.text || ''}\n</details>`
      
      case 'columns':
        if (block.content.columns && block.content.columns.length > 0) {
          return block.content.columns.join('\n\n---\n\n')
        }
        return ''
      
      default:
        return block.content.text || ''
    }
  }

  // 导出为JSON格式
  const exportToJSON = (plan) => {
    return JSON.stringify(plan, null, 2)
  }

  // 导出为HTML格式
  const exportToHTML = (plan) => {
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${plan.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 2em; margin-bottom: 1em; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
        code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: 'Monaco', 'Consolas', monospace; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .todo-done { text-decoration: line-through; color: #666; }
        .metadata { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>${plan.title}</h1>
    
    <div class="metadata">
        ${plan.dueDate ? `<p><strong>截止日期</strong>: ${plan.dueDate}</p>` : ''}
        ${plan.status ? `<p><strong>状态</strong>: ${plan.status}</p>` : ''}
        ${plan.priority ? `<p><strong>优先级</strong>: ${plan.priority}</p>` : ''}
    </div>`

    // 添加块内容
    if (plan.blocks && plan.blocks.length > 0) {
      plan.blocks.forEach(block => {
        html += convertBlockToHTML(block)
      })
    }

    html += `
</body>
</html>`

    return html
  }

  // 将块转换为HTML
  const convertBlockToHTML = (block) => {
    switch (block.type) {
      case 'heading':
        const level = block.content.level || 1
        return `<h${level}>${block.content.text || ''}</h${level}>`
      
      case 'text':
        return `<p>${block.content.text || ''}</p>`
      
      case 'todo':
        const checked = block.content.done ? 'checked' : ''
        const doneClass = block.content.done ? ' class="todo-done"' : ''
        return `<p><input type="checkbox" ${checked} disabled> <span${doneClass}>${block.content.text || ''}</span></p>`
      
      case 'quote':
        return `<blockquote>${block.content.text || ''}</blockquote>`
      
      case 'code':
        return `<pre><code class="language-${block.content.lang || ''}">${block.content.code || ''}</code></pre>`
      
      case 'list':
        if (block.content.items && block.content.items.length > 0) {
          const tag = block.content.listType === 'ordered' ? 'ol' : 'ul'
          const items = block.content.items.map(item => `<li>${item}</li>`).join('')
          return `<${tag}>${items}</${tag}>`
        }
        return ''
      
      case 'table':
        if (block.content.headers && block.content.rows) {
          let table = '<table><thead><tr>'
          table += block.content.headers.map(header => `<th>${header}</th>`).join('')
          table += '</tr></thead><tbody>'
          block.content.rows.forEach(row => {
            table += '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>'
          })
          table += '</tbody></table>'
          return table
        }
        return ''
      
      case 'callout':
        return `<blockquote><strong>${block.content.variant || 'info'}</strong>: ${block.content.text || ''}</blockquote>`
      
      case 'image':
        return `<img src="${block.content.url || ''}" alt="${block.content.alt || ''}" style="max-width: 100%;">`
      
      case 'video':
        return `<p><a href="${block.content.url || ''}">视频: ${block.content.title || ''}</a></p>`
      
      case 'audio':
        return `<p><a href="${block.content.url || ''}">音频: ${block.content.title || ''}</a></p>`
      
      case 'formula':
        return `<p>$$${block.content.latex || ''}$$</p>`
      
      case 'collapse':
        return `<details><summary>${block.content.title || ''}</summary><p>${block.content.text || ''}</p></details>`
      
      case 'columns':
        if (block.content.columns && block.content.columns.length > 0) {
          return `<div style="display: grid; grid-template-columns: repeat(${block.content.cols || 2}, 1fr); gap: 20px;">${block.content.columns.map(col => `<div>${col}</div>`).join('')}</div>`
        }
        return ''
      
      default:
        return `<p>${block.content.text || ''}</p>`
    }
  }

  // 下载文件
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  // 导出计划
  const exportPlan = async (plan, format = 'markdown') => {
    isExporting.value = true
    
    try {
      let content, filename, mimeType
      
      switch (format) {
        case 'markdown':
          content = exportToMarkdown(plan)
          filename = `${plan.title || '计划'}.md`
          mimeType = 'text/markdown'
          break
        case 'json':
          content = exportToJSON(plan)
          filename = `${plan.title || '计划'}.json`
          mimeType = 'application/json'
          break
        case 'html':
          content = exportToHTML(plan)
          filename = `${plan.title || '计划'}.html`
          mimeType = 'text/html'
          break
        default:
          throw new Error('不支持的导出格式')
      }
      
      downloadFile(content, filename, mimeType)
      return { success: true }
    } catch (error) {
      console.error('导出失败:', error)
      return { success: false, error: error.message }
    } finally {
      isExporting.value = false
    }
  }

  // 导入Markdown
  const importFromMarkdown = (markdown) => {
    // 简单的Markdown解析器
    const lines = markdown.split('\n')
    const blocks = []
    let currentBlock = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (!line) {
        if (currentBlock) {
          blocks.push(currentBlock)
          currentBlock = null
        }
        continue
      }
      
      // 标题
      if (line.startsWith('#')) {
        if (currentBlock) blocks.push(currentBlock)
        const level = line.match(/^#+/)[0].length
        const text = line.replace(/^#+\s*/, '')
        currentBlock = {
          id: Date.now() + i,
          type: 'heading',
          content: { text, level: Math.min(level, 6) },
          order: blocks.length + 1
        }
      }
      // 待办事项
      else if (line.match(/^[-*]\s*\[[ x]\]/)) {
        if (currentBlock) blocks.push(currentBlock)
        const done = line.includes('[x]')
        const text = line.replace(/^[-*]\s*\[[ x]\]\s*/, '')
        currentBlock = {
          id: Date.now() + i,
          type: 'todo',
          content: { text, done },
          order: blocks.length + 1
        }
      }
      // 引用
      else if (line.startsWith('>')) {
        if (currentBlock) blocks.push(currentBlock)
        const text = line.replace(/^>\s*/, '')
        currentBlock = {
          id: Date.now() + i,
          type: 'quote',
          content: { text },
          order: blocks.length + 1
        }
      }
      // 代码块
      else if (line.startsWith('```')) {
        if (currentBlock) blocks.push(currentBlock)
        const lang = line.replace(/^```/, '') || 'text'
        let code = ''
        i++
        while (i < lines.length && !lines[i].startsWith('```')) {
          code += lines[i] + '\n'
          i++
        }
        currentBlock = {
          id: Date.now() + i,
          type: 'code',
          content: { lang, code: code.trim() },
          order: blocks.length + 1
        }
      }
      // 普通文本
      else {
        if (currentBlock && currentBlock.type === 'text') {
          currentBlock.content.text += '\n' + line
        } else {
          if (currentBlock) blocks.push(currentBlock)
          currentBlock = {
            id: Date.now() + i,
            type: 'text',
            content: { text: line },
            order: blocks.length + 1
          }
        }
      }
    }
    
    if (currentBlock) {
      blocks.push(currentBlock)
    }
    
    return blocks
  }

  // 导入JSON
  const importFromJSON = (json) => {
    try {
      const data = JSON.parse(json)
      return data.blocks || []
    } catch (error) {
      throw new Error('无效的JSON格式')
    }
  }

  // 导入计划
  const importPlan = async (file, format = 'auto') => {
    isImporting.value = true
    
    try {
      const content = await file.text()
      let blocks = []
      
      if (format === 'auto') {
        // 自动检测格式
        if (file.name.endsWith('.json')) {
          blocks = importFromJSON(content)
        } else if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
          blocks = importFromMarkdown(content)
        } else {
          throw new Error('不支持的文件格式')
        }
      } else {
        switch (format) {
          case 'markdown':
            blocks = importFromMarkdown(content)
            break
          case 'json':
            blocks = importFromJSON(content)
            break
          default:
            throw new Error('不支持的导入格式')
        }
      }
      
      return { success: true, blocks }
    } catch (error) {
      console.error('导入失败:', error)
      return { success: false, error: error.message }
    } finally {
      isImporting.value = false
    }
  }

  return {
    isExporting,
    isImporting,
    exportPlan,
    importPlan,
    exportToMarkdown,
    exportToJSON,
    exportToHTML
  }
}
