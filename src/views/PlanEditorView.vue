<template>
  <AppLayout title="计划编辑" :showBackButton="true">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Main Content Card -->
      <BaseCard class="min-h-screen">
        <!-- Header Section with Title and Controls -->
        <div class="mb-6 sm:mb-8">
          <!-- 标题和帮助按钮 -->
          <div class="flex items-center justify-between mb-4 sm:mb-6">
            <input 
              v-model="title" 
              @change="saveTitle" 
              class="flex-1 text-2xl sm:text-3xl font-bold bg-transparent outline-none dark:text-white text-center px-2" 
              placeholder="健身计划" 
            />
            <div class="flex items-center gap-2 ml-4">
              <!-- 保存状态指示器 -->
              <div class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <div 
                  class="w-2 h-2 rounded-full transition-colors duration-300"
                  :class="{
                    'bg-green-500': saveStatus === 'saved',
                    'bg-yellow-500': saveStatus === 'saving',
                    'bg-gray-400': saveStatus === 'unsaved'
                  }"
                ></div>
                <span>{{ saveStatusText }}</span>
              </div>
              
              <!-- 删除计划按钮 -->
              <button 
                v-if="planId"
                @click="deleteCurrentPlan"
                class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                title="删除计划"
              >
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              <!-- 导出按钮 -->
              <button 
                @click="showExportMenu = !showExportMenu"
                class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="导出计划"
                :disabled="isExporting"
              >
                <svg v-if="!isExporting" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <svg v-else class="w-5 h-5 text-gray-500 dark:text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <!-- 导入按钮 -->
              <button 
                @click="triggerImport"
                class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="导入计划"
                :disabled="isImporting"
              >
                <svg v-if="!isImporting" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <svg v-else class="w-5 h-5 text-gray-500 dark:text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <!-- 模板按钮 -->
              <button 
                @click="openTemplates"
                class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="选择模板"
              >
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              <!-- 搜索按钮 -->
              <button 
                @click="openSearch"
                class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="搜索内容 (Ctrl+F)"
              >
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              <!-- 字数统计按钮 -->
              <button 
                @click="openWordCount"
                class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="字数统计"
              >
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              
              <!-- 快捷键帮助按钮 -->
              <button 
                @click="openShortcuts"
                class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="快捷键帮助 (?)"
              >
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- 导出菜单 -->
          <div 
            v-if="showExportMenu" 
            class="absolute top-16 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 z-40 min-w-[200px]"
          >
            <div class="space-y-1">
              <button 
                @click="handleExport('markdown')"
                class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                :disabled="isExporting"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  导出为 Markdown
                </div>
              </button>
              <button 
                @click="handleExport('html')"
                class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                :disabled="isExporting"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  导出为 HTML
                </div>
              </button>
              <button 
                @click="handleExport('json')"
                class="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                :disabled="isExporting"
              >
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  导出为 JSON
                </div>
              </button>
            </div>
          </div>
          
          <!-- 隐藏的文件输入 -->
          <input 
            ref="fileInputRef"
            type="file"
            accept=".md,.markdown,.json"
            @change="handleImport"
            class="hidden"
          />
          
          <!-- Control Row - 移动端垂直布局，桌面端水平布局 -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-4">
            <select v-model="status" @change="savePlanStatus" class="px-3 sm:px-4 py-2 sm:py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 sm:flex-none">
              <option value="not_started">未开始</option>
              <option value="in_progress">进行中</option>
              <option value="done">已完成</option>
            </select>
            <select v-model="priority" @change="savePriorityType" class="px-3 sm:px-4 py-2 sm:py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 sm:flex-none">
              <option value="low">低优先级</option>
              <option value="medium">中优先级</option>
              <option value="high">高优先级</option>
            </select>
            <select v-model="planType" @change="savePriorityType" class="px-3 sm:px-4 py-2 sm:py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 sm:flex-none">
              <option value="project">Project</option>
              <option value="task">Task</option>
              <option value="note">Note</option>
            </select>
            <div class="relative flex-1 sm:flex-none">
              <input 
                type="date" 
                v-model="dueDate" 
                @change="saveDueDate" 
                class="w-full px-3 sm:px-4 py-2 sm:py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-red-700 dark:text-red-300">{{ error }}</span>
          </div>
        </div>

        <!-- 离线模式提示 -->
        <div v-if="isOffline" class="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span class="text-yellow-700 dark:text-yellow-300">当前处于离线模式，数据将保存在本地</span>
            </div>
            <button @click="enableOfflineMode" class="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors">
              强制离线
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            <span class="text-blue-700 dark:text-blue-300">正在加载数据...</span>
          </div>
        </div>

        <!-- Editable Content Area -->
        <div 
          class="min-h-[500px] relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm" 
          @keydown="handleKeydown"
          @click="focusContentArea"
        >
          <!-- Empty State -->
          <div v-if="!blocks.length" class="text-center text-gray-500 dark:text-gray-400 py-16 sm:py-24 px-4">
            <div class="mb-8">
              <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center shadow-sm">
                <svg class="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div class="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">开始创建你的计划</div>
              <div class="text-sm mb-6 px-2 text-gray-600 dark:text-gray-400">
                按 <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono">/</kbd> 键打开命令菜单，或点击下方按钮开始编写
              </div>
              <div class="text-xs text-gray-400 dark:text-gray-500">支持拖拽排序、快捷键操作和实时保存</div>
            </div>
            
            <!-- 快速开始按钮 -->
            <div class="flex flex-col sm:flex-row justify-center gap-4 px-4">
              <button @click="addBlock('heading')" class="group w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                <div class="flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  添加标题
                </div>
              </button>
              <button @click="addBlock('text')" class="group w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm font-medium border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md">
                <div class="flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  添加文本
                </div>
              </button>
            </div>
          </div>

          <!-- Blocks Container -->
          <div class="space-y-1 p-4 pl-4 md:pl-16">
            <div 
              v-for="(block, idx) in blocks" 
              :key="block.id" 
              :data-block-id="block.id"
              class="group relative block-container"
              draggable="true" 
              @dragstart="onDragStart(block, $event)" 
              @dragend="onDragEnd"
              @dragover="onDragOver($event, block, idx)"
              @dragleave="onDragLeave"
              @drop="onDrop(block)"
              @mouseenter="hoveredBlock = block.id"
              @mouseleave="hoveredBlock = null"
            >
              <!-- 块控制器 - 拖拽和类型选择结合 (桌面端) -->
              <div 
                class="absolute -left-14 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 hidden md:block"
                :class="{ 'opacity-100': hoveredBlock === block.id }"
              >
                <!-- 拖拽手柄 - 结合块类型选择功能 -->
                <div 
                  class="w-8 h-8 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md bg-white dark:bg-gray-800"
                  @click="openBlockTypeSelector(block)"
                  :title="`${getBlockTypeLabel(block.type)} - 点击选择类型，拖拽移动位置`"
                  draggable="true"
                  @dragstart="onDragStart(block, $event)"
                  @dragend="onDragEnd"
                >
                  <svg fill="currentColor" viewBox="0 0 24 24" class="w-full h-full">
                    <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 10h2v2H8v-2zm6 0h2v2h-2v-2zM8 14h2v2H8v-2zm6 0h2v2h-2v-2z"/>
                  </svg>
                </div>
              </div>
              <!-- 块插入区域 (在块上方) -->
              <div 
                v-if="idx === 0 || showInsertArea === block.id"
                class="insert-line opacity-0 group-hover:opacity-100 transition-all duration-200 hover:opacity-100 hover:h-6 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg cursor-pointer -mb-1"
                @click="insertBlockAt(idx, 'text')"
                @mouseenter="showInsertArea = block.id"
                @mouseleave="showInsertArea = null"
                :class="{ 'opacity-100 h-6 bg-blue-50 dark:bg-blue-900/10': dragOverIndex === idx && dragOverPosition === 'above' }"
              >
                <div class="w-full h-full flex items-center justify-center">
                  <div class="w-8 h-0.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" :class="{ 'opacity-100': dragOverIndex === idx && dragOverPosition === 'above' }"></div>
                </div>
              </div>

              <!-- Block Content -->
              <div class="min-h-[2.5rem]">
                <component 
                  :is="resolveBlock(block.type)" 
                  v-model="block.content" 
                  :data-block-id="block.id"
                  @toggle-complete="onToggleComplete(block)" 
                  @update:modelValue="onBlockChange(block)"
                  @focus="onBlockFocus(block)"
                  @blur="onBlockBlur(block)"
                  @create-new-block="insertBlockAfter(idx)"
                  @delete-block="removeBlock(block)"
                />
              </div>

              <!-- 块插入区域 (在块下方) -->
              <div 
                v-if="idx === blocks.length - 1 || showInsertArea === block.id"
                class="insert-line opacity-0 group-hover:opacity-100 transition-all duration-200 hover:opacity-100 hover:h-6 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg cursor-pointer -mt-1"
                @click="insertBlockAt(idx + 1, 'text')"
                @mouseenter="showInsertArea = block.id"
                @mouseleave="showInsertArea = null"
                :class="{ 'opacity-100 h-6 bg-blue-50 dark:bg-blue-900/10': dragOverIndex === idx && dragOverPosition === 'below' }"
              >
                <div class="w-full h-full flex items-center justify-center">
                  <div class="w-8 h-0.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" :class="{ 'opacity-100': dragOverIndex === idx && dragOverPosition === 'below' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- 块类型选择器 -->
      <BlockTypeSelector 
        :show="showBlockSelector" 
        @close="showBlockSelector = false" 
        @select="onBlockTypeSelect"
      />
      
      <!-- 快捷键帮助 -->
      <KeyboardShortcuts 
        :show="showShortcuts" 
        @close="showShortcuts = false"
      />
      
      <!-- 搜索模态框 -->
      <SearchModal 
        :show="showSearch" 
        :blocks="blocks"
        @close="showSearch = false"
        @select-block="selectBlockFromSearch"
      />
      
      <!-- 模板选择器 -->
      <TemplateSelector 
        :show="showTemplates" 
        :templates="templates"
        :categories="categories"
        @close="showTemplates = false"
        @select-template="applyTemplateToPlan"
      />
      
      <!-- 字数统计模态框 -->
      <WordCountModal 
        :show="showWordCount" 
        :stats="wordCountStats"
        @close="showWordCount = false"
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import BlockTypeSelector from '@/components/BlockTypeSelector.vue'
import KeyboardShortcuts from '@/components/KeyboardShortcuts.vue'
import SearchModal from '@/components/SearchModal.vue'
import TemplateSelector from '@/components/TemplateSelector.vue'
import WordCountModal from '@/components/WordCountModal.vue'
import { usePlanStore } from '@/stores/plan'
import { useHabitStore } from '@/stores/habit'
import { useRoute, useRouter } from 'vue-router'
import { useModal } from '@/composables/useModal'
import { useHistory } from '@/composables/useHistory'
import { useImportExport } from '@/composables/useImportExport'
import { useTemplates } from '@/composables/useTemplates'
import { useWordCount } from '@/composables/useWordCount'

