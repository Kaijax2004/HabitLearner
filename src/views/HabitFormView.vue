<template>
  <AppLayout 
    :title="isEditMode ? '编辑习惯' : '创建习惯'"
    :show-back-button="true"
  >
    <div class="p-4 lg:p-0">
      <form @submit.prevent="handleSubmit" class="space-y-8 max-w-3xl mx-auto">
        <!-- 习惯基本信息 -->
        <BaseCard title="基本信息">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">习惯名称</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input-apple"
                placeholder="例如：每日阅读"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">习惯分类</label>
              <div class="relative">
                <select v-model="form.category" @change="handleCategoryChange" class="input-apple pr-12" required>
                  <option value="">请选择分类</option>
                  <option v-for="category in availableCategories" :key="category.id || category.name || category" :value="getCategoryName(category)">
                    {{ getCategoryName(category) }}
                  </option>
                  <option value="add-category">+ 添加分类</option>
                </select>
                <!-- 删除分类按钮 -->
                <button
                  v-if="form.category && isCustomCategory(form.category)"
                  type="button"
                  @click="deleteCategory(form.category)"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  :title="`删除分类: ${form.category}`"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- 图标选择 -->
        <BaseCard title="选择图标">
          <!-- 图标管理按钮 -->
          <div class="flex justify-between items-center mb-4">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              共 {{ availableIcons.length + customIcons.length }} 个图标
            </div>
            <button
              type="button"
              @click="showIconManagementModal = true"
              class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              管理图标
            </button>
          </div>
          
          <div class="grid grid-cols-6 gap-3">
            <!-- 系统默认图标 -->
            <button
              v-for="(icon, index) in availableIcons"
              :key="`default-${index}`"
              type="button"
              @click="selectIcon(icon)"
              class="w-12 h-12 rounded-apple flex items-center justify-center transition-all duration-200"
              :class="[
                form.icon === icon.content
                  ? 'bg-primary-500 text-white scale-110 border-2 border-primary-500' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              ]"
            >
              <span class="text-2xl">{{ icon.content }}</span>
            </button>
            
            <!-- 用户自定义图标 -->
            <button
              v-for="(customIconItem, index) in customIcons"
              :key="`custom-${index}`"
              type="button"
              @click="selectIcon(customIconItem)"
              class="w-12 h-12 rounded-apple flex items-center justify-center transition-all duration-200 overflow-hidden"
              :class="[
                form.icon === (customIconItem.url || (typeof customIconItem.content === 'string' ? customIconItem.content : '📝'))
                  ? 'bg-primary-500 text-white scale-110 border-2 border-primary-500' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              ]"
            >
              <!-- 如果是图片 -->
              <img 
                v-if="customIconItem.url && (customIconItem.url.startsWith('data:image') || customIconItem.url.startsWith('http'))" 
                :src="customIconItem.url" 
                alt="自定义图标" 
                class="w-full h-full object-cover rounded-apple"
              />
              <!-- 如果是文字图标 -->
              <span v-else class="text-2xl">{{ customIconItem.content || customIconItem.name || customIconItem }}</span>
            </button>
          </div>
        </BaseCard>

        <!-- 目标设置 -->
        <BaseCard title="目标设置">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">频率</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="form.frequency = 'daily'"
                  class="p-3 rounded-apple border-2 transition-all duration-200"
                  :class="[
                    form.frequency === 'daily'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  <div class="text-center">
                    <div class="font-medium">每日</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">每天完成</div>
                  </div>
                </button>
                <button
                  type="button"
                  @click="form.frequency = 'weekly'"
                  class="p-3 rounded-apple border-2 transition-all duration-200"
                  :class="[
                    form.frequency === 'weekly'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  <div class="text-center">
                    <div class="font-medium">每周</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">每周完成</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                目标次数（{{ form.frequency === 'daily' ? '每天' : '每周' }}）
              </label>
              <div class="flex items-center space-x-3">
                <button
                  type="button"
                  @click="decreaseTarget"
                  :disabled="form.target <= 1"
                  class="w-10 h-10 rounded-apple border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <div class="flex-1 text-center">
                  <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ form.target }}</span>
                  <span class="text-sm text-gray-500 dark:text-gray-400 ml-1">次</span>
                </div>
                <button
                  type="button"
                  @click="increaseTarget"
                  :disabled="form.target >= 100"
                  class="w-10 h-10 rounded-apple border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </BaseCard>

        <!-- 每日打卡留言 -->
        <BaseCard title="每日打卡留言">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900 dark:text-gray-100">启用每日留言</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">每日首次打卡时弹出留言编辑窗口</div>
              </div>
              <button
                type="button"
                @click="form.enableComments = !form.enableComments"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                :class="form.enableComments ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                  :class="form.enableComments ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
          </div>
        </BaseCard>

        <!-- 选择颜色 -->
        <BaseCard title="选择颜色">
          <div class="grid grid-cols-8 gap-3">
            <button
              v-for="color in availableColors"
              :key="color"
              type="button"
              @click="form.color = color"
              class="w-12 h-12 rounded-apple border-2 transition-all duration-200 relative"
              :class="[
                form.color === color
                  ? 'border-gray-900 dark:border-white scale-110'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
              ]"
              :style="{ backgroundColor: color }"
            >
              <div v-if="form.color === color" class="absolute inset-0 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
        </BaseCard>

        <!-- 提醒设置 -->
        <BaseCard title="提醒设置">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900 dark:text-gray-100">开启提醒</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">每天定时提醒你完成习惯</div>
              </div>
              <button
                type="button"
                @click="form.reminderEnabled = !form.reminderEnabled"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                :class="form.reminderEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                  :class="form.reminderEnabled ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            
            <div v-if="form.reminderEnabled" class="mt-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">提醒时间</label>
              <TimePicker v-model="form.reminderTime" />
            </div>
          </div>
        </BaseCard>

        <!-- 提交按钮 -->
        <div class="space-y-3">
          <button
            type="submit"
            :disabled="isSubmitting || habitStore.isLoading"
            class="btn-primary w-full"
          >
            <span v-if="isSubmitting || habitStore.isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEditMode ? '更新中...' : '创建中...' }}
            </span>
            <span v-else>{{ isEditMode ? '更新习惯' : '创建习惯' }}</span>
          </button>
          
          <button
            v-if="isEditMode"
            type="button"
            @click="handleDelete"
            class="btn-danger w-full"
          >
            删除习惯
          </button>
        </div>
      </form>
    </div>

    <!-- 分类管理弹窗 -->
    <Teleport to="body">
      <div v-if="showCategoryModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4" @click.self="showCategoryModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-apple p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
          <div class="text-center mb-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">管理分类</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">添加、编辑和管理你的自定义分类</p>
          </div>
          
          <!-- 添加新分类 -->
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">添加新分类</label>
              <div class="flex space-x-2">
                <input
                  v-model="customCategory"
                  type="text"
                  placeholder="例如：健康、学习、工作"
                  class="input-apple flex-1"
                  @keyup.enter="addCustomCategory"
                />
                <button
                  @click="addCustomCategory"
                  :disabled="!customCategory.trim()"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-apple hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  添加
                </button>
              </div>
            </div>
          </div>
          
          <!-- 自定义分类列表 -->
          <div v-if="customCategories.length > 0" class="space-y-4">
            <div class="flex justify-between items-center">
              <h4 class="font-medium text-gray-900 dark:text-gray-100">我的自定义分类</h4>
              <div class="flex space-x-2">
                <button
                  v-if="selectedCategories.length > 0"
                  @click="deleteSelectedCategories"
                  class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  删除选中 ({{ selectedCategories.length }})
                </button>
                <button
                  @click="clearAllCustomCategories"
                  class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  删除全部
                </button>
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-2">
              <div
                v-for="(category, index) in customCategories"
                :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-apple"
              >
                <div class="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    :value="category"
                    v-model="selectedCategories"
                    class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div class="flex items-center space-x-2">
                    <div 
                      class="w-4 h-4 rounded-full"
                      :style="{ backgroundColor: getCategoryColor(category) }"
                    ></div>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ getCategoryName(category) }}</span>
                  </div>
                </div>
                <button
                  @click="deleteCategory(category)"
                  class="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  :title="`删除分类: ${getCategoryName(category)}`"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 系统默认分类 -->
          <div v-if="systemCategories.length > 0" class="space-y-4 mt-6">
            <h4 class="font-medium text-gray-900 dark:text-gray-100">系统默认分类</h4>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="category in systemCategories"
                :key="category.name"
                class="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-600 rounded-apple"
              >
                <div 
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: category.color }"
                ></div>
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ category.name }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button
              @click="showCategoryModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-apple hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 图标管理弹窗 -->
    <Teleport to="body">
      <div v-if="showIconManagementModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4" @click.self="showIconManagementModal = false">
        <div class="bg-white dark:bg-gray-800 rounded-apple p-6 max-w-4xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
          <div class="text-center mb-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">管理图标</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">上传和管理你的自定义图标</p>
          </div>
          
          <!-- 上传图标区域 -->
          <div class="space-y-6 mb-8">
            <!-- 上传图片图标 -->
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div class="flex items-center mb-3">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">上传图片图标</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">支持 JPG、PNG、GIF、WebP、SVG、BMP、TIFF、ICO 格式，文件大小不超过 5MB</p>
                </div>
              </div>
              
              <div class="space-y-3">
                <div class="flex space-x-3">
                  <input
                    type="file"
                    @change="handleIconFileChange"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,image/tiff,image/x-icon"
                    class="input-apple flex-1"
                    id="icon-file-input"
                  />
                  <button
                    v-if="iconFile"
                    @click="uploadIconFile"
                    :disabled="isUploading"
                    class="btn-apple bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg v-if="isUploading" class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    {{ isUploading ? '上传中...' : '上传' }}
                  </button>
                </div>
                
                <!-- 文件预览 -->
                <div v-if="iconPreview" class="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">预览：</p>
                  <div class="flex items-center space-x-3">
                    <img :src="iconPreview" alt="图标预览" class="w-8 h-8 object-cover rounded" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ iconFile?.name }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(iconFile?.size) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 添加文字图标 -->
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div class="flex items-center mb-3">
                <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">添加文字图标</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">输入文字、符号或emoji表情</p>
                </div>
              </div>
              
              <div class="flex space-x-3">
                <input
                  v-model="customIcon"
                  type="text"
                  placeholder="例如：📚、💪、🎯 或 学习"
                  class="input-apple flex-1"
                  maxlength="10"
                />
                <button
                  @click="addCustomIcon"
                  :disabled="!customIcon.trim() || isUploading"
                  class="btn-apple bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  添加
                </button>
              </div>
            </div>
          </div>
          
          <!-- 自定义图标列表 -->
          <div v-if="customIcons.length > 0" class="space-y-4">
            <div class="flex justify-between items-center">
              <h4 class="font-medium text-gray-900 dark:text-gray-100">自定义图标</h4>
              <div class="flex space-x-2">
                <button
                  v-if="selectedIcons.length > 0"
                  @click="deleteSelectedIcons"
                  class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  删除选中 ({{ selectedIcons.length }})
                </button>
                <button
                  @click="clearAllCustomIcons"
                  class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  清空所有
                </button>
                <button
                  @click="refreshIconList"
                  class="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  刷新列表
                </button>
              </div>
            </div>
            
            <!-- 移动端优化：使用更少的列数和更大的间距 -->
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 sm:gap-3">
              <div
                v-for="(icon, index) in customIcons"
                :key="index"
                class="relative group flex flex-col items-center space-y-2"
              >
                <!-- 复选框 -->
                <input
                  type="checkbox"
                  :value="index"
                  v-model="selectedIcons"
                  class="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                
                <!-- 图标按钮 -->
                <button
                  type="button"
                  class="w-16 h-16 sm:w-12 sm:h-12 rounded-apple flex items-center justify-center transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600"
                  @click="selectIcon(icon)"
                >
                  <img 
                    v-if="icon.url && (icon.url.startsWith('data:image') || icon.url.startsWith('http'))" 
                    :src="icon.url" 
                    alt="自定义图标" 
                    class="w-full h-full object-cover rounded-apple"
                  />
                  <span v-else class="text-2xl sm:text-xl">{{ icon.content || icon.name || icon }}</span>
                </button>
                
                <!-- 删除按钮 -->
                <button
                  @click="deleteCustomIcon(index)"
                  class="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-70 hover:opacity-100"
                  :title="`删除图标: ${icon.content || icon.name || icon}`"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end mt-6">
            <button
              @click="showIconManagementModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-apple hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useHabitStore } from '@/stores/habit'
