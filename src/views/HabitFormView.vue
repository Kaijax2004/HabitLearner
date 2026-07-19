<template>
  <AppLayout :title="isEditMode ? '编辑习惯' : '创建习惯'" :show-back-button="true">
    <div class="p-4 lg:p-0">
      <form class="mx-auto max-w-3xl space-y-8" @submit.prevent="handleSubmit">
        <BaseCard title="基本信息">
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">习惯名称</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input-apple"
                placeholder="例如：每日阅读"
              />
            </div>

            <div>
              <div class="mb-2 flex items-center justify-between gap-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">习惯分类</label>
                <button
                  type="button"
                  class="btn-control text-xs"
                  @click="showCategoryModal = true"
                >
                  管理分类
                </button>
              </div>

              <div class="relative">
                <select
                  v-model="form.category"
                  class="input-apple pr-12"
                  required
                  @change="handleCategoryChange"
                >
                  <option value="">请选择分类</option>
                  <option
                    v-for="category in availableCategories"
                    :key="category.id || category.name"
                    :value="category.name"
                  >
                    {{ category.name }}
                  </option>
                  <option value="add-category">+ 添加分类</option>
                </select>

                <button
                  v-if="form.category && isCustomCategory(form.category)"
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  :title="`删除分类：${form.category}`"
                  @click="deleteCategory(form.category)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="选择图标">
          <template #header>
            <div class="flex items-center gap-3">
              <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ totalIconCount }} 个图标</span>
              <button type="button" class="btn-control text-xs" @click="showIconManagementModal = true">
                管理图标
              </button>
            </div>
          </template>

          <div class="grid grid-cols-5 gap-3 sm:grid-cols-6">
            <button
              v-for="icon in availableIcons"
              :key="icon.id"
              type="button"
              class="glass-option relative flex h-12 w-12 items-center justify-center rounded-apple text-xl transition-all duration-200"
              :class="isSelectedIcon(icon) ? 'glass-option-selected scale-[1.06]' : ''"
              :title="icon.name"
              @click="selectIcon(icon)"
            >
              {{ icon.content }}
              <div v-if="isSelectedIcon(icon)" class="glass-check-indicator">
                <svg class="h-5 w-5 text-zinc-950 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>

            <button
              v-for="icon in customIcons"
              :key="icon.id || icon.url || icon.content"
              type="button"
              class="glass-option relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-apple transition-all duration-200"
              :class="isSelectedIcon(icon) ? 'glass-option-selected scale-[1.06]' : ''"
              :title="icon.content || icon.name || '自定义图标'"
              @click="selectIcon(icon)"
            >
              <img
                v-if="isRenderableMediaUrl(icon.url || icon.content)"
                :src="resolveMediaUrl(icon.url || icon.content)"
                alt="自定义图标"
                class="h-full w-full rounded-apple object-cover"
              />
              <span v-else class="text-lg">{{ icon.content || '图' }}</span>
              <div v-if="isSelectedIcon(icon)" class="glass-check-indicator">
                <svg class="h-5 w-5 text-zinc-950 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
        </BaseCard>

        <BaseCard title="目标设置">
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">频率</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="glass-option rounded-apple p-3 transition-all duration-200"
                  :class="form.frequency === 'daily' ? 'glass-option-selected' : ''"
                  @click="form.frequency = 'daily'"
                >
                  <div class="text-center">
                    <div class="font-medium">每日</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">每天完成</div>
                  </div>
                </button>

                <button
                  type="button"
                  class="glass-option rounded-apple p-3 transition-all duration-200"
                  :class="form.frequency === 'weekly' ? 'glass-option-selected' : ''"
                  @click="form.frequency = 'weekly'"
                >
                  <div class="text-center">
                    <div class="font-medium">每周</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">每周完成</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                目标次数（{{ form.frequency === 'daily' ? '每天' : '每周' }}）
              </label>
              <div class="flex items-center space-x-3">
                <button
                  type="button"
                  class="glass-option flex h-10 w-10 items-center justify-center rounded-apple text-gray-600 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300"
                  :disabled="form.target <= 1"
                  @click="decreaseTarget"
                >
                  -
                </button>

                <div class="flex-1 text-center">
                  <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{ form.target }}</span>
                  <span class="ml-1 text-sm text-gray-500 dark:text-gray-400">次</span>
                </div>

                <button
                  type="button"
                  class="glass-option flex h-10 w-10 items-center justify-center rounded-apple text-gray-600 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300"
                  :disabled="form.target >= 100"
                  @click="increaseTarget"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="每日打卡留言">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">启用首次留言</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">每天首次打卡时弹出留言输入框</div>
            </div>

            <button
              type="button"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
              :class="form.enableComments ? 'bg-zinc-950' : 'bg-gray-200 dark:bg-gray-700'"
              @click="form.enableComments = !form.enableComments"
            >
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200" :class="form.enableComments ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
          </div>
        </BaseCard>

        <BaseCard title="选择颜色">
          <div class="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-7">
            <button
              v-for="color in availableColors"
              :key="color.value"
              type="button"
              class="glass-option relative h-14 rounded-[20px] p-1.5 transition-all duration-200"
              :class="isSelectedColor(color) ? 'glass-option-selected scale-[1.04]' : ''"
              :title="color.name"
              @click="form.color = color.value"
            >
              <div class="absolute inset-[6px] rounded-[16px] border border-white/30 dark:border-white/10" :style="getColorPreviewStyle(color)"></div>
              <div class="absolute inset-[6px] rounded-[16px] bg-gradient-to-br from-white/30 via-transparent to-black/10"></div>
              <div v-if="isSelectedColor(color)" class="glass-check-indicator">
                <svg class="h-5 w-5" :class="color.checkClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </button>
          </div>
        </BaseCard>

        <BaseCard title="提醒设置">
          <div class="space-y-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <div class="font-medium text-gray-900 dark:text-gray-100">开启提醒</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">每天定时提醒你完成习惯</div>
              </div>

              <button
                type="button"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                :class="form.reminderEnabled ? 'bg-zinc-950' : 'bg-gray-200 dark:bg-gray-700'"
                @click="form.reminderEnabled = !form.reminderEnabled"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200" :class="form.reminderEnabled ? 'translate-x-6' : 'translate-x-1'"></span>
              </button>
            </div>

            <div v-if="form.reminderEnabled" class="mt-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">提醒时间</label>
                <button
                  type="button"
                  class="btn-control text-xs"
                  @click="addReminderTime"
                >
                  添加提醒时间
                </button>
              </div>

              <div class="space-y-3">
                <div
                  v-for="(reminderTime, index) in form.reminderTimes"
                  :key="`reminder-time-${index}`"
                  class="rounded-apple border border-zinc-200/80 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/40"
                >
                  <div class="mb-2 flex items-center justify-between gap-3">
                    <span class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      提醒 {{ index + 1 }}
                    </span>
                    <button
                      v-if="form.reminderTimes.length > 1"
                      type="button"
                      class="text-xs text-red-500 transition-colors hover:text-red-600 dark:hover:text-red-300"
                      @click="removeReminderTime(index)"
                    >
                      删除
                    </button>
                  </div>

                  <TimePicker
                    :model-value="reminderTime"
                    @update:model-value="value => updateReminderTime(index, value)"
                  />
                </div>
              </div>
            </div>
          </div>
        </BaseCard>

        <div class="space-y-3">
          <button type="submit" class="btn-primary w-full" :disabled="isSubmitting || habitStore.isLoading">
            {{ isSubmitting || habitStore.isLoading ? (isEditMode ? '更新中...' : '创建中...') : (isEditMode ? '更新习惯' : '创建习惯') }}
          </button>
          <button v-if="isEditMode" type="button" class="btn-danger w-full" @click="handleDelete">删除习惯</button>
        </div>
      </form>
    </div>

    <Teleport to="body">
      <div
        v-if="showCategoryModal"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
        @click.self="showCategoryModal = false"
      >
        <div class="glass-effect max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-apple p-6 shadow-2xl">
          <div class="mb-6 text-center">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">管理分类</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">添加、编辑和管理你的自定义分类</p>
          </div>

          <div class="mb-6 flex gap-3">
            <input
              v-model="customCategory"
              type="text"
              class="input-apple flex-1"
              placeholder="例如：健康、学习、工作"
              @keyup.enter="addCustomCategory"
            />
            <button type="button" class="btn-primary" :disabled="!customCategory.trim()" @click="addCustomCategory">
              添加
            </button>
          </div>

          <div v-if="customCategories.length > 0" class="space-y-4">
            <div class="flex items-center justify-between gap-3">
              <h4 class="font-medium text-gray-900 dark:text-gray-100">我的自定义分类</h4>
              <div class="flex items-center gap-3">
                <button
                  v-if="selectedCategories.length > 0"
                  type="button"
                  class="text-sm text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  @click="deleteSelectedCategories"
                >
                  删除选中（{{ selectedCategories.length }}）
                </button>
                <button
                  type="button"
                  class="text-sm text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  @click="clearAllCustomCategories"
                >
                  删除全部
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-2">
              <div
                v-for="category in customCategories"
                :key="category.id || category.name"
                class="flex items-center justify-between rounded-apple bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div class="flex items-center space-x-3">
                  <input v-model="selectedCategories" type="checkbox" :value="category.name" class="h-4 w-4 rounded text-primary-600 focus:ring-primary-500" />
                  <div class="flex items-center space-x-2">
                    <div class="h-4 w-4 rounded-full" :style="{ backgroundColor: getCategoryColor(category.name) }"></div>
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ category.name }}</span>
                  </div>
                </div>

                <button
                  type="button"
                  class="p-1 text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  :title="`删除分类：${category.name}`"
                  @click="deleteCategory(category)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button type="button" class="btn-secondary" @click="showCategoryModal = false">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showIconManagementModal"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
        @click.self="showIconManagementModal = false"
      >
        <div class="glass-effect max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-apple p-6 shadow-2xl">
          <div class="mb-6 text-center">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">管理图标</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">上传、选择和清理你的自定义图标</p>
          </div>

          <div class="mb-8 space-y-6">
            <div class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div class="mb-3 flex items-center">
                <div class="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800">
                  <svg class="h-4 w-4 text-zinc-700 dark:text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">上传图片图标</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">支持一次选择多个文件，也支持直接选择文件夹</p>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="icon-file-input"
                    ref="iconFileInput"
                    type="file"
                    class="input-apple flex-1"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,image/bmp,image/tiff,image/x-icon"
                    multiple
                    webkitdirectory
                    @change="handleIconFileChange"
                  />

                  <button
                    v-if="iconFiles.length > 0"
                    type="button"
                    class="btn-primary whitespace-nowrap"
                    :disabled="isUploading"
                    @click="uploadIconFiles"
                  >
                    {{ isUploading ? '上传中...' : `上传 ${iconFiles.length} 个图标` }}
                  </button>
                </div>

                <div v-if="iconFiles.length > 0" class="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <p class="mb-2 text-xs text-gray-500 dark:text-gray-400">已选择 {{ iconFiles.length }} 个图片，可一次批量上传</p>
                  <div class="max-h-72 space-y-2 overflow-y-auto pr-1">
                    <div
                      v-for="fileItem in iconFiles"
                      :key="fileItem.key"
                      class="flex items-center space-x-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50"
                    >
                      <img :src="fileItem.previewUrl" :alt="fileItem.name" class="h-10 w-10 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800" />
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{{ fileItem.name }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(fileItem.size) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div class="mb-3 flex items-center">
                <div class="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800">
                  <svg class="h-4 w-4 text-zinc-700 dark:text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">添加文本图标</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">可输入 emoji、文字或单字符图标</p>
                </div>
              </div>

              <div class="flex gap-3">
                <input
                  v-model="customIcon"
                  type="text"
                  class="input-apple flex-1"
                  placeholder="例如：📖、🎯、💪、学"
                  maxlength="10"
                  @keyup.enter="addCustomIcon"
                />
                <button type="button" class="btn-primary" :disabled="!customIcon.trim() || isUploading" @click="addCustomIcon">
                  添加
                </button>
              </div>
            </div>
          </div>

          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h4 class="font-medium text-gray-900 dark:text-gray-100">自定义图标</h4>
            <div class="flex flex-wrap items-center gap-3">
              <button type="button" class="btn-control text-xs" @click="refreshIconList">刷新</button>
              <button
                v-if="selectedIcons.length > 0"
                type="button"
                class="text-sm text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                @click="deleteSelectedIcons"
              >
                删除选中（{{ selectedIcons.length }}）
              </button>
              <button
                v-if="customIcons.length > 0"
                type="button"
                class="text-sm text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                @click="clearAllCustomIcons"
              >
                清空全部
              </button>
            </div>
          </div>

          <div v-if="customIcons.length > 0" class="grid grid-cols-3 gap-4 sm:grid-cols-5 md:grid-cols-6">
            <div
              v-for="(icon, index) in customIcons"
              :key="icon.id || icon.url || `${icon.content}-${index}`"
              class="group relative rounded-2xl border border-transparent p-2 transition-all hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50"
            >
              <label class="absolute left-2 top-2 z-10">
                <input v-model="selectedIcons" type="checkbox" :value="index" class="sr-only" />
                <span class="glass-option flex h-6 w-6 items-center justify-center rounded-full" :class="selectedIcons.includes(index) ? 'glass-option-selected' : ''">
                  <svg v-if="selectedIcons.includes(index)" class="h-3.5 w-3.5 text-zinc-950 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              </label>

              <button
                type="button"
                class="glass-option mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-apple border border-zinc-200 bg-white transition-all dark:border-zinc-800 dark:bg-zinc-950 sm:h-12 sm:w-12"
                :class="isSelectedIcon(icon) ? 'glass-option-selected' : ''"
                @click="selectIcon(icon)"
              >
                <img
                  v-if="isRenderableMediaUrl(icon.url || icon.content)"
                  :src="resolveMediaUrl(icon.url || icon.content)"
                  alt="自定义图标"
                  class="h-full w-full rounded-apple object-cover"
                />
                <span v-else class="text-lg text-gray-900 dark:text-gray-100">{{ icon.content || '图' }}</span>
              </button>

              <button
                type="button"
                class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-75 transition-colors hover:bg-red-600 hover:opacity-100"
                :title="`删除图标：${icon.content || icon.name || icon.filename || '图标'}`"
                @click="deleteCustomIcon(index)"
              >
                ×
              </button>
            </div>
          </div>

          <div v-else class="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            还没有自定义图标，先上传图片或添加文本图标。
          </div>

          <div class="mt-6 flex justify-end">
            <button type="button" class="btn-secondary" @click="showIconManagementModal = false">关闭</button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHabitStore } from '@/stores/habit'