// 块组件导入
import HeadingBlock from '@/views/plan/blocks/HeadingBlock.vue'
import TextBlock from '@/views/plan/blocks/TextBlock.vue'
import TodoBlock from '@/views/plan/blocks/TodoBlock.vue'
import ImageBlock from '@/views/plan/blocks/ImageBlock.vue'
import VideoBlock from '@/views/plan/blocks/VideoBlock.vue'
import AudioBlock from '@/views/plan/blocks/AudioBlock.vue'
import QuoteBlock from '@/views/plan/blocks/QuoteBlock.vue'
import CalloutBlock from '@/views/plan/blocks/CalloutBlock.vue'
import FormulaBlock from '@/views/plan/blocks/FormulaBlock.vue'
import CollapseBlock from '@/views/plan/blocks/CollapseBlock.vue'
import CodeBlock from '@/views/plan/blocks/CodeBlock.vue'
import ColumnsBlock from '@/views/plan/blocks/ColumnsBlock.vue'
import TableBlock from '@/views/plan/blocks/TableBlock.vue'
import ListBlock from '@/views/plan/blocks/ListBlock.vue'

// 简化的块集合
const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()
const habitStore = useHabitStore()
const { showConfirm } = useModal()
const planId = ref(null)
const title = ref('健身计划')
const dueDate = ref('')
const status = ref('in_progress')
const priority = ref('medium')
const planType = ref('project')
const blocks = ref([])
const hoveredBlock = ref(null)
const focusedBlock = ref(null)
const showInsertArea = ref(null)
const dragOverIndex = ref(null)
const dragOverPosition = ref(null)
const isDragging = ref(false)
const isLoading = ref(false)
const error = ref(null)
const isOffline = ref(false)
const saveStatus = ref('saved') // 'saved', 'saving', 'unsaved'