import { useAuthStore } from '@/stores/auth'
import * as categoriesAPI from '@/api/categories.js'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import TimePicker from '@/components/TimePicker.vue'

// 路由和状态管理
const router = useRouter()
const route = useRoute()
const habitStore = useHabitStore()
const authStore = useAuthStore()
const { success, error, warning } = useToast()

// 获取用户默认提醒设置
const getDefaultReminderSettings = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userNotificationSettingsKey = user.id ? `notificationSettings_${user.id}` : 'notificationSettings'
    
    const userSettings = localStorage.getItem(userNotificationSettingsKey)
    if (userSettings) {
      const settings = JSON.parse(userSettings)
      console.log('🔔 获取用户提醒设置:', settings)
      return {
        // 新建习惯时默认为关闭状态，但用户可以手动开启
        enabled: false,
        time: settings.quietStartTime || getCurrentTimeString()
      }
    }
  } catch (error) {
    console.log('获取用户提醒设置失败:', error)
  }
  
  return {
    enabled: false,
    time: getCurrentTimeString()
  }
}

// 获取当前时间字符串
const getCurrentTimeString = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 响应式数据
const defaultReminderSettings = getDefaultReminderSettings()
const form = ref({
  name: '',
  icon: '📚',
  category: '',
  frequency: 'daily',
  target: 1,
  color: '#007AFF',
  reminderEnabled: defaultReminderSettings.enabled,
  reminderTime: defaultReminderSettings.time,
  enableComments: false
})