import { useAuthStore } from '@/stores/auth'
import * as categoriesAPI from '@/api/categories.js'
import { resolveMediaUrl, isRenderableMediaUrl } from '@/utils/media.js'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/AppLayout.vue'
import BaseCard from '@/components/BaseCard.vue'
import TimePicker from '@/components/TimePicker.vue'

const router = useRouter()
const route = useRoute()
const habitStore = useHabitStore()
const authStore = useAuthStore()
const { success, error, warning } = useToast()

const DEFAULT_CATEGORIES = [
  { id: 'default-health', name: '健康', isDefault: true },
  { id: 'default-study', name: '学习', isDefault: true },
  { id: 'default-work', name: '工作', isDefault: true },
  { id: 'default-life', name: '日常', isDefault: true }
]

const DEFAULT_ICONS = [
  { id: 'book', content: '📚', name: '学习' },
  { id: 'run', content: '🏃', name: '运动' },
  { id: 'muscle', content: '💪', name: '健身' },
  { id: 'meditate', content: '🧘', name: '冥想' },
  { id: 'target', content: '🎯', name: '目标' },
  { id: 'write', content: '✍️', name: '写作' },
  { id: 'idea', content: '💡', name: '灵感' },
  { id: 'star', content: '⭐', name: '成就' },
  { id: 'art', content: '🎨', name: '艺术' },
  { id: 'music', content: '🎵', name: '音乐' },
  { id: 'apple', content: '🍎', name: '饮食' },
  { id: 'water', content: '💧', name: '喝水' },
  { id: 'plant', content: '🌱', name: '成长' },
  { id: 'read', content: '📖', name: '阅读' },
  { id: 'home', content: '🏠', name: '家庭' },
  { id: 'car', content: '🚗', name: '出行' },
  { id: 'plane', content: '✈️', name: '旅行' },
  { id: 'game', content: '🎮', name: '娱乐' },
  { id: 'movie', content: '🎬', name: '电影' },
  { id: 'note', content: '📝', name: '记录' }
]