// 历史记录管理
const { 
  canUndo, 
  canRedo, 
  saveState, 
  undo, 
  redo, 
  initializeHistory 
} = useHistory(50)

// 导入导出功能
const { 
  isExporting, 
  isImporting, 
  exportPlan, 
  importPlan 
} = useImportExport()

// 模板功能
const { 
  templates, 
  categories, 
  applyTemplate 
} = useTemplates()

// 字数统计功能
const { 
  showWordCount, 
  calculatePlanStats 
} = useWordCount()

// 块组件映射 - 使用同步导入避免Promise问题
const resolveBlock = (type) => ({
  heading: HeadingBlock,
  text: TextBlock,
  todo: TodoBlock,
  image: ImageBlock,
  video: VideoBlock,
  audio: AudioBlock,
  quote: QuoteBlock,
  callout: CalloutBlock,
  formula: FormulaBlock,
  collapse: CollapseBlock,
  code: CodeBlock,
  columns: ColumnsBlock,
  table: TableBlock,
  list: ListBlock
}[type] || TextBlock)

const addBlock = (type) => {
  const content = {
    heading: { text: '标题', level: 1 },
    text: { text: '' },
    todo: { text: '新的待办', done: false },
    image: { url: '', alt: '', displayStyle: 'full-width' },
    video: { url: '', title: '', displayStyle: 'full-width' },
    audio: { url: '', title: '', duration: 0, displayStyle: 'full-width' },
    quote: { text: '' },
    callout: { text: '', variant: 'info' },
    formula: { latex: '' },
    collapse: { title: '', text: '', open: false },
    code: { lang: 'javascript', code: '' },
    columns: { cols: 2, columns: ['', ''] },
    table: { headers: ['列1', '列2'], rows: [['', '']] },
    list: { listType: 'unordered', items: ['列表项 1', '列表项 2'] }
  }[type] || { text: '' }
  
  const newBlock = { 
    id: Date.now(), 
    type, 
    content,
    order: blocks.value.length + 1
  }
  
  // 保存到历史记录
  saveCurrentStateToHistory()
  
  if (planId.value) {
    planStore.addBlock(planId.value, type, content).then(res => {
      if (res.success) {
        blocks.value.push(res.data)
      } else {
        // API失败时直接添加到本地
        blocks.value.push(newBlock)
      }
    }).catch(e => {
      console.warn('添加块失败，使用本地存储:', e)
      blocks.value.push(newBlock)
    })
  } else {
    blocks.value.push(newBlock)
  }
}