// 弹窗状态
const showCategoryModal = ref(false)
const showIconManagementModal = ref(false)
const customCategory = ref('')
const customIcon = ref('')
const iconFile = ref(null)
const iconPreview = ref('')
const isUploading = ref(false)
const selectedIcons = ref([])
const selectedCategories = ref([])

// 提交状态
const isSubmitting = ref(false)

// 请求队列，避免并发请求导致429错误
const requestQueue = ref([])
const isProcessingQueue = ref(false)

// 处理请求队列
const processRequestQueue = async () => {
  if (isProcessingQueue.value || requestQueue.value.length === 0) return
  
  isProcessingQueue.value = true
  console.log('开始处理请求队列，队列长度:', requestQueue.value.length)
  
  while (requestQueue.value.length > 0) {
    const request = requestQueue.value.shift()
    try {
      console.log('执行队列请求，剩余:', requestQueue.value.length)
      await request()
      // 增加请求间隔到3秒，避免429错误
      console.log('请求完成，等待3秒后处理下一个请求...')
      await new Promise(resolve => setTimeout(resolve, 3000))
    } catch (error) {
      console.error('队列请求失败:', error)
      // 如果遇到429错误，等待更长时间
      if (error.code === 429) {
        console.log('遇到429错误，等待10秒后继续...')
        await new Promise(resolve => setTimeout(resolve, 10000))
      }
    }
  }
  
  isProcessingQueue.value = false
  console.log('请求队列处理完成')
}