const COLOR_OPTIONS = [
  { value: '#0f172a', name: 'Obsidian', background: 'linear-gradient(135deg, #020617 0%, #1e293b 100%)', checkClass: 'text-white' },
  { value: '#111827', name: 'Carbon', background: 'linear-gradient(135deg, #030712 0%, #1f2937 100%)', checkClass: 'text-white' },
  { value: '#334155', name: 'Slate', background: 'linear-gradient(135deg, #1e293b 0%, #64748b 100%)', checkClass: 'text-white' },
  { value: '#4b5563', name: 'Steel', background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)', checkClass: 'text-white' },
  { value: '#7c8b9d', name: 'Mist', background: 'linear-gradient(135deg, #64748b 0%, #cbd5e1 100%)', checkClass: 'text-zinc-900' },
  { value: '#d6d3d1', name: 'Pearl', background: 'linear-gradient(135deg, #f5f5f4 0%, #d6d3d1 100%)', checkClass: 'text-zinc-900' },
  { value: '#3f3f46', name: 'Stone', background: 'linear-gradient(135deg, #27272a 0%, #71717a 100%)', checkClass: 'text-white' },
  { value: '#2f3e46', name: 'Pine', background: 'linear-gradient(135deg, #1f2937 0%, #3f4f57 100%)', checkClass: 'text-white' },
  { value: '#166534', name: 'Forest', background: 'linear-gradient(135deg, #14532d 0%, #22c55e 100%)', checkClass: 'text-white' },
  { value: '#0f766e', name: 'Teal', background: 'linear-gradient(135deg, #134e4a 0%, #14b8a6 100%)', checkClass: 'text-white' },
  { value: '#7f1d1d', name: 'Bordeaux', background: 'linear-gradient(135deg, #450a0a 0%, #b91c1c 100%)', checkClass: 'text-white' },
  { value: '#7c2d12', name: 'Amber', background: 'linear-gradient(135deg, #7c2d12 0%, #f59e0b 100%)', checkClass: 'text-white' },
  { value: '#581c87', name: 'Plum', background: 'linear-gradient(135deg, #3b0764 0%, #a855f7 100%)', checkClass: 'text-white' },
  { value: '#1d4ed8', name: 'Navy', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', checkClass: 'text-white' }
]

const isEditMode = computed(() => Boolean(route.params.id))

const nowTime = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const getDefaultReminderSettings = () => {
  try {
    const user = authStore.user || JSON.parse(localStorage.getItem('user') || '{}')
    const key = user?.id ? `notificationSettings_${user.id}` : 'notificationSettings'
    const raw = localStorage.getItem(key)
    if (!raw) return { enabled: false, time: nowTime() }

    const settings = JSON.parse(raw)
    return {
      enabled: false,
      time: settings.reminderTime || settings.time || nowTime()
    }
  } catch {
    return { enabled: false, time: nowTime() }
  }
}

const form = ref({
  name: '',
  icon: '📚',
  category: '',
  frequency: 'daily',
  target: 1,
  color: '#0f172a',
  reminderEnabled: getDefaultReminderSettings().enabled,
  reminderTimes: [getDefaultReminderSettings().time],
  reminderTime: getDefaultReminderSettings().time,
  enableComments: false
})

const showCategoryModal = ref(false)
const showIconManagementModal = ref(false)
const customCategory = ref('')
const customIcon = ref('')
const iconFileInput = ref(null)
const iconFiles = ref([])
const isUploading = ref(false)
const selectedIcons = ref([])
const selectedCategories = ref([])
const isSubmitting = ref(false)
const isLoading = ref(false)
const availableCategories = ref([...DEFAULT_CATEGORIES])
const customCategories = ref([])
const customIcons = ref([])
const availableIcons = ref(DEFAULT_ICONS)
const availableColors = ref(COLOR_OPTIONS)

const iconAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff', 'image/x-icon']
const iconAllowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff', '.ico']
const iconMaxSize = 5 * 1024 * 1024

const totalIconCount = computed(() => availableIcons.value.length + customIcons.value.length)

const normalizeReminderTimes = (times = []) => {
  const source = Array.isArray(times) ? times : [times]
  const normalized = [...new Set(source
    .map(time => (typeof time === 'string' ? time.trim() : ''))
    .filter(time => /^\d{2}:\d{2}$/.test(time))
  )].sort()

  return normalized
}

const syncReminderTimeFallback = () => {
  const normalized = normalizeReminderTimes(form.value.reminderTimes)
  const fallbackTime = normalized[0] || nowTime()
  form.value.reminderTimes = normalized.length ? normalized : [fallbackTime]
  form.value.reminderTime = form.value.reminderTimes[0]
}

const normalizeMediaKey = (value) => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed

  const resolved = resolveMediaUrl(trimmed)
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
    const parsed = new URL(resolved, base)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  }
}