// 在指定位置插入块
const insertBlockAt = (index, type) => {
  const content = {
    heading: { text: '标题', level: 1 },
    text: { text: '' },
    todo: { text: '新的待办', done: false },
    image: { url: '', alt: '' },
    video: { url: '', title: '' },
    audio: { url: '' },
    quote: { text: '' },
    callout: { text: '', variant: 'info' },
    formula: { latex: '' },
    collapse: { title: '', text: '', open: false },
    code: { lang: 'javascript', code: '' },
    columns: { cols: 2, columns: ['', ''] },
    table: { headers: ['列1', '列2'], rows: [['', '']] },
    list: { listType: 'unordered', items: ['列表项 1', '列表项 2'] }
  }[type] || { text: '' }
  
  const newBlock = { 
    id: Date.now(), 
    type, 
    content,
    order: index + 1
  }
  
  if (planId.value) {
    // 如果有计划ID，需要重新排序所有块
    blocks.value.splice(index, 0, newBlock)
    const ids = blocks.value.map(b => b.id)
    planStore.reorder(planId.value, ids).catch(e => {
      console.warn('重新排序失败:', e)
    })
  } else {
    blocks.value.splice(index, 0, newBlock)
  }
  
  showInsertArea.value = null
}

// 在指定块后插入新块
const insertBlockAfter = (index) => {
  insertBlockAt(index + 1, 'text')
}

// 类型切换
const onTypeChange = async (block) => {
  if (!planId.value) return
  await planStore.updateBlock(block.id, { type: block.type }, planId.value)
}

// 删除块
const removeBlock = async (block) => {
  if (!planId.value) {
    blocks.value = blocks.value.filter(b => b.id !== block.id)
    return
  }
  try {
    blocks.value = blocks.value.filter(b => b.id !== block.id)
    const ids = blocks.value.map(b => b.id)
    await planStore.reorder(planId.value, ids)
  } catch {}
}

const onToggleComplete = async (block) => {
  if (block.type === 'todo' && block.content?.habitId) {
    try {
      if (planId.value) await planStore.updateBlock(block.id, { content: { ...block.content } }, planId.value)
      if (typeof habitStore.completeHabit === 'function') {
        await habitStore.completeHabit(block.content.habitId)
      }
    } catch (e) {
      console.error('联动失败', e)
    }
  }
}

const saveTitle = async () => {
  if (planId.value && title.value?.trim()) {
    try {
      saveStatus.value = 'saving'
      await planStore.updatePlan(planId.value, { title: title.value.trim() })
      saveStatus.value = 'saved'
    } catch (e) {
      console.warn('保存标题失败:', e)
      saveStatus.value = 'unsaved'
    }
  }
}

const saveDueDate = async () => {
  if (planId.value) {
    try {
      saveStatus.value = 'saving'
      await planStore.updatePlan(planId.value, { due_date: dueDate.value || null })
      saveStatus.value = 'saved'
    } catch (e) {
      console.warn('保存截止日期失败:', e)
      saveStatus.value = 'unsaved'
    }
  }
}

const savePlanStatus = async () => {
  if (planId.value) {
    try {
      saveStatus.value = 'saving'
      await planStore.updatePlan(planId.value, { status: status.value })
      saveStatus.value = 'saved'
    } catch (e) {
      console.warn('保存状态失败:', e)
      saveStatus.value = 'unsaved'
    }
  }
}

const savePriorityType = async () => {
  if (planId.value) {
    try {
      saveStatus.value = 'saving'
      await planStore.updatePlan(planId.value, { priority: priority.value, type: planType.value })
      saveStatus.value = 'saved'
    } catch (e) {
      console.warn('保存优先级和类型失败:', e)
      saveStatus.value = 'unsaved'
    }
  }
}