// 添加请求到队列
const addToQueue = (requestFn) => {
  requestQueue.value.push(requestFn)
  processRequestQueue()
}

// 分类管理
const availableCategories = ref([])
const customCategories = ref([])

// 计算属性：系统默认分类
const systemCategories = computed(() => {
  return availableCategories.value.filter(category => {
    // 如果是对象格式，检查isDefault字段
    if (typeof category === 'object' && category !== null) {
      return category.isDefault === true
    }
    // 如果是字符串格式，检查是否在系统分类列表中
    const systemCategoryNames = ['健康', '学习', '工作', '日常']
    return systemCategoryNames.includes(category)
  })
})

// 自定义图标管理
const customIcons = ref([])

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 计算属性
const isEditMode = computed(() => !!route.params.id)

// 系统默认图标
const availableIcons = ref([
  { id: 'book', content: '📚', name: '学习' },
  { id: 'run', content: '🏃', name: '运动' },
  { id: 'muscle', content: '💪', name: '健身' },
  { id: 'meditate', content: '🧘', name: '冥想' },
  { id: 'target', content: '🎯', name: '目标' },
  { id: 'write', content: '✍️', name: '写作' },
  { id: 'idea', content: '💡', name: '创意' },
  { id: 'star', content: '⭐', name: '成就' },
  { id: 'art', content: '🎨', name: '艺术' },
  { id: 'music', content: '🎵', name: '音乐' },
  { id: 'apple', content: '🍎', name: '健康' },
  { id: 'water', content: '💧', name: '喝水' },
  { id: 'plant', content: '🌱', name: '种植' },
  { id: 'read', content: '📖', name: '阅读' },
  { id: 'tent', content: '🎪', name: '娱乐' },
  { id: 'home', content: '🏠', name: '家庭' },
  { id: 'car', content: '🚗', name: '出行' },
  { id: 'plane', content: '✈️', name: '旅行' },
  { id: 'game', content: '🎮', name: '游戏' },
  { id: 'movie', content: '🎬', name: '电影' }
])

const availableColors = ref([
  '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5AC8FA', '#FFCC00', '#FF2D92', '#AF52DE'
])

// 方法
const increaseTarget = () => {
  if (form.value.target < 100) {
    form.value.target++
  }
}

const decreaseTarget = () => {
  if (form.value.target > 1) {
    form.value.target--
  }
}

const handleCategoryChange = () => {
  if (form.value.category === 'add-category') {
    form.value.category = ''
    showCategoryModal.value = true
  }
}

// handleIconClick 函数已移除，现在直接使用自定义图标点击逻辑

// 判断是否为自定义分类
const isCustomCategory = (category) => {
  const categoryName = getCategoryName(category)
  return customCategories.value.some(cat => getCategoryName(cat) === categoryName)
}

// 加载数据
const loadData = async () => {
  try {
    console.log('🔄 开始加载分类和图标数据...')
    
    // 加载分类
    const categoriesResponse = await categoriesAPI.getCategories()
    console.log('📂 分类API响应:', categoriesResponse)
    
    if (categoriesResponse.success) {
      const allCategories = categoriesResponse.data || []
      console.log('📂 获取到的分类数据:', allCategories)
      
      // 确保有系统默认分类
      const defaultCategories = [
        { id: 1, name: '健康', isDefault: true },
        { id: 2, name: '学习', isDefault: true },
        { id: 3, name: '工作', isDefault: true },
        { id: 4, name: '日常', isDefault: true }
      ]
      
      // 分离系统分类和自定义分类
      const systemCats = allCategories.filter(cat => cat.isDefault === true)
      const customCats = allCategories.filter(cat => cat.isDefault === false || cat.userId)
      
      // 如果后端没有返回系统分类，合并默认分类
      const finalSystemCats = systemCats.length > 0 ? systemCats : defaultCategories
      
      // 合并所有分类，确保系统分类在前
      availableCategories.value = [...finalSystemCats, ...customCats]
      customCategories.value = customCats
      
      console.log('📂 系统分类:', finalSystemCats)
      console.log('📂 自定义分类:', customCategories.value)
      console.log('📂 所有分类:', availableCategories.value)
    } else {
      console.error('❌ 获取分类失败:', categoriesResponse.error)
      
      // 如果API失败，至少提供系统默认分类
      const defaultCategories = [
        { id: 1, name: '健康', isDefault: true },
        { id: 2, name: '学习', isDefault: true },
        { id: 3, name: '工作', isDefault: true },
        { id: 4, name: '日常', isDefault: true }
      ]
      customCategories.value = []
      availableCategories.value = [...defaultCategories]
      
      error('获取分类失败', {
        description: categoriesResponse.error || '请检查网络连接，已加载默认分类'
      })
    }
    
    // 加载自定义图标
    const iconsResponse = await categoriesAPI.getIcons()
    console.log('🎨 图标API响应:', iconsResponse)
    
    if (iconsResponse.success) {
      const rawIcons = iconsResponse.data || []
      console.log('🎨 获取到的图标数据:', rawIcons)
      
      // 直接使用后端返回的图标数据，只做基本验证
      const validIcons = rawIcons.filter(icon => {
        return icon && (icon.id || icon.content || icon.url)
      })
      
      customIcons.value = validIcons
      console.log('🎨 有效图标数量:', validIcons.length)
    } else {
      console.error('❌ 获取图标失败:', iconsResponse.error)
      error('获取图标失败', {
        description: iconsResponse.error || '请检查网络连接'
      })
    }
  } catch (error) {
    console.error('❌ 加载数据异常:', error)
    error('加载数据失败', {
      description: '网络异常，请稍后重试'
    })
  }
}