const isSameMedia = (left, right) => normalizeMediaKey(left) === normalizeMediaKey(right)

const getIconValue = (icon) => {
  if (icon?.url) return icon.url
  if (typeof icon?.content === 'string') return icon.content
  if (typeof icon?.name === 'string') return icon.name
  if (typeof icon === 'string') return icon
  return ''
}

const isSelectedIcon = (icon) => isSameMedia(form.value.icon, getIconValue(icon))
const isSelectedColor = (colorOption) => form.value.color === colorOption.value

const getColorPreviewStyle = (colorOption) => ({
  background: colorOption.background,
  boxShadow: isSelectedColor(colorOption)
    ? 'inset 0 1px 0 rgba(255,255,255,0.45), 0 12px 22px rgba(15,23,42,0.18)'
    : 'inset 0 1px 0 rgba(255,255,255,0.18)'
})

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const getCategoryColor = (categoryName) => {
  const colorMap = {
    健康: '#166534',
    学习: '#1d4ed8',
    工作: '#334155',
    日常: '#7c2d12',
    其他: '#71717a'
  }
  return colorMap[categoryName] || '#71717a'
}

const isCustomCategory = (categoryName) => customCategories.value.some(item => item.name === categoryName)

const resetCategoryState = () => {
  availableCategories.value = [...DEFAULT_CATEGORIES]
  customCategories.value = []
}