onMounted(async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // 检查离线模式
    isOffline.value = localStorage.getItem('offline_mode') === 'true'
    
    const idParam = Number(route.params.id)
    if (!Number.isNaN(idParam)) planId.value = idParam
    
    // 加载计划列表
    try {
      await planStore.loadPlans()
    } catch (e) {
      console.warn('加载计划列表失败，使用离线模式:', e)
    }
    
    if (planId.value) {
      // 加载块数据
      try {
        await planStore.loadBlocks(planId.value)
        const loadedBlocks = planStore.getBlocks(planId.value)
        // 确保blocks是数组，并且每个block都有正确的content结构
        blocks.value = Array.isArray(loadedBlocks) ? loadedBlocks.map(block => ({
          ...block,
          content: block.content || { text: '' }
        })) : []
      } catch (e) {
        console.warn('加载块数据失败，使用空数组:', e)
        blocks.value = []
      }
      
      // 加载计划详情
      const p = planStore.plans.find(p => p.id === planId.value)
      if (p) {
        title.value = p.title || title.value
        dueDate.value = p.due_date || ''
        status.value = p.status || 'not_started'
        priority.value = p.priority || 'medium'
        planType.value = p.type || 'project'
      }
      
      // 确保习惯列表可用于待办关联
      if (typeof habitStore.fetchHabits === 'function') {
        try {
          await habitStore.fetchHabits()
        } catch (e) {
          console.warn('加载习惯列表失败:', e)
        }
      }
    } else {
      // 如果没有planId，初始化空数组
      blocks.value = []
    }
    
    // 初始化历史记录
    const initialState = {
      title: title.value,
      blocks: JSON.parse(JSON.stringify(blocks.value)),
      dueDate: dueDate.value,
      status: status.value,
      priority: priority.value,
      planType: planType.value
    }
    initializeHistory(initialState)
  } catch (e) {
    console.error('加载计划数据失败:', e)
    error.value = e.message || '加载数据失败'
    // 确保blocks是数组
    blocks.value = []
  } finally {
    isLoading.value = false
  }
})

// 块类型选择器
const showBlockSelector = ref(false)
const currentBlockForTypeChange = ref(null)
const openBlockSelector = () => showBlockSelector.value = true
const openBlockTypeSelector = (block) => {
  currentBlockForTypeChange.value = block
  showBlockSelector.value = true
}
const onBlockTypeSelect = (type) => { 
  if (currentBlockForTypeChange.value) {
    // 改变现有块的类型
    changeBlockType(currentBlockForTypeChange.value, type)
    currentBlockForTypeChange.value = null
  } else {
    // 添加新块
    addBlock(type)
  }
  showBlockSelector.value = false
}

// 快捷键帮助
const showShortcuts = ref(false)
const openShortcuts = () => showShortcuts.value = true

// 搜索功能
const showSearch = ref(false)
const openSearch = () => showSearch.value = true

// 模板功能
const showTemplates = ref(false)
const openTemplates = () => showTemplates.value = true

// 字数统计功能
const openWordCount = () => showWordCount.value = true

// 导入导出相关状态
const showExportMenu = ref(false)
const fileInputRef = ref(null)

// 删除当前计划
const deleteCurrentPlan = async () => {
  if (!planId.value) return
  
  // 使用统一的确认弹窗
  const confirmed = await showConfirm({
    title: '删除计划',
    message: `确定要删除计划"${title.value}"吗？此操作不可撤销。`,
    type: 'error'
  })
  
  if (confirmed) {
    const res = await planStore.deletePlan(planId.value)
    if (res.success) {
      // 删除成功后跳转到计划列表
      router.push('/plan')
    }
  }
}

// 改变块类型
const changeBlockType = (block, newType) => {
  const blockIndex = blocks.value.findIndex(b => b.id === block.id)
  if (blockIndex !== -1) {
    const newContent = {
      heading: { text: '标题', level: 1 },
      text: { text: '' },
      todo: { text: '新的待办', done: false },
      image: { url: '', alt: '', displayStyle: 'full-width' },
      video: { url: '', title: '', displayStyle: 'full-width' },
      audio: { url: '', title: '', duration: 0, displayStyle: 'full-width' },
      quote: { text: '' },
      callout: { text: '', variant: 'info' },
      formula: { latex: '' },
      collapse: { title: '', text: '', open: false },
      code: { lang: 'javascript', code: '' },
      columns: { cols: 2, columns: ['', ''] },
      table: { headers: ['列1', '列2'], rows: [['', '']] }
    }[newType] || { text: '' }
    
    blocks.value[blockIndex] = {
      ...blocks.value[blockIndex],
      type: newType,
      content: newContent
    }
    
    // 保存更改
    saveBlocks()
  }
}

