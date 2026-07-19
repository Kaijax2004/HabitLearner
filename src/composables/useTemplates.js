import { ref, computed } from 'vue'

export function useTemplates() {
  const templates = ref([
    {
      id: 'meeting-notes',
      name: '会议记录',
      description: '标准会议记录模板',
      category: '工作',
      blocks: [
        {
          id: 1,
          type: 'heading',
          content: { text: '会议信息', level: 1 },
          order: 1
        },
        {
          id: 2,
          type: 'text',
          content: { text: '会议主题：' },
          order: 2
        },
        {
          id: 3,
          type: 'text',
          content: { text: '会议时间：' },
          order: 3
        },
        {
          id: 4,
          type: 'text',
          content: { text: '参会人员：' },
          order: 4
        },
        {
          id: 5,
          type: 'heading',
          content: { text: '会议议程', level: 2 },
          order: 5
        },
        {
          id: 6,
          type: 'list',
          content: { 
            listType: 'ordered', 
            items: ['议程项目 1', '议程项目 2', '议程项目 3'] 
          },
          order: 6
        },
        {
          id: 7,
          type: 'heading',
          content: { text: '讨论要点', level: 2 },
          order: 7
        },
        {
          id: 8,
          type: 'text',
          content: { text: '' },
          order: 8
        },
        {
          id: 9,
          type: 'heading',
          content: { text: '行动项', level: 2 },
          order: 9
        },
        {
          id: 10,
          type: 'todo',
          content: { text: '行动项 1', done: false },
          order: 10
        },
        {
          id: 11,
          type: 'todo',
          content: { text: '行动项 2', done: false },
          order: 11
        }
      ]
    },
    {
      id: 'project-plan',
      name: '项目计划',
      description: '项目管理计划模板',
      category: '工作',
      blocks: [
        {
          id: 1,
          type: 'heading',
          content: { text: '项目概述', level: 1 },
          order: 1
        },
        {
          id: 2,
          type: 'text',
          content: { text: '项目名称：' },
          order: 2
        },
        {
          id: 3,
          type: 'text',
          content: { text: '项目目标：' },
          order: 3
        },
        {
          id: 4,
          type: 'text',
          content: { text: '项目范围：' },
          order: 4
        },
        {
          id: 5,
          type: 'heading',
          content: { text: '项目时间线', level: 2 },
          order: 5
        },
        {
          id: 6,
          type: 'table',
          content: { 
            headers: ['阶段', '开始时间', '结束时间', '负责人', '状态'],
            rows: [
              ['需求分析', '', '', '', ''],
              ['设计阶段', '', '', '', ''],
              ['开发阶段', '', '', '', ''],
              ['测试阶段', '', '', '', ''],
              ['上线部署', '', '', '', '']
            ]
          },
          order: 6
        },
        {
          id: 7,
          type: 'heading',
          content: { text: '项目任务', level: 2 },
          order: 7
        },
        {
          id: 8,
          type: 'todo',
          content: { text: '任务 1', done: false },
          order: 8
        },
        {
          id: 9,
          type: 'todo',
          content: { text: '任务 2', done: false },
          order: 9
        },
        {
          id: 10,
          type: 'todo',
          content: { text: '任务 3', done: false },
          order: 10
        }
      ]
    },
    {
      id: 'daily-standup',
      name: '每日站会',
      description: '敏捷开发每日站会模板',
      category: '工作',
      blocks: [
        {
          id: 1,
          type: 'heading',
          content: { text: '每日站会', level: 1 },
          order: 1
        },
        {
          id: 2,
          type: 'text',
          content: { text: '日期：' },
          order: 2
        },
        {
          id: 3,
          type: 'text',
          content: { text: '参与者：' },
          order: 3
        },
        {
          id: 4,
          type: 'heading',
          content: { text: '昨日完成', level: 2 },
          order: 4
        },
        {
          id: 5,
          type: 'list',
          content: { 
            listType: 'unordered', 
            items: ['完成项目 1', '完成项目 2'] 
          },
          order: 5
        },
        {
          id: 6,
          type: 'heading',
          content: { text: '今日计划', level: 2 },
          order: 6
        },
        {
          id: 7,
          type: 'todo',
          content: { text: '计划任务 1', done: false },
          order: 7
        },
        {
          id: 8,
          type: 'todo',
          content: { text: '计划任务 2', done: false },
          order: 8
        },
        {
          id: 9,
          type: 'heading',
          content: { text: '阻碍问题', level: 2 },
          order: 9
        },
        {
          id: 10,
          type: 'text',
          content: { text: '' },
          order: 10
        }
      ]
    },
    {
      id: 'learning-plan',
      name: '学习计划',
      description: '个人学习计划模板',
      category: '学习',
      blocks: [
        {
          id: 1,
          type: 'heading',
          content: { text: '学习目标', level: 1 },
          order: 1
        },
        {
          id: 2,
          type: 'text',
          content: { text: '学习主题：' },
          order: 2
        },
        {
          id: 3,
          type: 'text',
          content: { text: '学习目标：' },
          order: 3
        },
        {
          id: 4,
          type: 'text',
          content: { text: '预期完成时间：' },
          order: 4
        },
        {
          id: 5,
          type: 'heading',
          content: { text: '学习资源', level: 2 },
          order: 5
        },
        {
          id: 6,
          type: 'list',
          content: { 
            listType: 'unordered', 
            items: ['资源 1', '资源 2', '资源 3'] 
          },
          order: 6
        },
        {
          id: 7,
          type: 'heading',
          content: { text: '学习计划', level: 2 },
          order: 7
        },
        {
          id: 8,
          type: 'todo',
          content: { text: '第1周：基础学习', done: false },
          order: 8
        },
        {
          id: 9,
          type: 'todo',
          content: { text: '第2周：实践练习', done: false },
          order: 9
        },
        {
          id: 10,
          type: 'todo',
          content: { text: '第3周：项目实战', done: false },
          order: 10
        },
        {
          id: 11,
          type: 'heading',
          content: { text: '学习笔记', level: 2 },
          order: 11
        },
        {
          id: 12,
          type: 'text',
          content: { text: '' },
          order: 12
        }
      ]
    },
    {
      id: 'book-review',
      name: '读书笔记',
      description: '读书笔记和书评模板',
      category: '学习',
      blocks: [
        {
          id: 1,
          type: 'heading',
          content: { text: '书籍信息', level: 1 },
          order: 1
        },
        {
          id: 2,
          type: 'text',
          content: { text: '书名：' },
          order: 2
        },
        {
          id: 3,
          type: 'text',
          content: { text: '作者：' },
          order: 3
        },
        {
          id: 4,
          type: 'text',
          content: { text: '阅读时间：' },
          order: 4
        },
        {
          id: 5,
          type: 'text',
          content: { text: '评分：⭐⭐⭐⭐⭐' },
          order: 5
        },
        {
          id: 6,
          type: 'heading',
          content: { text: '核心观点', level: 2 },
          order: 6
        },
        {
          id: 7,
          type: 'text',
          content: { text: '' },
          order: 7
        },
        {
          id: 8,
          type: 'heading',
          content: { text: '重要摘录', level: 2 },
          order: 8
        },
        {
          id: 9,
          type: 'quote',
          content: { text: '重要引用内容...' },
          order: 9
        },
        {
          id: 10,
          type: 'heading',
          content: { text: '个人思考', level: 2 },
          order: 10
        },
        {
          id: 11,
          type: 'text',
          content: { text: '' },
          order: 11
        },
        {
          id: 12,
          type: 'heading',
          content: { text: '行动计划', level: 2 },
          order: 12
        },
        {
          id: 13,
          type: 'todo',
          content: { text: '行动项 1', done: false },
          order: 13
        },
        {
          id: 14,
          type: 'todo',
          content: { text: '行动项 2', done: false },
          order: 14
        }
      ]
    }
  ])

  // 按分类分组的模板
  const templatesByCategory = computed(() => {
    const grouped = {}
    templates.value.forEach(template => {
      if (!grouped[template.category]) {
        grouped[template.category] = []
      }
      grouped[template.category].push(template)
    })
    return grouped
  })

  // 获取所有分类
  const categories = computed(() => {
    return [...new Set(templates.value.map(t => t.category))]
  })

  // 根据ID获取模板
  const getTemplateById = (id) => {
    return templates.value.find(t => t.id === id)
  }

  // 应用模板到计划
  const applyTemplate = (templateId, planData = {}) => {
    const template = getTemplateById(templateId)
    if (!template) return null

    // 创建新的块ID，避免冲突
    const newBlocks = template.blocks.map(block => ({
      ...block,
      id: Date.now() + Math.random(),
      content: JSON.parse(JSON.stringify(block.content)) // 深拷贝
    }))

    return {
      title: planData.title || template.name,
      dueDate: planData.dueDate || '',
      status: planData.status || 'not_started',
      priority: planData.priority || 'medium',
      planType: planData.planType || 'project',
      blocks: newBlocks
    }
  }

  // 保存自定义模板
  const saveCustomTemplate = (templateData) => {
    const newTemplate = {
      id: `custom-${Date.now()}`,
      name: templateData.name,
      description: templateData.description || '',
      category: templateData.category || '自定义',
      blocks: templateData.blocks.map((block, index) => ({
        ...block,
        id: index + 1,
        order: index + 1
      }))
    }
    
    templates.value.push(newTemplate)
    return newTemplate
  }

  // 删除自定义模板
  const deleteCustomTemplate = (templateId) => {
    const index = templates.value.findIndex(t => t.id === templateId)
    if (index !== -1 && templateId.startsWith('custom-')) {
      templates.value.splice(index, 1)
      return true
    }
    return false
  }

  return {
    templates,
    templatesByCategory,
    categories,
    getTemplateById,
    applyTemplate,
    saveCustomTemplate,
    deleteCustomTemplate
  }
}