const loadCategories = async () => {
  const response = await categoriesAPI.getCategories()
  if (!response.success) {
    resetCategoryState()
    warning('获取分类失败', { description: response.error || '已使用默认分类' })
    return
  }

  const rawCategories = Array.isArray(response.data) ? response.data : []
  const userCategories = rawCategories
    .filter(category => category && category.name && !category.isDefault)
    .map(category => ({
      id: category.id || category.name,
      name: category.name,
      color: category.color || getCategoryColor(category.name),
      isDefault: false,
      userId: category.userId
    }))

  customCategories.value = userCategories
  availableCategories.value = [...DEFAULT_CATEGORIES, ...userCategories]
}

const loadIcons = async () => {
  const response = await categoriesAPI.getIcons()
  if (!response.success) {
    customIcons.value = []
    return
  }

  const rawIcons = Array.isArray(response.data) ? response.data : []
  customIcons.value = rawIcons
    .filter(icon => icon && (icon.id || icon.content || icon.url))
    .map(icon => ({
      ...icon,
      url: icon.url ? resolveMediaUrl(icon.url) : ''
    }))
}

const loadData = async () => {
  isLoading.value = true
  try {
    await Promise.all([loadCategories(), loadIcons()])
  } finally {
    isLoading.value = false
  }
}

