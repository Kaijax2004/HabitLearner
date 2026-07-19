import { ref } from 'vue'

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\"/g, '&quot;')
  .replace(/'/g, '&#39;')

const stripHtml = (value = '') => String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
const safeFileName = (value = '计划') => String(value || '计划').replace(/[\\/:*?"<>|]+/g, '-').trim() || '计划'
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const normalizeBlock = (block = {}, index = 0) => ({
  id: block.id || `import-${generateId()}`,
  type: block.type || 'text',
  order: block.order || index + 1,
  content: block.content || { text: '' }
})

const getBlockPlainText = (block = {}) => {
  const content = block.content || {}
  switch (block.type) {
    case 'heading':
    case 'text':
    case 'quote':
      return content.text || ''
    case 'todo':
      return content.text || ''
    case 'page':
      return [content.title, content.summary].filter(Boolean).join(' ')
    case 'toggle':
    case 'collapse':
      return [content.title, content.text].filter(Boolean).join(' ')
    case 'link_page':
      return [content.pageTitle, content.note].filter(Boolean).join(' ')
    case 'code':
      return content.code || ''
    case 'list':
      return Array.isArray(content.items) ? content.items.join(' | ') : ''
    case 'table': {
      const headers = Array.isArray(content.headers) ? content.headers.join(' | ') : ''
      const rows = Array.isArray(content.rows) ? content.rows.map((row) => row.join(' | ')).join(' || ') : ''
      return [headers, rows].filter(Boolean).join(' || ')
    }
    case 'image':
      return [content.alt, content.url].filter(Boolean).join(' ')
    case 'video':
    case 'audio':
    case 'file':
      return [content.title || content.name, content.url, content.caption].filter(Boolean).join(' ')
    case 'bookmark':
      return [content.title, content.description, content.url].filter(Boolean).join(' ')
    case 'callout':
      return content.text || ''
    case 'database':
      return Array.isArray(content.rows) ? content.rows.map((row) => row.title || '').join(' | ') : ''
    case 'toc':
      return content.title || '目录'
    case 'button':
      return [content.label, content.url].filter(Boolean).join(' ')
    case 'breadcrumb':
      return [content.rootLabel, content.currentLabel].filter(Boolean).join(' / ')
    case 'equation':
    case 'formula':
      return content.latex || ''
    case 'template_button':
      return [content.label, content.template].filter(Boolean).join(' ')
    case 'synced_block':
      return content.text || ''
    case 'embed':
      return [content.title, content.url, content.variant].filter(Boolean).join(' ')
    case 'columns':
      return Array.isArray(content.columns) ? content.columns.join(' | ') : ''
    case 'collapse':
      return [content.title, content.text].filter(Boolean).join(' | ')
    case 'formula':
      return content.latex || ''
    default:
      return content.text || ''
  }
}

const blockToMarkdown = (block = {}) => {
  const content = block.content || {}
  switch (block.type) {
    case 'heading':
      return `${'#'.repeat(Math.min(Math.max(content.level || 1, 1), 6))} ${content.text || ''}`.trim()
    case 'text':
      return content.text || ''
    case 'page':
      return `## ${content.title || 'Page'}\n${content.summary || ''}`.trim()
    case 'todo':
      return `${content.done ? '- [x]' : '- [ ]'} ${content.text || ''}`.trim()
    case 'toggle':
    case 'collapse':
      return `<details>\n<summary>${content.title || 'Toggle'}</summary>\n\n${content.text || ''}\n</details>`
    case 'quote':
      return `> ${content.text || ''}`.trim()
    case 'code':
      return `\`\`\`${content.lang || 'text'}\n${content.code || ''}\n\`\`\``
    case 'list':
      return (content.items || []).map((item, index) => content.listType === 'ordered' ? `${index + 1}. ${item}` : `- ${item}`).join('\n')
    case 'table': {
      const headers = content.headers || []
      const rows = content.rows || []
      if (!headers.length) return ''
      const head = `| ${headers.join(' | ')} |`
      const divider = `| ${headers.map(() => '---').join(' | ')} |`
      const body = rows.map((row) => `| ${row.join(' | ')} |`).join('\n')
      return [head, divider, body].filter(Boolean).join('\n')
    }
    case 'image':
      return `![${content.alt || ''}](${content.url || ''})`
    case 'video':
      return `[Video: ${content.title || '视频'}](${content.url || ''})`
    case 'audio':
      return `[Audio: ${content.title || '音频'}](${content.url || ''})`
    case 'file':
      return `[File: ${content.name || '文件'}](${content.url || ''})`
    case 'bookmark':
      return `[${content.title || content.url || 'Bookmark'}](${content.url || ''})`
    case 'link_page':
      return `[[${content.pageTitle || '页面链接'}]]`
    case 'divider':
      return '---'
    case 'callout':
      return `> [!${String(content.variant || 'info').toUpperCase()}] ${content.text || ''}`.trim()
    case 'database': {
      const rows = Array.isArray(content.rows) ? content.rows : []
      const header = '| 名称 | 状态 | 日期 | 备注 |'
      const divider = '| --- | --- | --- | --- |'
      const body = rows.map((row) => `| ${row.title || ''} | ${row.status || ''} | ${row.date || ''} | ${row.note || ''} |`).join('\n')
      return [`## ${content.title || '数据库'} (${content.viewType || 'table'})`, header, divider, body].filter(Boolean).join('\n')
    }
    case 'toc':
      return '[TOC]'
    case 'button':
      return `[${content.label || '按钮'}](${content.url || ''})`
    case 'breadcrumb':
      return `${content.rootLabel || '主页'} / ${content.currentLabel || ''}`.trim()
    case 'equation':
    case 'formula':
      return `$$${content.latex || ''}$$`
    case 'template_button':
      return `> [!TEMPLATE] ${content.label || '插入模板'} (${content.template || 'default'})`
    case 'synced_block':
      return content.text || ''
    case 'embed':
      return `[${content.title || content.variant || 'Embed'}](${content.url || ''})`
    case 'formula':
      return `$$${content.latex || ''}$$`
    case 'collapse':
      return `<details>\n<summary>${content.title || ''}</summary>\n\n${content.text || ''}\n</details>`
    case 'columns':
      return (content.columns || []).join('\n\n---\n\n')
    default:
      return getBlockPlainText(block)
  }
}

const blockToHtml = (block = {}) => {
  const content = block.content || {}
  switch (block.type) {
    case 'heading':
      return `<h${Math.min(Math.max(content.level || 1, 1), 6)}>${escapeHtml(content.text || '')}</h${Math.min(Math.max(content.level || 1, 1), 6)}>`
    case 'text':
      return `<p>${escapeHtml(content.text || '').replace(/\n/g, '<br>')}</p>`
    case 'page':
      return `<section data-block="page"><h2>${escapeHtml(content.title || 'Page')}</h2><p>${escapeHtml(content.summary || '').replace(/\n/g, '<br>')}</p></section>`
    case 'todo':
      return `<p><input type="checkbox" disabled ${content.done ? 'checked' : ''}> ${escapeHtml(content.text || '')}</p>`
    case 'toggle':
    case 'collapse':
      return `<details><summary>${escapeHtml(content.title || 'Toggle')}</summary><p>${escapeHtml(content.text || '').replace(/\n/g, '<br>')}</p></details>`
    case 'quote':
      return `<blockquote>${escapeHtml(content.text || '').replace(/\n/g, '<br>')}</blockquote>`
    case 'code':
      return `<pre><code class="language-${escapeHtml(content.lang || 'text')}">${escapeHtml(content.code || '')}</code></pre>`
    case 'list': {
      const tag = content.listType === 'ordered' ? 'ol' : 'ul'
      return `<${tag}>${(content.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`
    }
    case 'table': {
      const headers = content.headers || []
      const rows = content.rows || []
      return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    }
    case 'image':
      return `<figure><img src="${escapeHtml(content.url || '')}" alt="${escapeHtml(content.alt || '')}" />${content.alt ? `<figcaption>${escapeHtml(content.alt)}</figcaption>` : ''}</figure>`
    case 'video':
      return `<video controls src="${escapeHtml(content.url || '')}"></video>`
    case 'audio':
      return `<audio controls src="${escapeHtml(content.url || '')}"></audio>`
    case 'file':
      return `<p><a href="${escapeHtml(content.url || '')}">${escapeHtml(content.name || '文件')}</a></p>`
    case 'bookmark':
      return `<article><h3>${escapeHtml(content.title || 'Bookmark')}</h3><p>${escapeHtml(content.description || '')}</p><a href="${escapeHtml(content.url || '')}">${escapeHtml(content.url || '')}</a></article>`
    case 'link_page':
      return `<p data-link-page="true">${escapeHtml(content.pageTitle || '页面链接')}</p>`
    case 'divider':
      return '<hr />'
    case 'callout':
      return `<aside data-variant="${escapeHtml(content.variant || 'info')}"><strong>${escapeHtml(String(content.variant || 'info').toUpperCase())}</strong> ${escapeHtml(content.text || '')}</aside>`
    case 'database': {
      const rows = Array.isArray(content.rows) ? content.rows : []
      return `<section data-database-view="${escapeHtml(content.viewType || 'table')}"><h2>${escapeHtml(content.title || '数据库')}</h2><table><thead><tr><th>名称</th><th>状态</th><th>日期</th><th>备注</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${escapeHtml(row.title || '')}</td><td>${escapeHtml(row.status || '')}</td><td>${escapeHtml(row.date || '')}</td><td>${escapeHtml(row.note || '')}</td></tr>`).join('')}</tbody></table></section>`
    }
    case 'toc':
      return '<nav data-toc="true">目录</nav>'
    case 'button':
      return `<p><a href="${escapeHtml(content.url || '#')}" data-button-style="${escapeHtml(content.style || 'primary')}">${escapeHtml(content.label || '按钮')}</a></p>`
    case 'breadcrumb':
      return `<nav data-breadcrumb="true">${escapeHtml(content.rootLabel || '主页')} / ${escapeHtml(content.currentLabel || '')}</nav>`
    case 'equation':
    case 'formula':
      return `<p data-formula="true">${escapeHtml(content.latex || '')}</p>`
    case 'template_button':
      return `<p data-template="${escapeHtml(content.template || 'default')}">${escapeHtml(content.label || '插入模板')}</p>`
    case 'synced_block':
      return `<section data-synced-block="${escapeHtml(content.syncKey || '')}">${escapeHtml(content.text || '')}</section>`
    case 'embed':
      return `<iframe src="${escapeHtml(content.url || '')}" title="${escapeHtml(content.title || content.variant || 'Embed')}"></iframe>`
    case 'formula':
      return `<p data-formula="true">${escapeHtml(content.latex || '')}</p>`
    case 'collapse':
      return `<details><summary>${escapeHtml(content.title || '')}</summary><p>${escapeHtml(content.text || '').replace(/\n/g, '<br>')}</p></details>`
    case 'columns':
      return `<section data-columns="${content.cols || 2}">${(content.columns || []).map((column) => `<div>${escapeHtml(column).replace(/\n/g, '<br>')}</div>`).join('')}</section>`
    default:
      return `<p>${escapeHtml(getBlockPlainText(block))}</p>`
  }
}

const blockToCsvRow = (block = {}, index = 0) => {
  const content = block.content || {}
  return {
    order: block.order || index + 1,
    type: block.type || 'text',
    summary: getBlockPlainText(block),
    content: JSON.stringify(content)
  }
}

const downloadFile = (content, filename, mimeType, withBom = false) => {
  const payload = withBom ? ['\ufeff', content] : [content]
  const blob = new Blob(payload, { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const parseCsvLine = (line = '') => {
  const values = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }
    current += char
  }
  values.push(current)
  return values.map((item) => item.trim())
}

const exportPlanToMarkdown = (plan) => {
  const parts = [`# ${plan.title || '无标题'}`]
  if (plan.dueDate) parts.push(`**截止日期**: ${plan.dueDate}`)
  if (plan.status) parts.push(`**状态**: ${plan.status}`)
  if (plan.priority) parts.push(`**优先级**: ${plan.priority}`)
  if (plan.planType) parts.push(`**类型**: ${plan.planType}`)
  if (plan.planType === 'custom' && plan.customTypeName) parts.push(`**自定义类型**: ${plan.customTypeName}`)
  parts.push('---')
  ;(plan.blocks || []).forEach((block) => {
    const rendered = blockToMarkdown(block)
    if (rendered) parts.push(rendered)
  })
  return parts.join('\n\n')
}

const exportPlanToHtml = (plan) => {
  const metadata = [
    plan.dueDate ? `<li><strong>截止日期:</strong> ${escapeHtml(plan.dueDate)}</li>` : '',
    plan.status ? `<li><strong>状态:</strong> ${escapeHtml(plan.status)}</li>` : '',
    plan.priority ? `<li><strong>优先级:</strong> ${escapeHtml(plan.priority)}</li>` : '',
    plan.planType ? `<li><strong>类型:</strong> ${escapeHtml(plan.planType)}</li>` : '',
    plan.planType === 'custom' && plan.customTypeName ? `<li><strong>自定义类型:</strong> ${escapeHtml(plan.customTypeName)}</li>` : ''
  ].filter(Boolean).join('')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(plan.title || '无标题')}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 860px; margin: 0 auto; padding: 40px 24px; line-height: 1.7; color: #18181b; }
    h1, h2, h3, h4, h5, h6 { line-height: 1.25; }
    pre { padding: 16px; border-radius: 12px; background: #09090b; color: #fafafa; overflow: auto; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #d4d4d8; padding: 10px 12px; text-align: left; }
    blockquote, aside { margin: 20px 0; padding: 12px 16px; border-left: 4px solid #a1a1aa; background: #f4f4f5; border-radius: 10px; }
    figure { margin: 24px 0; }
    figure img { max-width: 100%; border-radius: 14px; }
    figcaption { margin-top: 8px; color: #52525b; font-size: 14px; }
    .meta { margin: 0 0 24px; padding: 16px; border-radius: 14px; background: #fafafa; border: 1px solid #e4e4e7; }
  </style>
</head>
<body>
  <h1>${escapeHtml(plan.title || '无标题')}</h1>
  ${metadata ? `<ul class="meta">${metadata}</ul>` : ''}
  ${(plan.blocks || []).map((block) => blockToHtml(block)).join('\n')}
</body>
</html>`
}

const exportPlanToJson = (plan) => JSON.stringify({
  version: 1,
  exportedAt: new Date().toISOString(),
  title: plan.title || '无标题',
  dueDate: plan.dueDate || null,
  status: plan.status || 'not_started',
  priority: plan.priority || 'medium',
  planType: plan.planType || 'project',
  customTypeName: plan.customTypeName || '',
  blocks: (plan.blocks || []).map((block, index) => normalizeBlock(block, index))
}, null, 2)

const exportPlanToCsv = (plan) => {
  const headers = ['order', 'type', 'summary', 'content']
  const rows = (plan.blocks || []).map((block, index) => blockToCsvRow(block, index))
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => `"${String(row[key] || '').replace(/"/g, '""')}"`).join(','))
  ].join('\n')
}

const htmlNodeToBlocks = (node, blocks) => {
  if (!node || node.nodeType !== 1) return
  const tag = node.tagName.toLowerCase()
  const text = stripHtml(node.innerHTML)

  if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
    blocks.push({ type: 'heading', content: { text, level: Number(tag[1]) } })
    return
  }
  if (tag === 'p') {
    const img = node.querySelector('img')
    if (img && !text) {
      blocks.push({ type: 'image', content: { url: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '', displayStyle: 'full-width' } })
      return
    }
    blocks.push({ type: 'text', content: { text: node.textContent || '' } })
    return
  }
  if (tag === 'blockquote') {
    blocks.push({ type: 'quote', content: { text: node.textContent || '' } })
    return
  }
  if (tag === 'pre') {
    const code = node.querySelector('code')
    const className = code?.className || ''
    const match = className.match(/language-([\w-]+)/)
    blocks.push({ type: 'code', content: { lang: match?.[1] || 'text', code: code?.textContent || node.textContent || '' } })
    return
  }
  if (tag === 'ul' || tag === 'ol') {
    blocks.push({ type: 'list', content: { listType: tag === 'ol' ? 'ordered' : 'unordered', items: Array.from(node.querySelectorAll(':scope > li')).map((li) => li.textContent || '') } })
    return
  }
  if (tag === 'table') {
    const headers = Array.from(node.querySelectorAll('thead th')).map((th) => th.textContent || '')
    const bodyRows = Array.from(node.querySelectorAll('tbody tr')).map((tr) => Array.from(tr.querySelectorAll('td')).map((td) => td.textContent || ''))
    if (headers.length || bodyRows.length) {
      blocks.push({ type: 'table', content: { headers: headers.length ? headers : (bodyRows[0] || []).map((_, index) => `列 ${index + 1}`), rows: headers.length ? bodyRows : bodyRows.slice(1) } })
    }
    return
  }
  if (tag === 'img') {
    blocks.push({ type: 'image', content: { url: node.getAttribute('src') || '', alt: node.getAttribute('alt') || '', displayStyle: 'full-width' } })
    return
  }
  if (tag === 'details') {
    blocks.push({ type: 'collapse', content: { title: node.querySelector('summary')?.textContent || '', text: stripHtml(node.innerHTML.replace(/<summary[^>]*>.*?<\/summary>/i, '')), open: node.hasAttribute('open') } })
    return
  }
  if (tag === 'aside') {
    blocks.push({ type: 'callout', content: { variant: node.getAttribute('data-variant') || 'info', text: node.textContent || '' } })
    return
  }

  const directChildren = Array.from(node.children)
  if (!directChildren.length && text) {
    blocks.push({ type: 'text', content: { text } })
    return
  }
  directChildren.forEach((child) => htmlNodeToBlocks(child, blocks))
}

export function useImportExport() {
  const isExporting = ref(false)
  const isImporting = ref(false)

  const exportPlan = async (plan, format = 'markdown') => {
    isExporting.value = true
    try {
      const fileBase = safeFileName(plan.title || '计划')
      switch (format) {
        case 'markdown':
          downloadFile(exportPlanToMarkdown(plan), `${fileBase}.md`, 'text/markdown;charset=utf-8')
          break
        case 'html':
          downloadFile(exportPlanToHtml(plan), `${fileBase}.html`, 'text/html;charset=utf-8')
          break
        case 'json':
          downloadFile(exportPlanToJson(plan), `${fileBase}.json`, 'application/json;charset=utf-8')
          break
        case 'csv':
          downloadFile(exportPlanToCsv(plan), `${fileBase}.csv`, 'text/csv;charset=utf-8', true)
          break
        default:
          throw new Error('不支持的导出格式')
      }
      return { success: true }
    } catch (error) {
      console.error('导出失败:', error)
      return { success: false, error: error.message }
    } finally {
      isExporting.value = false
    }
  }

  const exportWorkspaceBackup = async (workspace, fileName = 'habit-learner-workspace-backup') => {
    isExporting.value = true
    try {
      const payload = JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        source: 'HabitLearner',
        workspace
      }, null, 2)
      downloadFile(payload, `${safeFileName(fileName)}.json`, 'application/json;charset=utf-8')
      return { success: true }
    } catch (error) {
      console.error('工作区导出失败:', error)
      return { success: false, error: error.message }
    } finally {
      isExporting.value = false
    }
  }

  const importFromMarkdown = (markdown) => {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n')
    const meta = { title: '', dueDate: '', status: '', priority: '', planType: '', customTypeName: '' }
    const blocks = []
    let index = 0

    while (index < lines.length) {
      const rawLine = lines[index]
      const line = rawLine.trim()
      if (!line) {
        index += 1
        continue
      }

      if (!meta.title && /^#\s+/.test(line)) {
        meta.title = line.replace(/^#\s+/, '').trim()
        index += 1
        continue
      }

      const metaMatch = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/)
      if (metaMatch) {
        const label = metaMatch[1]
        const value = metaMatch[2]
        if (label.includes('截止日期')) meta.dueDate = value
        if (label.includes('状态')) meta.status = value
        if (label.includes('优先级')) meta.priority = value
        if (label.includes('自定义类型')) {
          meta.planType = 'custom'
          meta.customTypeName = value
        } else if (label.includes('类型')) {
          meta.planType = value
        }
        index += 1
        continue
      }

      if (line === '---') {
        index += 1
        continue
      }

      if (/^```/.test(line)) {
        const lang = line.replace(/^```/, '').trim() || 'text'
        index += 1
        const codeLines = []
        while (index < lines.length && !/^```/.test(lines[index].trim())) {
          codeLines.push(lines[index])
          index += 1
        }
        blocks.push({ type: 'code', content: { lang, code: codeLines.join('\n').trimEnd() } })
        index += 1
        continue
      }

      if (/^\|(.+)\|$/.test(line) && /^\|(?:\s*:?-+:?\s*\|)+$/.test((lines[index + 1] || '').trim())) {
        const headers = line.split('|').slice(1, -1).map((item) => item.trim())
        index += 2
        const rows = []
        while (index < lines.length && /^\|(.+)\|$/.test(lines[index].trim())) {
          rows.push(lines[index].trim().split('|').slice(1, -1).map((item) => item.trim()))
          index += 1
        }
        blocks.push({ type: 'table', content: { headers, rows } })
        continue
      }

      if (/^([-*])\s+\[[ xX]\]\s+/.test(line)) {
        blocks.push({ type: 'todo', content: { done: /\[[xX]\]/.test(line), text: line.replace(/^([-*])\s+\[[ xX]\]\s+/, '') } })
        index += 1
        continue
      }

      if (/^\d+\.\s+/.test(line) || /^[-*]\s+/.test(line)) {
        const ordered = /^\d+\.\s+/.test(line)
        const items = []
        while (index < lines.length) {
          const candidate = lines[index].trim()
          if (ordered && /^\d+\.\s+/.test(candidate)) {
            items.push(candidate.replace(/^\d+\.\s+/, ''))
            index += 1
            continue
          }
          if (!ordered && /^[-*]\s+/.test(candidate) && !/^[-*]\s+\[[ xX]\]\s+/.test(candidate)) {
            items.push(candidate.replace(/^[-*]\s+/, ''))
            index += 1
            continue
          }
          break
        }
        blocks.push({ type: 'list', content: { listType: ordered ? 'ordered' : 'unordered', items } })
        continue
      }

      if (/^!\[[^\]]*\]\([^)]+\)$/.test(line)) {
        const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
        blocks.push({ type: 'image', content: { alt: match?.[1] || '', url: match?.[2] || '', displayStyle: 'full-width' } })
        index += 1
        continue
      }

      if (/^>\s+\[![A-Z]+\]/.test(line)) {
        const match = line.match(/^>\s+\[!([A-Z]+)\]\s*(.*)$/)
        blocks.push({ type: 'callout', content: { variant: (match?.[1] || 'INFO').toLowerCase(), text: match?.[2] || '' } })
        index += 1
        continue
      }

      if (/^>\s+/.test(line)) {
        blocks.push({ type: 'quote', content: { text: line.replace(/^>\s+/, '') } })
        index += 1
        continue
      }

      if (/^#{1,6}\s+/.test(line)) {
        const level = line.match(/^#+/)[0].length
        blocks.push({ type: 'heading', content: { text: line.replace(/^#{1,6}\s+/, ''), level } })
        index += 1
        continue
      }

      const paragraph = [rawLine]
      index += 1
      while (index < lines.length && lines[index].trim() && !/^#{1,6}\s+/.test(lines[index].trim()) && !/^```/.test(lines[index].trim()) && !/^>\s+/.test(lines[index].trim()) && !/^\|(.+)\|$/.test(lines[index].trim()) && !/^\d+\.\s+/.test(lines[index].trim()) && !/^[-*]\s+/.test(lines[index].trim())) {
        paragraph.push(lines[index])
        index += 1
      }
      blocks.push({ type: 'text', content: { text: paragraph.join('\n').trim() } })
    }

    return { ...meta, blocks: blocks.map(normalizeBlock) }
  }

  const importFromHtml = (htmlText) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlText, 'text/html')
    const title = doc.querySelector('h1')?.textContent?.trim() || doc.title || '导入的页面'
    const blocks = []
    Array.from(doc.body.children).forEach((node) => {
      if (node.tagName.toLowerCase() === 'h1' && node.textContent?.trim() === title) return
      htmlNodeToBlocks(node, blocks)
    })
    return { title, blocks: blocks.map(normalizeBlock) }
  }

  const importFromCsv = (csvText, fileName = 'CSV 导入') => {
    const lines = String(csvText || '').replace(/\r\n/g, '\n').split('\n').filter((line) => line.trim())
    if (!lines.length) {
      return { title: fileName, blocks: [] }
    }
    const rows = lines.map(parseCsvLine)
    const headers = rows[0]
    const bodyRows = rows.slice(1)
    return {
      title: fileName,
      blocks: [normalizeBlock({
        type: 'table',
        content: {
          headers,
          rows: bodyRows.length ? bodyRows : [new Array(headers.length).fill('')]
        }
      })]
    }
  }

  const importFromJson = (jsonText) => {
    const data = JSON.parse(jsonText)
    if (Array.isArray(data)) {
      return { title: 'JSON 导入', blocks: data.map(normalizeBlock) }
    }
    if (Array.isArray(data.blocks)) {
      return {
        title: data.title || data.name || 'JSON 导入',
        dueDate: data.dueDate || data.due_date || '',
        status: data.status || '',
        priority: data.priority || '',
        planType: data.planType || data.type || '',
        customTypeName: data.customTypeName || data.custom_type_name || '',
        blocks: data.blocks.map(normalizeBlock)
      }
    }
    if (data.workspace?.plans?.length) {
      const firstPlan = data.workspace.plans[0]
      return {
        title: firstPlan.title || '工作区导入',
        dueDate: firstPlan.dueDate || firstPlan.due_date || '',
        status: firstPlan.status || '',
        priority: firstPlan.priority || '',
        planType: firstPlan.planType || firstPlan.type || '',
        customTypeName: firstPlan.customTypeName || firstPlan.custom_type_name || '',
        blocks: (firstPlan.blocks || []).map(normalizeBlock)
      }
    }
    throw new Error('无法识别的 JSON 结构')
  }

  const importPlan = async (file, format = 'auto') => {
    isImporting.value = true
    try {
      const text = await file.text()
      let parsed
      const lowerName = file.name.toLowerCase()
      const guessedFormat = format === 'auto'
        ? (lowerName.endsWith('.json') ? 'json' : lowerName.endsWith('.md') || lowerName.endsWith('.markdown') ? 'markdown' : lowerName.endsWith('.html') || lowerName.endsWith('.htm') ? 'html' : lowerName.endsWith('.csv') ? 'csv' : 'unknown')
        : format

      switch (guessedFormat) {
        case 'json':
          parsed = importFromJson(text)
          break
        case 'markdown':
          parsed = importFromMarkdown(text)
          break
        case 'html':
          parsed = importFromHtml(text)
          break
        case 'csv':
          parsed = importFromCsv(text, file.name.replace(/\.[^.]+$/, ''))
          break
        default:
          throw new Error('不支持的导入格式')
      }

      return {
        success: true,
        title: parsed.title || file.name.replace(/\.[^.]+$/, ''),
        dueDate: parsed.dueDate || '',
        status: parsed.status || '',
        priority: parsed.priority || '',
        planType: parsed.planType || '',
        customTypeName: parsed.customTypeName || '',
        blocks: (parsed.blocks || []).map(normalizeBlock)
      }
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
    exportWorkspaceBackup,
    importPlan,
    exportPlanToMarkdown,
    exportPlanToHtml,
    exportPlanToJson,
    exportPlanToCsv
  }
}