// 添加自定义分类
const addCustomCategory = async () => {
  if (!customCategory.value.trim()) return
  
  try {
    const categoryName = customCategory.value.trim()
    console.log('🔄 创建分类:', categoryName)
    
    const response = await categoriesAPI.createCategory(categoryName)
    console.log('✅ 创建分类响应:', response)
    
    if (response.success) {
      const newCategory = response.data // 使用API返回的完整分类对象
      console.log('📂 新分类数据:', newCategory)
      
      // 确保分类对象有正确的结构
      const categoryObj = {
        id: newCategory.id || Date.now(),
        name: newCategory.name || categoryName,
        isDefault: false,
        userId: newCategory.userId || 1
      }
      
      // 添加到所有分类列表
      availableCategories.value.push(categoryObj)
      
      // 添加到自定义分类列表
      customCategories.value.push(categoryObj)
      
      // 设置当前选择的分类（使用分类名称）
      form.value.category = categoryObj.name
      
      // 清空输入并关闭弹窗
      customCategory.value = ''
      showCategoryModal.value = false
      
      success('分类添加成功')
      console.log('✅ 分类添加完成，当前自定义分类:', customCategories.value)
    } else {
      console.error('❌ 创建分类失败:', response.error)
      error('添加失败', {
        description: response.error || '请重试'
      })
    }
  } catch (err) {
    console.error('❌ 添加分类异常:', err)
    error('添加失败', {
      description: '网络错误，请稍后重试'
    })
  }
}

// 删除分类
const deleteCategory = async (category) => {
  const categoryName = getCategoryName(category)
  if (!confirm(`确定要删除分类"${categoryName}"吗？`)) return
  
  try {
    // 优先使用ID，如果没有ID则使用名称
    let categoryToDelete
    if (typeof category === 'object' && category !== null) {
      categoryToDelete = category.id || category.name
    } else {
      categoryToDelete = category
    }
    
    console.log('🗑️ 删除分类:', { category, categoryToDelete })
    const response = await categoriesAPI.deleteCategory(categoryToDelete)
    
    if (response.success) {
      // 从所有分类列表中移除
      const index = availableCategories.value.findIndex(cat => {
        if (typeof cat === 'object' && typeof category === 'object') {
          return cat.id === category.id
        }
        return cat === category
      })
      if (index > -1) {
        availableCategories.value.splice(index, 1)
      }
      
      // 从自定义分类列表中移除
      const customIndex = customCategories.value.findIndex(cat => {
        if (typeof cat === 'object' && typeof category === 'object') {
          return cat.id === category.id
        }
        return cat === category
      })
      if (customIndex > -1) {
        customCategories.value.splice(customIndex, 1)
      }
      
      // 如果当前选择的分类被删除，清空选择
      if (form.value.category === categoryName || 
          (typeof form.value.category === 'object' && form.value.category.id === category.id)) {
        form.value.category = ''
      }
      
      success(`分类"${categoryName}"已删除`)
    } else {
      error('删除失败', {
        description: response.error || '请重试'
      })
    }
  } catch (err) {
    console.error('删除分类失败:', err)
    error('删除失败', {
      description: '网络错误，请稍后重试'
    })
  }
}

// 获取分类名称
const getCategoryName = (category) => {
  // 如果是对象格式，返回其name字段
  if (typeof category === 'object' && category !== null && category.name) {
    return category.name
  }
  
  // 如果是字符串格式，直接返回
  return category || ''
}

// 获取分类颜色
const getCategoryColor = (category) => {
  // 如果是对象格式，返回其颜色
  if (typeof category === 'object' && category !== null && category.color) {
    return category.color
  }
  
  // 如果是字符串格式，根据分类名称返回默认颜色
  const colorMap = {
    '学习': '#007AFF',
    '健康': '#34C759',
    '工作': '#FF9500',
    '生活': '#FF3B30',
    '其他': '#8E8E93'
  }
  
  return colorMap[category] || '#8E8E93'
}