// 获取块类型标签
const getBlockTypeLabel = (type) => {
  const labels = {
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
  return labels[type] || '文本'
}

// 获取块类型图标
const getBlockIcon = (type) => {
  const icons = {
    text: 'TextIcon',
    heading: 'HeadingIcon',
    todo: 'TodoIcon',
    image: 'ImageIcon',
    video: 'VideoIcon',
    audio: 'AudioIcon',
    quote: 'QuoteIcon',
    callout: 'CalloutIcon',
    formula: 'FormulaIcon',
    collapse: 'CollapseIcon',
    code: 'CodeIcon',
    columns: 'ColumnsIcon',
    table: 'TableIcon',
    list: 'ListIcon'
  }
  return icons[type] || 'TextIcon'
}

// 图标组件
const TextIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>' }
const HeadingIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" /></svg>' }
const TodoIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' }
const ImageIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>' }
const VideoIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>' }
const AudioIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>' }
const QuoteIcon = { template: '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/></svg>' }
const CalloutIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' }
const FormulaIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>' }
const CollapseIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>' }
const CodeIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>' }
const ColumnsIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>' }
const TableIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>' }
const ListIcon = { template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>' }

// 保存状态管理
const saveStatusText = computed(() => {
  const texts = {
    saved: '已保存',
    saving: '保存中...',
    unsaved: '未保存'
  }
  return texts[saveStatus.value] || '已保存'
})

// 字数统计
const wordCountStats = computed(() => {
  return calculatePlanStats(blocks.value)
})

// 键盘快捷键处理
const handleKeydown = (e) => {
  // 处理 ESC 键关闭弹窗
  if (e.key === 'Escape') {
    showBlockSelector.value = false
    showShortcuts.value = false
    return
  }
  
  // 处理 ? 键打开快捷键帮助
  if (e.key === '?' && !showBlockSelector.value && !showShortcuts.value) {
    e.preventDefault()
    openShortcuts()
    return
  }
  
  // 处理 / 键打开块类型选择器
  if (e.key === '/' && !showBlockSelector.value && !showShortcuts.value) {
    e.preventDefault()
    openBlockSelector()
    return
  }
  
  // 处理 Ctrl/Cmd + S 保存文档
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    savePlanStatus()
    return
  }
  
  // 处理 Ctrl/Cmd + Z 撤销操作
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    performUndo()
    return
  }
  
  // 处理 Ctrl/Cmd + Y 或 Ctrl/Cmd + Shift + Z 重做操作
  if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
    e.preventDefault()
    performRedo()
    return
  }
  
  // 处理 Ctrl/Cmd + A 全选
  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    e.preventDefault()
    selectAllContent()
    return
  }
  
  // 处理 Ctrl/Cmd + Enter 快速添加文本块
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    addBlock('text')
    return
  }
  
  // 处理 Ctrl/Cmd + Shift + H 快速添加标题
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
    e.preventDefault()
    addBlock('heading')
    return
  }
  
  // 处理 Ctrl/Cmd + T 快速添加待办
  if ((e.ctrlKey || e.metaKey) && e.key === 't') {
    e.preventDefault()
    addBlock('todo')
    return
  }
  
  // 处理 Ctrl/Cmd + Shift + C 快速添加代码块
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault()
    addBlock('code')
    return
  }
  
  // 处理 Ctrl/Cmd + Shift + T 快速添加表格
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
    e.preventDefault()
    addBlock('table')
    return
  }
  
  // 处理 Ctrl/Cmd + Shift + L 快速添加列表
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
    e.preventDefault()
    addBlock('list')
    return
  }
  
  // 处理 Ctrl/Cmd + F 搜索
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault()
    openSearch()
    return
  }
  
  // 处理 Ctrl/Cmd + Backspace 删除当前块
  if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
    e.preventDefault()
    if (focusedBlock.value) {
      const block = blocks.value.find(b => b.id === focusedBlock.value)
      if (block) {
        removeBlock(block)
      }
    }
    return
  }
  
  // 处理 Tab 键移动到下一个块
  if (e.key === 'Tab' && !e.shiftKey) {
    e.preventDefault()
    moveToNextBlock()
    return
  }
  
  // 处理 Shift + Tab 键移动到上一个块
  if (e.key === 'Tab' && e.shiftKey) {
    e.preventDefault()
    moveToPreviousBlock()
    return
  }
  
  // 处理 Enter 键创建新块
  if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
    // 这个逻辑会在各个块组件中处理
    return
  }
}

// 块导航功能
const moveToNextBlock = () => {
  if (!focusedBlock.value) return
  
  const currentIndex = blocks.value.findIndex(b => b.id === focusedBlock.value)
  if (currentIndex < blocks.value.length - 1) {
    const nextBlock = blocks.value[currentIndex + 1]
    focusBlock(nextBlock)
  }
}

const moveToPreviousBlock = () => {
  if (!focusedBlock.value) return
  
  const currentIndex = blocks.value.findIndex(b => b.id === focusedBlock.value)
  if (currentIndex > 0) {
    const prevBlock = blocks.value[currentIndex - 1]
    focusBlock(prevBlock)
  }
}

const focusBlock = (block) => {
  // 触发块组件的focus事件
  const blockElement = document.querySelector(`[data-block-id="${block.id}"]`)
  if (blockElement) {
    const input = blockElement.querySelector('input, textarea')
    if (input) {
      input.focus()
    }
  }
}

// Focus and interaction handlers
const focusContentArea = () => {
  if (!blocks.value.length) {
    addBlock('text')
  }
}