const handleCategoryChange = () => {
  if (form.value.category === 'add-category') {
    form.value.category = ''
    showCategoryModal.value = true
  }
}

const addReminderTime = () => {
  if (form.value.reminderTimes.length >= 5) {
    warning('最多添加 5 个提醒时间')
    return
  }

  const nextTimes = [...form.value.reminderTimes, form.value.reminderTimes.at(-1) || nowTime()]
  form.value.reminderTimes = nextTimes
  syncReminderTimeFallback()
}

const updateReminderTime = (index, value) => {
  const nextTimes = [...form.value.reminderTimes]
  nextTimes[index] = value
  form.value.reminderTimes = nextTimes
  syncReminderTimeFallback()
}

const removeReminderTime = (index) => {
  const nextTimes = form.value.reminderTimes.filter((_, currentIndex) => currentIndex !== index)
  form.value.reminderTimes = nextTimes.length ? nextTimes : [nowTime()]
  syncReminderTimeFallback()
}

const increaseTarget = () => {
  if (form.value.target < 100) form.value.target += 1
}

const decreaseTarget = () => {
  if (form.value.target > 1) form.value.target -= 1
}

const addCustomCategory = async () => {
  const categoryName = customCategory.value.trim()
  if (!categoryName) return

  const duplicate = availableCategories.value.some(item => item.name === categoryName)
  if (duplicate) {
    warning('分类已存在')
    return
  }

  try {
    const response = await categoriesAPI.createCategory(categoryName)
    if (!response.success) {
      error('添加失败', { description: response.error || '请稍后重试' })
      return
    }

    const newCategory = {
      id: response.data?.id || categoryName,
      name: response.data?.name || categoryName,
      color: response.data?.color || getCategoryColor(categoryName),
      isDefault: false,
      userId: response.data?.userId
    }

    customCategories.value = [...customCategories.value, newCategory]
    availableCategories.value = [...DEFAULT_CATEGORIES, ...customCategories.value]
    form.value.category = newCategory.name
    customCategory.value = ''
    showCategoryModal.value = false
    success('分类添加成功')
  } catch (err) {
    error('添加失败', { description: err.message || '网络错误，请稍后重试' })
  }
}

const removeCategoryFromState = (categoryName) => {
  customCategories.value = customCategories.value.filter(item => item.name !== categoryName)
  availableCategories.value = [...DEFAULT_CATEGORIES, ...customCategories.value]
  selectedCategories.value = selectedCategories.value.filter(name => name !== categoryName)
  if (form.value.category === categoryName) form.value.category = ''
}

const deleteCategory = async (category) => {
  const categoryName = typeof category === 'string' ? category : category.name
  const categoryId = typeof category === 'string'
    ? customCategories.value.find(item => item.name === category)?.id || categoryName
    : category.id || category.name

  if (!categoryName || !confirm(`确定要删除分类“${categoryName}”吗？`)) return

  try {
    const response = await categoriesAPI.deleteCategory(categoryId)
    if (!response.success) {
      error('删除失败', { description: response.error || '请稍后重试' })
      return
    }

    removeCategoryFromState(categoryName)
    success('分类已删除')
  } catch (err) {
    error('删除失败', { description: err.message || '网络错误，请稍后重试' })
  }
}