// 删除选中的分类
const deleteSelectedCategories = async () => {
  if (selectedCategories.value.length === 0) return
  
  if (!confirm(`确定要删除选中的 ${selectedCategories.value.length} 个分类吗？`)) return
  
  try {
    const deletePromises = selectedCategories.value.map(category => {
      let categoryToDelete
      if (typeof category === 'object' && category !== null) {
        categoryToDelete = category.id || category.name
      } else {
        categoryToDelete = category
      }
      console.log('🗑️ 批量删除分类:', { category, categoryToDelete })
      return categoriesAPI.deleteCategory(categoryToDelete)
    })
    
    const responses = await Promise.all(deletePromises)
    const failedDeletes = responses.filter(response => !response.success)
    
    if (failedDeletes.length === 0) {
      // 所有删除都成功
      selectedCategories.value.forEach(category => {
        // 从所有分类列表中移除
        const index = availableCategories.value.findIndex(cat => {
          if (typeof cat === 'object' && typeof category === 'object') {
            return cat.id === category.id
          }
          return cat === category
        })
        if (index > -1) {
          availableCategories.value.splice(index, 1)
        }
        
        // 从自定义分类列表中移除
        const customIndex = customCategories.value.findIndex(cat => {
          if (typeof cat === 'object' && typeof category === 'object') {
            return cat.id === category.id
          }
          return cat === category
        })
        if (customIndex > -1) {
          customCategories.value.splice(customIndex, 1)
        }
        
        // 如果当前选择的分类被删除，清空选择
        const categoryName = getCategoryName(category)
        if (form.value.category === categoryName || 
            (typeof form.value.category === 'object' && form.value.category.id === category.id)) {
          form.value.category = ''
        }
      })
      
      selectedCategories.value = []
      success(`已删除 ${responses.length} 个分类`)
    } else {
      error('部分删除失败', {
        description: '部分分类删除失败，请重试'
      })
    }
  } catch (err) {
    console.error('删除选中分类失败:', err)
    error('删除失败', {
      description: '网络错误，请稍后重试'
    })
  }
}

// 清空所有自定义分类
const clearAllCustomCategories = async () => {
  if (customCategories.value.length === 0) return
  
  if (!confirm(`确定要删除所有自定义分类吗？此操作不可撤销。`)) return
  
  try {
    const deletePromises = customCategories.value.map(category => {
      let categoryToDelete
      if (typeof category === 'object' && category !== null) {
        categoryToDelete = category.id || category.name
      } else {
        categoryToDelete = category
      }
      console.log('🗑️ 清空自定义分类:', { category, categoryToDelete })
      return categoriesAPI.deleteCategory(categoryToDelete)
    })
    
    const responses = await Promise.all(deletePromises)
    const failedDeletes = responses.filter(response => !response.success)
    
    if (failedDeletes.length === 0) {
      // 所有删除都成功
      customCategories.value.forEach(category => {
        // 从所有分类列表中移除
        const index = availableCategories.value.findIndex(cat => {
          if (typeof cat === 'object' && typeof category === 'object') {
            return cat.id === category.id
          }
          return cat === category
        })
        if (index > -1) {
          availableCategories.value.splice(index, 1)
        }
        
        // 如果当前选择的分类被删除，清空选择
        const categoryName = getCategoryName(category)
        if (form.value.category === categoryName || 
            (typeof form.value.category === 'object' && form.value.category.id === category.id)) {
          form.value.category = ''
        }
      })
      
      customCategories.value = []
      selectedCategories.value = []
      success('所有自定义分类已删除')
    } else {
      error('部分删除失败', {
        description: '部分分类删除失败，请重试'
      })
    }
  } catch (err) {
    console.error('清空自定义分类失败:', err)
    error('删除失败', {
      description: '网络错误，请稍后重试'
    })
  }
}

// 选择图标
const selectIcon = (icon) => {
  // 确保图标值是字符串
  let iconValue = '📝'
  if (icon.url) {
    iconValue = icon.url
  } else if (icon.content && typeof icon.content === 'string') {
    iconValue = icon.content
  } else if (icon.name && typeof icon.name === 'string') {
    iconValue = icon.name
  } else if (typeof icon === 'string') {
    iconValue = icon
  }
  
  form.value.icon = iconValue
  showIconManagementModal.value = false
  success('图标选择成功')
}

// 处理图标文件上传
const handleIconFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 检查文件类型 - 支持更多MIME类型
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'image/pjpeg', 'image/x-png', 'image/bmp', 'image/tiff', 'image/x-icon'
    ]
    
    // 也检查文件扩展名作为备选
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.ico']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      error('文件类型不支持', {
        description: '请选择 JPG、PNG、GIF、WebP、SVG、BMP、TIFF 或 ICO 格式的图片文件'
      })
      event.target.value = '' // 清空文件输入
      return
    }
    
    console.log('文件类型检查通过:', {
      mimeType: file.type,
      extension: fileExtension,
      fileName: file.name
    })
    
    // 检查文件大小（限制为5MB）
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      error('文件过大', {
        description: '图片文件大小不能超过 5MB'
      })
      event.target.value = '' // 清空文件输入
      return
    }
    
    console.log('选择的文件:', file.name, '类型:', file.type, '大小:', file.size)
    iconFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      iconPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 上传图标文件
