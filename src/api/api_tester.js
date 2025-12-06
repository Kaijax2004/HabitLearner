// API接口测试工具
// 用于验证API连接和mock数据回退机制

import api from './index.js'
import { 
  getStatsOverview, 
  getHabitHistory, 
  getMonthlyReport 
} from './stats.js'
import { 
  getCategories, 
  getIcons 
} from './categories.js'

// 测试结果对象
const testResults = {
  passed: 0,
  failed: 0,
  results: []
}

// 单个API测试函数
const testAPI = async (name, testFunction) => {
  console.log(`测试: ${name}`)
  try {
    const startTime = Date.now()
    const result = await testFunction()
    const duration = Date.now() - startTime
    
    // 验证响应格式
    if (result && typeof result === 'object' && 'success' in result) {
      testResults.passed++
      testResults.results.push({
        name,
        status: 'passed',
        duration,
        hasData: result.data !== null && result.data !== undefined,
        message: result.message || '无消息'
      })
      console.log(`✓ 通过: ${name} (${duration}ms)`)
    } else {
      throw new Error('无效的响应格式')
    }
    
    return result
  } catch (error) {
    testResults.failed++
    testResults.results.push({
      name,
      status: 'failed',
      error: error.message
    })
    console.error(`✗ 失败: ${name}`, error.message)
    return null
  }
}

// 运行所有测试
const runAllTests = async () => {
  console.log('=====================')
  console.log('开始API接口测试...')
  console.log('=====================')
  
  // 重置测试结果
  testResults.passed = 0
  testResults.failed = 0
  testResults.results = []
  
  // 测试统计相关API
  console.log('\n--- 统计模块 API 测试 ---')
  await testAPI('获取统计概览', () => getStatsOverview())
  await testAPI('获取习惯历史', () => getHabitHistory('test-id', { days: 7 }))
  await testAPI('获取月度报告', () => getMonthlyReport())
  
  // 测试分类相关API
  console.log('\n--- 分类模块 API 测试 ---')
  await testAPI('获取分类列表', () => getCategories())
  
  // 测试图标相关API
  console.log('\n--- 图标模块 API 测试 ---')
  await testAPI('获取图标列表', () => getIcons())
  
  // 测试直接API调用
  console.log('\n--- 直接API调用测试 ---')
  await testAPI('健康检查', () => api.get('/health'))
  
  // 打印测试汇总
  console.log('\n=====================')
  console.log('测试汇总:')
  console.log(`总测试数: ${testResults.passed + testResults.failed}`)
  console.log(`通过: ${testResults.passed}`)
  console.log(`失败: ${testResults.failed}`)
  console.log('=====================')
  
  return testResults
}

// 自动运行测试（可选，需要时取消注释）
// if (process.env.NODE_ENV === 'development') {
//   runAllTests().then(results => {
//     console.log('测试完成')
//   })
// }

export { runAllTests, testAPI }

// 导出为默认函数，方便在浏览器控制台手动运行
export default runAllTests