const deleteSelectedCategories = async () => {
  if (selectedCategories.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedCategories.value.length} 个分类吗？`)) return

  try {
    await Promise.all(selectedCategories.value.map(name => {
      const category = customCategories.value.find(item => item.name === name)
      return categoriesAPI.deleteCategory(category?.id || name)
    }))

    selectedCategories.value.forEach(removeCategoryFromState)
    selectedCategories.value = []
    success('已删除选中分类')
  } catch (err) {
    error('删除失败', { description: err.message || '网络错误，请稍后重试' })
  }
}

const clearAllCustomCategories = async () => {
  if (customCategories.value.length === 0) return
  if (!confirm('确定要删除全部自定义分类吗？此操作不可撤销。')) return

  try {
    await Promise.all(customCategories.value.map(category => categoriesAPI.deleteCategory(category.id || category.name)))
    resetCategoryState()
    selectedCategories.value = []
    success('已清空自定义分类')
  } catch (err) {
    error('清空失败', { description: err.message || '网络错误，请稍后重试' })
  }
}

const selectIcon = (icon) => {
  const iconValue = getIconValue(icon)
  if (!iconValue) return
  form.value.icon = iconValue
}

const clearIconFiles = () => {
  iconFiles.value.forEach(item => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
  })
  iconFiles.value = []
  if (iconFileInput.value) iconFileInput.value.value = ''
}

const createIconFileEntry = (file, index) => ({
  key: `${file.name}-${file.size}-${file.lastModified}-${index}`,
  file,
  name: file.name,
  size: file.size,
  previewUrl: URL.createObjectURL(file)
})

const handleIconFileChange = (event) => {
  const files = Array.from(event.target.files || [])
  clearIconFiles()
  if (!files.length) return

  const validFiles = []
  const skippedFiles = []

  files.forEach((file, index) => {
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    const typeValid = iconAllowedTypes.includes(file.type) || iconAllowedExtensions.includes(extension)
    if (!typeValid || file.size > iconMaxSize) {
      skippedFiles.push(file.name)
      return
    }

    validFiles.push(createIconFileEntry(file, index))
  })

  if (!validFiles.length) {
    error('没有可用图片', { description: '请选择 JPG、PNG、GIF、WebP、SVG、BMP、TIFF 或 ICO 格式，单个文件不超过 5MB。' })
    return
  }

  iconFiles.value = validFiles

  if (skippedFiles.length > 0) {
    warning('部分文件已跳过', {
      description: `已加载 ${validFiles.length} 个文件，跳过 ${skippedFiles.length} 个无效文件。`
    })
  }
}

const uploadIconFiles = async () => {
  if (isUploading.value || iconFiles.value.length === 0) return
  isUploading.value = true

  try {
    let successCount = 0
    const failedFiles = []

    for (const item of iconFiles.value) {
      const formData = new FormData()
      formData.append('file', item.file)
      const response = await categoriesAPI.uploadIcon(formData)

      if (response?.success) successCount += 1
      else failedFiles.push(item.name)
    }

    if (successCount > 0) await loadIcons()
    clearIconFiles()

    if (failedFiles.length === 0) {
      success('图标上传成功', { description: `已上传 ${successCount} 个图标。` })
    } else if (successCount > 0) {
      warning('部分图标上传失败', { description: `成功 ${successCount} 个，失败 ${failedFiles.length} 个。` })
    } else {
      error('上传失败', { description: '所有图片上传失败，请检查网络或图片格式。' })
    }
  } catch (err) {
    error('上传失败', { description: err.message || '网络错误，请稍后重试' })
  } finally {
    isUploading.value = false
  }
}

const addCustomIcon = async () => {
  const iconContent = customIcon.value.trim()
  if (!iconContent) return

  isUploading.value = true
  try {
    const response = await categoriesAPI.createIcon({ content: iconContent, type: 'text' })
    if (!response.success) {
      error('添加失败', { description: response.error || '请稍后重试' })
      return
    }

    customIcon.value = ''
    await loadIcons()
    success('图标添加成功')
  } catch (err) {
    error('添加失败', { description: err.message || '网络错误，请稍后重试' })
  } finally {
    isUploading.value = false
  }
}

const deleteCustomIcon = async (index) => {
  const icon = customIcons.value[index]
  if (!icon) return

  const iconName = icon.content || icon.filename || icon.name || `图标 ${index + 1}`
  if (!confirm(`确定要删除图标“${iconName}”吗？`)) return

  try {
    if (icon.id) {
      await categoriesAPI.deleteIcon(icon.id)
    }

    customIcons.value.splice(index, 1)
    selectedIcons.value = selectedIcons.value.filter(item => item !== index).map(item => (item > index ? item - 1 : item))
    success('图标已删除')
  } catch (err) {
    error('删除失败', { description: err.message || '网络错误，请稍后重试' })
  }
}

const deleteSelectedIcons = async () => {
  if (selectedIcons.value.length === 0) return
  if (!confirm(`确定要删除选中的 ${selectedIcons.value.length} 个图标吗？`)) return

  try {
    const sortedIndexes = [...selectedIcons.value].sort((a, b) => b - a)
    for (const index of sortedIndexes) {
      const icon = customIcons.value[index]
      if (icon?.id) {
        await categoriesAPI.deleteIcon(icon.id)
      }
      customIcons.value.splice(index, 1)
    }

    selectedIcons.value = []
    success('已删除选中图标')
  } catch (err) {
    error('删除失败', { description: err.message || '网络错误，请稍后重试' })
  }
}

const clearAllCustomIcons = async () => {
  if (customIcons.value.length === 0) return
  if (!confirm('确定要清空全部自定义图标吗？此操作不可撤销。')) return

  try {
    if (typeof categoriesAPI.clearAllIcons === 'function') {
      const response = await categoriesAPI.clearAllIcons()
      if (!response.success) {
        throw new Error(response.error || '清空失败')
      }
    } else {
      await Promise.all(customIcons.value.map(icon => icon.id ? categoriesAPI.deleteIcon(icon.id) : Promise.resolve()))
    }

    customIcons.value = []
    selectedIcons.value = []
    success('已清空自定义图标')
  } catch (err) {
    error('清空失败', { description: err.message || '网络错误，请稍后重试' })
  }
}

const refreshIconList = async () => {
  await loadIcons()
  success('图标列表已刷新')
}

const buildSubmitData = () => ({
  reminderTimes: form.value.reminderEnabled ? normalizeReminderTimes(form.value.reminderTimes) : [],
  name: form.value.name.trim(),
  icon: form.value.icon || '📚',
  category: form.value.category || '其他',
  target: Number(form.value.target) || 1,
  frequency: form.value.frequency || 'daily',
  color: form.value.color || '#0f172a',
  enableComments: Boolean(form.value.enableComments),
  reminderEnabled: Boolean(form.value.reminderEnabled),
  reminderTime: String((form.value.reminderEnabled ? normalizeReminderTimes(form.value.reminderTimes)[0] : '') || nowTime())
})

const initFormFromHabit = () => {
  if (!isEditMode.value) return

  const habit = habitStore.getHabitById(route.params.id)
  if (!habit) return

  form.value = {
    name: habit.name || '',
    icon: habit.icon || '📚',
    category: habit.category || '',
    frequency: habit.frequency || 'daily',
    target: Number(habit.target) || 1,
    color: habit.color || '#0f172a',
    reminderEnabled: habit.reminderEnabled ?? false,
    reminderTimes: normalizeReminderTimes(habit.reminderTimes || habit.reminderTime || getDefaultReminderSettings().time),
    reminderTime: habit.reminderTime || normalizeReminderTimes(habit.reminderTimes || habit.reminderTime || nowTime())[0] || nowTime(),
    enableComments: habit.enableComments ?? false
  }

  syncReminderTimeFallback()
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  const trimmedName = form.value.name.trim()
  if (!trimmedName) {
    error('保存失败', { description: '请输入习惯名称。' })
    return
  }

  if (trimmedName.length > 100) {
    error('保存失败', { description: '习惯名称不能超过 100 个字符。' })
    return
  }

  if (form.value.target < 1 || form.value.target > 100) {
    error('保存失败', { description: '目标次数必须在 1 到 100 之间。' })
    return
  }

  isSubmitting.value = true
  try {
    const submitData = buildSubmitData()

    if (isEditMode.value) {
      const result = await habitStore.updateHabit(parseInt(route.params.id, 10), submitData)
      if (!result.success) {
        error('更新失败', { description: result.error || '请稍后重试' })
        return
      }

      success('习惯已更新')
      router.push('/dashboard')
      return
    }

    const result = await habitStore.createHabit(submitData)
    if (!result.success) {
      error('创建失败', { description: result.error || '请稍后重试' })
      return
    }

    await habitStore.forceRefreshHabits()
    success('习惯创建成功')
    router.push('/dashboard')
  } catch (err) {
    error('操作失败', { description: err.message || '网络错误，请稍后重试' })
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  const habitId = parseInt(route.params.id, 10)
  if (!habitId) return
  if (!confirm('确定要删除这个习惯吗？此操作不可撤销。')) return

  try {
    const result = await habitStore.deleteHabit(habitId)
    if (!result.success) {
      error('删除失败', { description: result.error || '请稍后重试' })
      return
    }

    success('习惯已删除')
    router.push('/dashboard')
  } catch (err) {
    error('删除失败', { description: err.message || '网络错误，请稍后重试' })
  }
}

watch(() => route.params.id, () => {
  initFormFromHabit()
})

watch(() => form.value.reminderEnabled, (enabled) => {
  if (enabled) {
    syncReminderTimeFallback()
  }
})

onMounted(async () => {
  await loadData()

  if (isEditMode.value && !habitStore.habits.length) {
    await habitStore.fetchHabits()
  }

  initFormFromHabit()
  syncReminderTimeFallback()
})

onBeforeUnmount(() => {
  clearIconFiles()
})
</script>