const onBlockFocus = (block) => {
  focusedBlock.value = block.id
  hoveredBlock.value = block.id
}

const onBlockBlur = (block) => {
  focusedBlock.value = null
  // Keep hoveredBlock for a moment to allow clicking on controls
  setTimeout(() => {
    if (focusedBlock.value !== block.id) {
      hoveredBlock.value = null
    }
  }, 100)
}

// 启用离线模式
const enableOfflineMode = () => {
  localStorage.setItem('offline_mode', 'true')
  localStorage.setItem('force_offline', 'true')
  isOffline.value = true
  console.log('已启用离线模式')
}

// 拖拽排序（单一定义）
const dragging = ref(null)
const onDragStart = (block, event) => {
  dragging.value = block
  isDragging.value = true
  
  // 设置拖拽效果
  if (event && event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', block.id)
  }
}

const onDragEnd = () => {
  dragging.value = null
  isDragging.value = false
  dragOverIndex.value = null
  dragOverPosition.value = null
}

const onDragOver = (event, targetBlock, index) => {
  event.preventDefault()
  
  if (!dragging.value || dragging.value.id === targetBlock.id) return
  
  const rect = event.currentTarget.getBoundingClientRect()
  const y = event.clientY - rect.top
  const height = rect.height
  
  // 判断拖拽位置（上方或下方）
  if (y < height / 2) {
    dragOverIndex.value = index
    dragOverPosition.value = 'above'
  } else {
    dragOverIndex.value = index
    dragOverPosition.value = 'below'
  }
}

const onDragLeave = () => {
  dragOverIndex.value = null
  dragOverPosition.value = null
}

const onDrop = async (target) => {
  if (!dragging.value || dragging.value.id === target.id) {
    onDragEnd()
    return
  }
  
  const from = blocks.value.findIndex(b => b.id === dragging.value.id)
  const to = blocks.value.findIndex(b => b.id === target.id)
  
  if (from !== -1 && to !== -1) {
    const moved = blocks.value.splice(from, 1)[0]
    
    // 根据拖拽位置插入
    let insertIndex = to
    if (dragOverPosition.value === 'below') {
      insertIndex = to + 1
    }
    
    // 调整插入位置（因为已经移除了一个元素）
    if (from < to) {
      insertIndex -= 1
    }
    
    blocks.value.splice(insertIndex, 0, moved)
    
    if (planId.value) {
      const ids = blocks.value.map(b => b.id)
      await planStore.reorder(planId.value, ids)
    }
  }
  
  onDragEnd()
}

// 内容自动保存（防抖）
const pending = new Map()
const debounce = (fn, wait = 500) => {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait) }
}

const doSaveBlock = async (block) => {
  if (!planId.value) {
    saveStatus.value = 'saved'
    return
  }
  
  try {
    saveStatus.value = 'saving'
    // 仅保存 content 变化
    await planStore.updateBlock(block.id, { content: { ...block.content } }, planId.value)
    saveStatus.value = 'saved'
  } catch (e) {
    console.warn('保存块内容失败:', e)
    saveStatus.value = 'unsaved'
  }
}

const debouncedSave = debounce(doSaveBlock, 600)

const onBlockChange = (block) => {
  // 确保block.content是对象
  if (!block.content || typeof block.content !== 'object') {
    block.content = { text: '' }
  }
  
  // 标记为未保存
  saveStatus.value = 'unsaved'
  
  // 保存到历史记录
  saveCurrentStateToHistory()
  
  // 触发防抖保存
  debouncedSave(block)
}

// 保存当前状态到历史记录
const saveCurrentStateToHistory = () => {
  const currentState = {
    title: title.value,
    blocks: JSON.parse(JSON.stringify(blocks.value)),
    dueDate: dueDate.value,
    status: status.value,
    priority: priority.value,
    planType: planType.value
  }
  saveState(currentState)
}

// 从历史记录恢复状态
const restoreStateFromHistory = (state) => {
  if (state) {
    title.value = state.title
    blocks.value = JSON.parse(JSON.stringify(state.blocks))
    dueDate.value = state.dueDate
    status.value = state.status
    priority.value = state.priority
    planType.value = state.planType
  }
}

// 执行撤销操作
const performUndo = () => {
  if (canUndo.value) {
    const previousState = undo()
    if (previousState) {
      restoreStateFromHistory(previousState)
      saveStatus.value = 'unsaved'
    }
  }
}

// 执行重做操作
const performRedo = () => {
  if (canRedo.value) {
    const nextState = redo()
    if (nextState) {
      restoreStateFromHistory(nextState)
      saveStatus.value = 'unsaved'
    }
  }
}