const uploadIconFile = async () => {
  if (!iconFile.value) return
  
  const file = iconFile.value
  console.log('🔄 开始上传图标文件:', file.name, file.size)
  
  isUploading.value = true
  
  try {
    // 创建FormData
    const formData = new FormData()
    formData.append('file', file)
    
    console.log('📤 调用上传API...')
    const response = await categoriesAPI.uploadIcon(formData)
    console.log('✅ 上传响应:', response)
    
    if (response.success) {
      // 重新加载图标列表
      await loadData()
      
      // 清空文件输入
      iconFile.value = null
      iconPreview.value = ''
      
      // 清空文件选择器
      const fileInput = document.getElementById('icon-file-input')
      if (fileInput) {
        fileInput.value = ''
      }
      
      success('图标上传成功')
      console.log('✅ 图标上传成功，已重新加载列表')
    } else {
      console.error('❌ 上传失败:', response.error)
      error('上传失败', {
        description: response.error || '请检查网络连接后重试'
      })
    }
  } catch (err) {
    console.error('❌ 上传图标异常:', err)
    error('上传失败', {
      description: '网络异常，请稍后重试'
    })
  } finally {
    isUploading.value = false
  }
}

// 添加自定义图标
const addCustomIcon = async () => {
  if (!customIcon.value.trim()) return
  
  const iconContent = customIcon.value.trim()
  console.log('🔄 开始添加文字图标:', iconContent)
  
  isUploading.value = true
  
  try {
    const response = await categoriesAPI.createIcon({
      content: iconContent,
      type: 'text'
    })
    
    console.log('✅ 添加图标响应:', response)
    
    if (response.success) {
      // 重新加载图标列表
      await loadData()
      
      // 清空输入
      customIcon.value = ''
      
      success('图标添加成功')
      console.log('✅ 文字图标添加成功，已重新加载列表')
    } else {
      console.error('❌ 添加图标失败:', response.error)
      error('添加失败', {
        description: response.error || '请检查网络连接后重试'
      })
    }
  } catch (err) {
    console.error('❌ 添加图标异常:', err)
    error('添加失败', {
      description: '网络异常，请稍后重试'
    })
  } finally {
    isUploading.value = false
  }
}

// 删除自定义图标（优先前端删除）
const deleteCustomIcon = async (index) => {
  const icon = customIcons.value[index]
  console.log('🗑️ 要删除的图标:', icon, '索引:', index)
  
  const iconName = icon.content || icon.filename || icon.name || `图标${index + 1}`
  if (!confirm(`确定要删除图标"${iconName}"吗？`)) return
  
  try {
    // 直接从前端删除
    console.log('🗑️ 前端删除图标:', iconName)
    customIcons.value.splice(index, 1)
    
    success('图标已删除', {
      description: '图标已从界面中移除'
    })
    
    // 可选：尝试后端删除，但不影响前端操作
    if (icon.id) {
      try {
        await categoriesAPI.deleteIcon(icon.id)
        console.log('✅ 后端删除成功:', icon.id)
      } catch (err) {
        console.warn('⚠️ 后端删除失败，但前端已删除:', err.message)
      }
    }
    
    console.log('✅ 图标删除完成，剩余图标数量:', customIcons.value.length)
    
  } catch (err) {
    console.error('❌ 删除图标异常:', err)
    error('删除失败', {
      description: '删除过程中发生错误'
    })
  }
}

// 刷新图标列表
const refreshIconList = async () => {
  try {
    console.log('手动刷新图标列表...')
    await loadData()
    success('图标列表已刷新')
  } catch (error) {
    console.error('刷新图标列表失败:', error)
    error('刷新失败', {
      description: '请稍后重试'
    })
  }
}

// 清空所有自定义图标
const clearAllCustomIcons = async () => {
  if (!confirm('确定要清空所有自定义图标吗？此操作不可撤销。')) return
  
  try {
    console.log('开始清空所有图标，当前数量:', customIcons.value.length)
    
    // 尝试使用批量删除的方式
    if (customIcons.value.length > 0) {
      // 选择所有图标
      selectedIcons.value = customIcons.value.map((_, index) => index)
      
      // 调用批量删除
      await deleteSelectedIcons()
    } else {
      success('没有图标需要清空')
    }
  } catch (err) {
    console.error('清空图标失败:', err)
    error('清空失败', {
      description: '网络错误，请稍后重试'
    })
  }
}