// 全选内容
const selectAllContent = () => {
  // 查找所有可编辑的元素
  const editableElements = document.querySelectorAll('input, textarea, [contenteditable="true"]')
  
  if (editableElements.length > 0) {
    // 选择第一个可编辑元素并全选其内容
    const firstElement = editableElements[0]
    firstElement.focus()
    
    if (firstElement.select) {
      firstElement.select()
    } else if (firstElement.setSelectionRange) {
      firstElement.setSelectionRange(0, firstElement.value.length)
    }
  } else {
    // 如果没有可编辑元素，尝试选择所有文本内容
    const selection = window.getSelection()
    const range = document.createRange()
    
    // 选择整个编辑器内容区域
    const contentArea = document.querySelector('.min-h-\\[500px\\]')
    if (contentArea) {
      range.selectNodeContents(contentArea)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
}

// 导出功能
const handleExport = async (format) => {
  showExportMenu.value = false
  
  const planData = {
    title: title.value,
    dueDate: dueDate.value,
    status: status.value,
    priority: priority.value,
    planType: planType.value,
    blocks: blocks.value
  }
  
  const result = await exportPlan(planData, format)
  
  if (result.success) {
    // 可以显示成功提示
    console.log('导出成功')
  } else {
    // 显示错误提示
    console.error('导出失败:', result.error)
  }
}

// 触发导入
const triggerImport = () => {
  fileInputRef.value?.click()
}

// 处理导入
const handleImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const result = await importPlan(file)
  
  if (result.success) {
    // 导入成功，替换当前块
    blocks.value = result.blocks
    saveStatus.value = 'unsaved'
    
    // 保存到历史记录
    saveCurrentStateToHistory()
    
    // 清空文件输入
    event.target.value = ''
    
    console.log('导入成功')
  } else {
    // 显示错误提示
    console.error('导入失败:', result.error)
  }
}

// 从搜索结果选择块
const selectBlockFromSearch = (blockIndex) => {
  // 滚动到选中的块
  const blockElement = document.querySelector(`[data-block-id="${blocks.value[blockIndex]?.id}"]`)
  if (blockElement) {
    blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    
    // 高亮显示选中的块
    blockElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')
    setTimeout(() => {
      blockElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50')
    }, 2000)
    
    // 聚焦到块内的第一个输入元素
    const input = blockElement.querySelector('input, textarea')
    if (input) {
      input.focus()
    }
  }
}

// 应用模板到计划
const applyTemplateToPlan = (template) => {
  const templateData = applyTemplate(template.id, {
    title: title.value,
    dueDate: dueDate.value,
    status: status.value,
    priority: priority.value,
    planType: planType.value
  })
  
  if (templateData) {
    // 应用模板数据
    title.value = templateData.title
    blocks.value = templateData.blocks
    saveStatus.value = 'unsaved'
    
    // 保存到历史记录
    saveCurrentStateToHistory()
    
    console.log('模板应用成功')
  }
}

</script>

<style scoped>
/* 命令菜单动画 */
.command-menu-enter-active, .command-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.command-menu-enter-from, .command-menu-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 块容器动画 */
.block-container {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.block-container:hover {
  transform: translateY(-1px);
}

/* 插入线动画 */
.insert-line {
  height: 2px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.insert-line:hover {
  height: 24px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2));
}

/* 键盘快捷键样式 */
kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

/* 拖拽时的样式 */
.dragging {
  opacity: 0.6;
  transform: rotate(1deg) scale(1.02);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 块控制按钮悬停效果 */
.group:hover .block-controls {
  opacity: 1;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* 暗色模式滚动条 */
.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.3);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.5);
}

/* 按钮悬停效果 */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* 输入框焦点效果 */
input:focus, textarea:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

/* 卡片阴影效果 */
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* 移动端优化 */
@media (max-width: 640px) {
  /* 移动端触摸优化 */
  .touch-manipulation {
    touch-action: manipulation;
  }
  
  /* 移动端按钮最小尺寸 */
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* 移动端输入框优化 */
  input, textarea, select {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  /* 移动端块控制按钮始终显示 */
  .group .block-controls {
    opacity: 1 !important;
  }
  
  /* 移动端命令菜单优化 */
  .command-menu {
    max-height: 80vh;
    overflow-y: auto;
  }
  
  /* 移动端块容器优化 */
  .block-container {
    padding: 0.5rem;
  }
}

/* 平板端优化 */
@media (min-width: 641px) and (max-width: 1024px) {
  .group .block-controls {
    opacity: 0.7;
  }
  
  .group:hover .block-controls {
    opacity: 1;
  }
}

/* 桌面端优化 */
@media (min-width: 1025px) {
  /* 桌面端悬停效果更明显 */
  .block-container:hover {
    background: rgba(249, 250, 251, 0.5);
  }
  
  .dark .block-container:hover {
    background: rgba(31, 41, 55, 0.3);
  }
}

/* 动画性能优化 */
.block-container, .insert-line, button {
  will-change: transform, opacity;
}

/* 渐变背景 */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 毛玻璃效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* 自定义动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 应用动画 */
.block-container {
  animation: slideInUp 0.3s ease-out;
}

.command-menu {
  animation: scaleIn 0.3s ease-out;
}
</style>