// 删除选中的图标（优先前端删除，减少后端依赖）
const deleteSelectedIcons = async () => {
  if (selectedIcons.value.length === 0) return
  
  if (!confirm(`确定要删除选中的 ${selectedIcons.value.length} 个图标吗？`)) return
  
  try {
    console.log('🗑️ 开始删除选中的图标，数量:', selectedIcons.value.length)
    
    // 按索引降序排列，避免删除时索引变化
    const sortedIndexes = [...selectedIcons.value].sort((a, b) => b - a)
    let successCount = 0
    
    // 直接从前端删除，不依赖后端API
    for (const index of sortedIndexes) {
      const icon = customIcons.value[index]
      if (icon) {
        console.log('🗑️ 前端删除图标:', icon.content || icon.filename || icon.id)
        customIcons.value.splice(index, 1)
        successCount++
        
        // 可选：尝试后端删除，但不影响前端操作
        if (icon.id) {
          try {
            await categoriesAPI.deleteIcon(icon.id)
            console.log('✅ 后端删除成功:', icon.id)
          } catch (deleteErr) {
            console.warn('⚠️ 后端删除失败，但前端已删除:', deleteErr.message)
          }
        }
      }
    }
    
    selectedIcons.value = []
    
    success(`已删除 ${successCount} 个图标`, {
      description: '图标已从界面中移除'
    })
    
    console.log('✅ 图标删除完成，剩余图标数量:', customIcons.value.length)
    
  } catch (err) {
    console.error('❌ 删除选中图标失败:', err)
    error('删除失败', {
      description: '删除过程中发生错误'
    })
  }
}

// 提交表单
const handleSubmit = async () => {
  if (isSubmitting.value) {
    console.log('正在提交中，忽略重复请求')
    return
  }
  
  isSubmitting.value = true
  
  // 表单验证
  if (!form.value.name.trim()) {
    error('创建失败', {
      description: '请输入习惯名称',
      duration: 6000
    })
    isSubmitting.value = false
    return
  }

  if (form.value.name.trim().length > 100) {
    error('创建失败', {
      description: '习惯名称不能超过100个字符',
      duration: 6000
    })
    isSubmitting.value = false
    return
  }
  
  if (!form.value.category) {
    form.value.category = '其他'
  }
  
  if (form.value.target < 1 || form.value.target > 100) {
    error('创建失败', {
      description: '目标次数必须在1-100之间',
      duration: 6000
    })
    isSubmitting.value = false
    return
  }
  
  try {
    // 准备提交数据
    // 确保图标值始终有效，使用emoji作为默认图标
    const defaultIcon = '📝'
    let iconValue = form.value.icon
    if (!iconValue || typeof iconValue !== 'string' || iconValue.trim() === '') {
      iconValue = defaultIcon
      console.log('使用默认图标:', defaultIcon)
    }
    
    const submitData = {
      name: form.value.name.trim(),
      icon: iconValue,
      category: form.value.category || '其他',
      target: form.value.target,
      frequency: form.value.frequency || 'daily',
      color: form.value.color || '#007AFF',
      enableComments: form.value.enableComments !== undefined ? form.value.enableComments : true,
      reminderEnabled: Boolean(form.value.reminderEnabled),
      reminderTime: String(form.value.reminderTime || getCurrentTimeString())
    }
    
    if (isEditMode.value) {
      const habitId = parseInt(route.params.id)
      const result = await habitStore.updateHabit(habitId, submitData)
      if (result.success) {
        router.push('/dashboard')
      } else {
        error('更新失败', {
          description: result.error
        })
      }
    } else {
      console.log('开始创建新习惯，提交数据:', submitData)
      const result = await habitStore.createHabit(submitData)
      if (result.success) {
        console.log('创建习惯成功，准备刷新并跳转')
        // 在跳转前强制刷新习惯列表，确保图标正确显示
        setTimeout(async () => {
          try {
            await habitStore.forceRefreshHabits()
            console.log('习惯列表已刷新，现在跳转')
            router.push('/dashboard')
          } catch (refreshErr) {
            console.error('刷新习惯列表失败:', refreshErr)
            // 即使刷新失败也进行跳转
            router.push('/dashboard')
          }
        }, 100)
      } else {
        error('创建失败', {
          description: result.error || '请检查网络连接或稍后重试',
          duration: 8000
        })
      }
    }
  } catch (err) {
    console.error('提交习惯异常:', err)
    error('操作失败', {
      description: '网络错误，请稍后重试'
    })
  } finally {
    isSubmitting.value = false
  }
}

// 删除习惯
const handleDelete = async () => {
  if (confirm('确定要删除这个习惯吗？此操作不可撤销。')) {
    const habitId = parseInt(route.params.id)
    const result = await habitStore.deleteHabit(habitId)
    if (result.success) {
      router.push('/dashboard')
    } else {
      error('删除失败', {
        description: result.error
      })
    }
  }
}

// 生命周期
onMounted(() => {
  loadData()
  
  if (isEditMode.value) {
    const habit = habitStore.getHabitById(route.params.id)
    if (habit) {
      form.value = {
        name: habit.name || '',
        icon: habit.icon || '📚',
        category: habit.category || '',
        frequency: habit.frequency || 'daily',
        target: habit.target || 1,
        color: habit.color || '#007AFF',
        reminderEnabled: habit.reminderEnabled !== undefined ? habit.reminderEnabled : false,
        reminderTime: habit.reminderTime || getCurrentTimeString(),
        enableComments: habit.enableComments !== undefined ? habit.enableComments : true
      }
    }
  }
})
</script>