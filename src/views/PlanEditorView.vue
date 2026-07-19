<template>
  <AppLayout title="计划编辑" :showBackButton="true" :onBack="handleBack">
    <div class="plan-editor-shell mx-auto max-w-[96rem] px-3 pb-20 pt-4 sm:px-6 lg:px-8">
      <div class="plan-editor-surface mx-auto w-full max-w-[88rem]">
        <header class="mb-8 space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <span class="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                <span class="h-2 w-2 rounded-full" :class="saveDotClass"></span>
                <span>{{ saveStatusText }}</span>
              </span>
              <span
                v-if="selectedBlockCount"
                class="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                <span>已选 {{ selectedBlockCount }} 块</span>
                <button type="button" class="text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white" @click="clearSelectedBlocks">清空</button>
              </span>
              <button
                type="button"
                class="btn-ghost ai-quick-menu-trigger px-3 py-2 text-sm"
                title="Ctrl / Command + Shift + K"
                @click="openAiPanel('outline')"
              >
                AI 智能助手
              </button>
              <button type="button" class="btn-ghost px-3 py-2 text-sm" @click="triggerImport">导入</button>
              <button type="button" class="btn-ghost px-3 py-2 text-sm" @click="toggleExportMenu">导出</button>
              <button
                v-if="planId"
                type="button"
                class="btn-ghost px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                @click="deleteCurrentPlan"
              >
                删除计划
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">{{ statusLabel }}</span>
              <span class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">{{ priorityLabel }}</span>
              <span class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">{{ typeLabel }}</span>
              <span v-if="dueDate" class="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-900">截止 {{ dueDate }}</span>
            </div>
          </div>

          <div class="space-y-4">
            <textarea
              ref="titleRef"
              v-model="title"
              class="plan-title-input"
              rows="1"
              placeholder="无标题"
              @input="handleTitleInput"
            />

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
              <label class="plan-meta-field" :class="isCustomPlanType ? 'lg:col-span-2' : 'lg:col-span-3'">
                <span>状态</span>
                <select v-model="status" @change="markDirty">
                  <option value="not_started">未开始</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="archived">已归档</option>
                </select>
              </label>
              <label class="plan-meta-field" :class="isCustomPlanType ? 'lg:col-span-2' : 'lg:col-span-3'">
                <span>优先级</span>
                <select v-model="priority" @change="markDirty">
                  <option value="low">低优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="high">高优先级</option>
                </select>
              </label>
              <label class="plan-meta-field" :class="isCustomPlanType ? 'lg:col-span-6' : 'lg:col-span-3'">
                <span>类型</span>
                <div class="plan-meta-type-row" :class="{ 'plan-meta-type-row-custom': isCustomPlanType }">
                  <select v-model="planType" @change="markDirty">
                    <option value="project">项目</option>
                    <option value="task">任务</option>
                    <option value="goal">目标</option>
                    <option value="custom">自定义</option>
                  </select>
                  <input
                    v-if="isCustomPlanType"
                    v-model.trim="customTypeName"
                    class="plan-meta-type-input"
                    type="text"
                    maxlength="50"
                    placeholder="例如：会议、灵感、复盘、研究"
                    @input="markDirty"
                  />
                </div>
              </label>
              <label class="plan-meta-field" :class="isCustomPlanType ? 'lg:col-span-2' : 'lg:col-span-3'">
                <span>截止日期</span>
                <input v-model="dueDate" type="date" @change="markDirty" />
              </label>
            </div>
          </div>
        </header>

        <div v-if="isLoading" class="py-24 text-center text-zinc-500 dark:text-zinc-400">正在加载计划...</div>

        <section v-else class="plan-document">
          <div v-if="!blocks.length" class="plan-empty-state" @click="createFirstBlock">
            <div class="text-lg font-semibold text-zinc-900 dark:text-white">开始写计划</div>
            <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              输入空行后按 <code>/</code> 打开命令菜单，或者点击这里插入第一行。
            </p>
          </div>

          <div
            v-for="(block, index) in blocks"
            :key="block.id"
            :data-block-id="String(block.id)"
            class="plan-row"
            :class="{
              'plan-row-active': activeBlockId === block.id,
              'plan-row-selected': selectedBlockIds.has(block.id),
              'plan-row-drop-before': dragState.overIndex === index && dragState.position === 'before' && !dragState.draggingIds.includes(block.id),
              'plan-row-drop-after': dragState.overIndex === index && dragState.position === 'after' && !dragState.draggingIds.includes(block.id),
              'plan-row-dragging': dragState.draggingIds.includes(block.id)
            }"
            @mouseenter="hoveredBlockId = block.id; extendBlockSelection(index)"
            @mouseleave="hoveredBlockId = null"
            @dragover.prevent="onRowDragOver($event, index)"
            @drop.prevent="onRowDrop(index)"
          >
            <div class="plan-row-gutter">
              <button
                type="button"
                class="plan-row-select"
                :class="{
                  'opacity-100': hoveredBlockId === block.id || activeBlockId === block.id || selectedBlockIds.has(block.id) || blockSelection.active,
                  'plan-row-select-active': selectedBlockIds.has(block.id)
                }"
                title="按住拖动可多选块"
                @mousedown.prevent="beginBlockSelection($event, index)"
              >
                <span></span>
              </button>
              <button
                type="button"
                draggable="true"
                class="plan-row-handle"
                :class="{ 'opacity-100': hoveredBlockId === block.id || activeBlockId === block.id || dragState.draggingId === block.id }"
                @dragstart="onHandleDragStart($event, index, block)"
                @dragend="onHandleDragEnd"
                @click="(event) => openRowMenu(event, index, block)"
              >
                <span>&#8942;&#8942;</span>
              </button>
            </div>

            <div class="plan-row-content">
              <component
                :is="resolveBlock(block.type)"
                :model-value="block.content"
                :all-blocks="blocks"
                :plan-title="title"
                :plan-id="planId"
                :block-id="block.id"
                @update:modelValue="(value) => updateBlockContent(block, value)"
                @toggle-complete="toggleBlockComplete(block)"
                @delete-block="removeBlock(block)"
                @create-new-block="insertTextAfter(index)"
                @open-ai="openInlineAiFromBlock(block)"
                @open-slash-menu="(event) => openCommandMenu(event, index, 'replace-current')"
                @change-type="(type) => changeBlockType(block, type)"
                @insert-blocks="(payload) => insertBlocksAfter(index, payload)"
                @focus="handleBlockFocus(block.id)"
                @blur="clearActiveBlock(block.id)"
              />

              <div v-if="inlineAi.show && inlineAi.blockId === block.id" class="inline-ai-card">
                <div class="inline-ai-header">
                  <div class="inline-ai-chip-row">
                    <button
                      v-for="action in inlineAiActions"
                      :key="action.key"
                      type="button"
                      class="inline-ai-chip"
                      :class="{ 'inline-ai-chip-active': inlineAi.action === action.key }"
                      @click="switchInlineAiAction(action.key)"
                    >
                      {{ action.label }}
                    </button>
                  </div>
                  <button type="button" class="inline-ai-close" @click="closeInlineAi">关闭</button>
                </div>

                <div class="inline-ai-context">
                  <span class="inline-ai-context-label">{{ inlineAi.hasSelection ? '当前选中文本' : '当前块内容' }}</span>
                  <p>{{ inlineAiContextPreview }}</p>
                </div>

                <label class="inline-ai-field">
                  <span>{{ currentInlineAiAction?.fieldLabel || '补充要求' }}</span>
                  <textarea
                    v-model="inlineAi.prompt"
                    class="inline-ai-textarea"
                    rows="2"
                    :placeholder="inlineAiPromptPlaceholder"
                  />
                </label>

                <div class="inline-ai-runner">
                  <button type="button" class="inline-ai-run-btn" :disabled="inlineAi.loading || isAiCoolingDown('inline')" @click="runInlineAi">
                    {{ getAiActionButtonText('inline', currentInlineAiAction?.runLabel || '开始生成', inlineAi.loading, 'AI 处理中...') }}
                  </button>
                  <span class="inline-ai-shortcut">Ctrl / Command + J 打开当前块 AI</span>
                </div>

                <div v-if="inlineAi.result" class="inline-ai-result-card">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="ai-result-badge">{{ inlineAi.result.source === 'agnes' ? 'Agnes AI' : '本地规则' }}</span>
                    <span class="text-xs text-zinc-400">{{ currentInlineAiAction?.resultLabel || '结果' }}</span>
                  </div>

                  <template v-if="inlineAi.result.kind === 'text'">
                    <pre class="inline-ai-result-pre">{{ inlineAi.result.text }}</pre>
                    <div class="inline-ai-result-actions">
                      <button type="button" class="inline-ai-apply-btn" @click="applyInlineAiTextResult('replace-selection')">
                        {{ inlineAi.hasSelection ? '替换选中' : '替换当前块' }}
                      </button>
                      <button type="button" class="inline-ai-ghost-btn" @click="applyInlineAiTextResult('insert-cursor')">插入到光标处</button>
                      <button type="button" class="inline-ai-ghost-btn" @click="applyInlineAiTextResult('append-end')">追加到末尾</button>
                    </div>
                  </template>

                  <template v-else-if="inlineAi.result.kind === 'todo'">
                    <div class="mt-3 space-y-2">
                      <div v-for="(item, todoIndex) in inlineAi.result.items" :key="`${block.id}-todo-${todoIndex}`" class="ai-outline-item">
                        <span class="ai-outline-index">{{ todoIndex + 1 }}</span>
                        <div class="min-w-0 text-sm leading-6 text-zinc-700 dark:text-zinc-200">{{ item }}</div>
                      </div>
                    </div>
                    <div class="inline-ai-result-actions">
                      <button type="button" class="inline-ai-apply-btn" @click="applyInlineAiTodoBlocks">转为待办</button>
                    </div>
                  </template>

                  <template v-else-if="inlineAi.result.kind === 'outline'">
                    <p v-if="inlineAi.result.summary" class="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{{ inlineAi.result.summary }}</p>
                    <div class="mt-3 space-y-2">
                      <div v-for="(item, outlineIndex) in inlineAi.result.blocks" :key="`${block.id}-outline-${outlineIndex}`" class="ai-outline-item">
                        <span class="ai-outline-index">{{ outlineIndex + 1 }}</span>
                        <div class="min-w-0">
                          <div class="text-sm font-medium text-zinc-800 dark:text-zinc-100">{{ getInlineAiOutlineLabel(item) }}</div>
                          <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ getInlineAiOutlinePreview(item) }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="inline-ai-result-actions">
                      <button type="button" class="inline-ai-apply-btn" @click="applyInlineAiOutlineResult">转为大纲</button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <button v-if="blocks.length" type="button" class="plan-new-line" @click="appendTextBlock">
            <span class="mr-2">+</span>
            <span>添加一行</span>
          </button>
        </section>
      </div>
    </div>

    <div v-if="commandMenu.show" class="slash-backdrop" @click="closeCommandMenu">
      <div
        class="slash-panel"
        :style="{ top: `${commandMenu.top}px`, left: `${commandMenu.left}px` }"
        @click.stop
      >
        <div class="slash-header">
          <span>{{ commandMenu.mode === 'replace-current' ? '替换当前块' : '插入新块' }}</span>
          <span class="text-xs text-zinc-400">/</span>
        </div>
        <div class="mb-2 px-1">
          <input
            ref="commandInputRef"
            v-model="commandMenu.query"
            class="slash-search"
            type="text"
            placeholder="搜索文本、列表、图片、数据库..."
            @keydown="handleCommandKeydown"
          />
        </div>
        <div class="slash-category-tabs">
          <button
            v-for="category in commandCategories"
            :key="category.key"
            type="button"
            class="slash-category-chip"
            :class="{ 'slash-category-chip-active': commandMenu.selectedCategory === category.key }"
            @click="setCommandCategory(category.key)"
          >
            <span>{{ category.label }}</span>
            <span class="slash-category-count">{{ category.count }}</span>
          </button>
        </div>
        <div v-if="visibleCommandItems.length" class="mb-1 flex items-center justify-between px-2 pb-1 text-[11px] text-zinc-400">
          <span>第 {{ currentCommandPage + 1 }} / {{ totalCommandPages }} 页</span>
          <span>{{ pageItemRangeText }}</span>
        </div>
        <div v-if="visibleCommandItems.length" ref="commandListRef" class="slash-list">
          <button
            v-for="item in pagedCommandItems"
            :key="item.key"
            type="button"
            class="slash-item"
            :class="{ 'slash-item-active': visibleCommandItems[commandMenu.highlight]?.key === item.key }"
            @mouseenter="commandMenu.highlight = visibleCommandItems.findIndex((candidate) => candidate.key === item.key)"
            @click="selectCommandItem(item)"
          >
            <span class="slash-item-icon">{{ item.icon }}</span>
            <span class="slash-item-text">
              <span>{{ item.label }}</span>
              <span>{{ item.description }}</span>
            </span>
            <span v-if="commandMenu.selectedCategory === 'all'" class="slash-item-badge">{{ item.category }}</span>
          </button>
        </div>
        <div v-else class="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          没有匹配的命令
        </div>
        <div v-if="visibleCommandItems.length && totalCommandPages > 1" class="slash-pagination">
          <button type="button" class="slash-page-btn" :disabled="currentCommandPage === 0" @click="goToCommandPage(currentCommandPage - 1)">
            上一页
          </button>
          <span class="slash-page-indicator">{{ currentCommandPage + 1 }} / {{ totalCommandPages }}</span>
          <button type="button" class="slash-page-btn" :disabled="currentCommandPage >= totalCommandPages - 1" @click="goToCommandPage(currentCommandPage + 1)">
            下一页
          </button>
        </div>
      </div>
    </div>

    <input ref="fileInputRef" type="file" accept=".md,.markdown,.json,.html,.htm,.csv" class="hidden" @change="handleImport" />

    <Teleport to="body">
      <div v-if="showExportMenu" class="fixed inset-0 z-[1000]" @click="showExportMenu = false">
        <div class="absolute right-6 top-20 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950" @click.stop>
          <button type="button" class="export-menu-item" @click="handleExport('markdown')">导出为 Markdown</button>
          <button type="button" class="export-menu-item" @click="handleExport('html')">导出为 HTML</button>
          <button type="button" class="export-menu-item" @click="handleExport('json')">导出为 JSON</button>
          <button type="button" class="export-menu-item" @click="handleExport('csv')">导出为 CSV</button>
          <button type="button" class="export-menu-item" @click="handleExport('workspace')">导出整个工作区</button>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="inlineAiToolbar.show"
        class="inline-ai-toolbar"
        :style="{ top: `${inlineAiToolbar.top}px`, left: `${inlineAiToolbar.left}px` }"
      >
        <button
          v-for="action in workspaceAiToolbarActions"
          :key="`toolbar-workspace-${action.tab}`"
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': aiPanel.show && aiPanel.tab === action.tab }"
          @mousedown.prevent="openAiPanel(action.tab)"
        >
          {{ action.label }}
        </button>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="inlineFormatToolbar.show"
        class="inline-format-toolbar inline-ai-toolbar"
        :style="{ top: `${inlineFormatToolbar.top}px`, left: `${inlineFormatToolbar.left}px` }"
      >
        <button
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.bold }"
          title="Bold"
          @mousedown.prevent="applyInlineFormat('bold')"
        >
          B
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-btn italic"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.italic }"
          title="Italic"
          @mousedown.prevent="applyInlineFormat('italic')"
        >
          I
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.code }"
          title="Inline code"
          @mousedown.prevent="applyInlineFormat('code')"
        >
          <span class="text-xs">&lt;/&gt;</span>
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.strike }"
          title="Strikethrough"
          @mousedown.prevent="applyInlineFormat('strike')"
        >
          <span class="line-through">S</span>
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.highlight }"
          title="Highlight"
          @mousedown.prevent="applyInlineFormat('highlight')"
        >
          H
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-btn"
          :class="{ 'inline-ai-toolbar-btn-active': inlineFormatToolbar.marks?.link }"
          title="Link"
          @mousedown.prevent="applyInlineFormat('link')"
        >
          <span class="text-xs">Link</span>
        </button>
        <button
          type="button"
          class="inline-ai-toolbar-primary"
          title="AI"
          @mousedown.prevent="applyInlineFormat('ai')"
        >
          AI
        </button>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="rowMenu.show"
        class="fixed z-[1100] w-44 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        :style="{ top: `${rowMenu.top}px`, left: `${rowMenu.left}px` }"
      >
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('add-above')">在上方插入</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('add-below')">在下方插入</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('duplicate')">复制当前块</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('change-type')">切换类型</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('move-up')">上移</button>
        <button type="button" class="row-menu-item" @click="handleRowMenuAction('move-down')">下移</button>
        <button type="button" class="row-menu-item text-red-600 dark:text-red-300" @click="handleRowMenuAction('delete')">删除</button>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="aiPanel.show" class="fixed inset-0 z-[1300] bg-black/40 p-4 backdrop-blur-sm" @click="closeAiPanel">
        <div class="ai-panel mx-auto mt-10 max-w-5xl" @click.stop>
          <div class="ai-panel-header">
            <div>
              <div class="text-lg font-semibold text-zinc-950 dark:text-white">AI 工作区</div>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">这里集中放计划页的 AI 生成、润色、提问、图片和视频能力，适合做全局操作；块内 AI 更适合处理当前文本。</p>
            </div>
            <button type="button" class="ai-panel-close" @click="closeAiPanel">关闭</button>
          </div>

          <div class="ai-panel-tabs">
            <button type="button" class="ai-panel-tab" :class="{ 'ai-panel-tab-active': aiPanel.tab === 'outline' }" @click="openAiPanel('outline')">AI 生成</button>
            <button type="button" class="ai-panel-tab" :class="{ 'ai-panel-tab-active': aiPanel.tab === 'polish' }" @click="openAiPanel('polish')">AI 润色</button>
            <button type="button" class="ai-panel-tab" :class="{ 'ai-panel-tab-active': aiPanel.tab === 'questions' }" @click="openAiPanel('questions')">AI 提问</button>
            <button type="button" class="ai-panel-tab" :class="{ 'ai-panel-tab-active': aiPanel.tab === 'image' }" @click="openAiPanel('image')">AI 生图</button>
            <button type="button" class="ai-panel-tab" :class="{ 'ai-panel-tab-active': aiPanel.tab === 'video' }" @click="openAiPanel('video')">AI 生视频</button>
          </div>

          <div class="mb-4 rounded-3xl border border-zinc-200/80 bg-zinc-50/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-zinc-950 dark:text-white">{{ aiTemplateScopeLabel }}模板</div>
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ aiTemplateScopeDescription }}</p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiTemplateMode === 'preset' }" @click="aiTemplateMode = 'preset'">预设模板</button>
                <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiTemplateMode === 'custom' }" @click="aiTemplateMode = 'custom'">高级自定义</button>
              </div>
            </div>

            <div v-if="aiTemplateMode === 'preset'" class="mt-4 flex flex-wrap gap-2">
              <button
                v-for="preset in aiTemplatePresets"
                :key="preset.key"
                type="button"
                class="ai-mode-chip"
                :class="{ 'ai-mode-chip-active': aiTemplatePreset === preset.key }"
                @click="aiTemplatePreset = preset.key"
              >
                {{ preset.source === 'custom' ? `我的 · ${preset.label}` : preset.label }}
              </button>
            </div>

            <div v-else class="mt-4 grid gap-3 md:grid-cols-2">
              <label class="ai-panel-field md:col-span-2">
                <span>角色设定</span>
                <textarea v-model="aiTemplateCustom.role" rows="2" class="ai-panel-textarea" placeholder="告诉 AI 它是谁"></textarea>
              </label>
              <label class="ai-panel-field">
                <span>任务描述</span>
                <textarea v-model="aiTemplateCustom.task" rows="3" class="ai-panel-textarea" placeholder="写清楚要做什么"></textarea>
              </label>
              <label class="ai-panel-field">
                <span>格式与风格约束</span>
                <textarea v-model="aiTemplateCustom.constraints" rows="3" class="ai-panel-textarea" placeholder="字数、风格、结构要求"></textarea>
              </label>
              <label class="ai-panel-field md:col-span-2">
                <span>禁止项</span>
                <textarea v-model="aiTemplateCustom.prohibitions" rows="3" class="ai-panel-textarea" placeholder="不要做什么"></textarea>
              </label>
              <label class="ai-panel-field md:col-span-2">
                <span>模板名称</span>
                <input v-model="aiTemplateCustomBaseName" type="text" class="ai-panel-input" :placeholder="`例如：${aiTemplateScopeLabel}模板底座`" />
              </label>
              <div class="md:col-span-2 flex flex-wrap items-center justify-between gap-2">
                <div class="text-xs text-zinc-500 dark:text-zinc-400">当前分类已保存 {{ aiTemplateCustomBaseCount }} 个模板底座</div>
                <button type="button" class="btn-secondary px-4 py-2 text-sm" @click="saveAiTemplateBase">保存为模板底座</button>
              </div>
            </div>

            <div class="mt-4 rounded-2xl border border-dashed border-zinc-200 bg-white/80 p-3 text-xs leading-6 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-400">
              <div class="font-medium text-zinc-700 dark:text-zinc-200">当前模板预览</div>
              <div class="mt-1 line-clamp-3">{{ aiTemplateSummary }}</div>
            </div>
          </div>

          <div v-if="aiPanel.tab === 'outline'" class="ai-panel-body space-y-4">
            <label class="ai-panel-field">
              <span>想生成什么计划</span>
              <textarea
                v-model="aiOutlinePrompt"
                rows="5"
                class="ai-panel-textarea"
                placeholder="例如：生成一份 7 天的内容复盘计划，包含目标、步骤、每日安排和风险提醒。"
              />
            </label>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="btn-primary px-4 py-2 text-sm" :disabled="aiOutlineLoading || isAiCoolingDown('outline')" @click="generateAiOutline">
                {{ getAiActionButtonText('outline', '生成大纲', aiOutlineLoading) }}
              </button>
              <button v-if="aiOutlineResult?.blocks?.length" type="button" class="btn-secondary px-4 py-2 text-sm" @click="applyAiOutline">
                插入到当前计划
              </button>
            </div>

            <div v-if="aiOutlineResult" class="ai-result-card">
              <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span class="ai-result-badge">{{ aiOutlineResult.source === 'agnes' ? 'Agnes AI' : '本地规则' }}</span>
                <span>{{ aiOutlineResult.summary }}</span>
              </div>
              <div class="mt-3 text-lg font-semibold text-zinc-950 dark:text-white">{{ aiOutlineResult.titleSuggestion || 'AI 计划建议' }}</div>
              <div class="mt-4 space-y-2">
                <div v-for="(block, index) in aiOutlineResult.blocks" :key="`outline-${index}`" class="ai-outline-item">
                  <span class="ai-outline-index">{{ index + 1 }}</span>
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-zinc-900 dark:text-white">{{ block.type }}</div>
                    <div class="text-sm text-zinc-600 dark:text-zinc-300">{{ previewBlockContent(block) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="aiPanel.tab === 'polish'" class="ai-panel-body space-y-4">
            <div class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              {{ activePolishHint }}
            </div>
            <label class="ai-panel-field">
              <span>润色要求</span>
              <input
                v-model="aiPolishInstruction"
                type="text"
                class="ai-panel-input"
                placeholder="例如：更简洁、更正式、更适合执行。"
              />
            </label>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="btn-primary px-4 py-2 text-sm" :disabled="aiPolishLoading || isAiCoolingDown('polish')" @click="runAiPolish">
                {{ getAiActionButtonText('polish', '开始润色', aiPolishLoading) }}
              </button>
              <button v-if="aiPolishResult?.text" type="button" class="btn-secondary px-4 py-2 text-sm" @click="applyAiPolish">
                写回当前块
              </button>
            </div>

            <div v-if="aiPolishResult" class="ai-result-card">
              <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span class="ai-result-badge">{{ aiPolishResult.source === 'agnes' ? 'Agnes AI' : '本地规则' }}</span>
                <span>润色结果预览</span>
              </div>
              <pre class="ai-result-pre">{{ aiPolishResult.text }}</pre>
            </div>
          </div>

          <div v-else-if="aiPanel.tab === 'questions'" class="ai-panel-body space-y-4">
            <div class="flex flex-wrap gap-2">
              <button type="button" class="btn-primary px-4 py-2 text-sm" :disabled="aiQuestionsLoading || isAiCoolingDown('questions')" @click="generateAiQuestions">
                {{ getAiActionButtonText('questions', '生成问题', aiQuestionsLoading) }}
              </button>
            </div>

            <div v-if="aiQuestionsResult" class="ai-result-card">
              <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span class="ai-result-badge">{{ aiQuestionsResult.source === 'agnes' ? 'Agnes AI' : '本地规则' }}</span>
                <span>{{ aiQuestionsResult.summary }}</span>
              </div>
              <div class="mt-4 space-y-2">
                <div v-for="(question, index) in aiQuestionsResult.questions" :key="`question-${index}`" class="ai-question-item">
                  <span class="ai-question-index">{{ index + 1 }}</span>
                  <p class="text-sm leading-6 text-zinc-700 dark:text-zinc-300">{{ question }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="aiPanel.tab === 'image'" class="ai-panel-body space-y-4">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr,0.9fr]">
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiImageMode === 'text_to_image' }" @click="aiImageMode = 'text_to_image'">文生图</button>
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiImageMode === 'image_to_image' }" @click="aiImageMode = 'image_to_image'">图生图</button>
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiImageMode === 'multi_image' }" @click="aiImageMode = 'multi_image'">多图合成</button>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label class="ai-panel-field">
                    <span>模型</span>
                    <select v-model="aiImageModel" class="ai-panel-input">
                      <option v-for="item in aiImageModelOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
                    </select>
                  </label>
                  <label class="ai-panel-field">
                    <span>尺寸</span>
                    <select v-model="aiImageSize" class="ai-panel-input">
                      <option v-for="size in aiImageSizeOptions" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </label>
                </div>

                <label v-if="aiImageModel === 'agnes-image-2.1-flash'" class="ai-panel-field">
                  <span>画面比例</span>
                  <select v-model="aiImageRatio" class="ai-panel-input">
                    <option v-for="ratio in aiImageRatioOptions" :key="ratio" :value="ratio">{{ ratio }}</option>
                  </select>
                </label>

                <label class="ai-panel-field">
                  <span>图片提示词</span>
                  <textarea v-model="aiImagePrompt" rows="4" class="ai-panel-textarea" placeholder="例如：极简黑白高质感计划页插画，玻璃拟态卡片与柔和灯光，苹果风格产品海报。" />
                </label>

                <label class="ai-panel-field">
                  <span>负面提示词</span>
                  <input v-model="aiImageNegativePrompt" type="text" class="ai-panel-input" placeholder="例如：模糊、低清晰度、杂乱排版、变形手部。" />
                </label>

                <label v-if="aiImageMode !== 'text_to_image'" class="ai-upload-field">
                  <span>{{ aiImageMode === 'multi_image' ? '上传多张参考图' : '上传参考图' }}</span>
                  <input type="file" accept="image/*" :multiple="aiImageMode === 'multi_image'" @change="handleAiImageFiles" />
                </label>

                <div v-if="aiImageSources.length" class="ai-source-grid">
                  <div v-for="item in aiImageSources" :key="item.id" class="ai-source-card">
                    <img :src="item.previewUrl" :alt="item.name" class="ai-source-image" />
                    <div class="ai-source-footer">
                      <span>{{ item.name }}</span>
                      <button type="button" class="ai-source-remove" @click="removeAiImageSource(item.id)">移除</button>
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button type="button" class="btn-primary px-4 py-2 text-sm" :disabled="aiImageLoading || isAiCoolingDown('image')" @click="runAiImage">
                    {{ getAiActionButtonText('image', '开始生图', aiImageLoading) }}
                  </button>
                  <button v-if="aiImageResult?.taskId" type="button" class="btn-secondary px-4 py-2 text-sm" @click="pollAiImageStatus">
                    刷新状态
                  </button>
                </div>
              </div>

              <div class="space-y-4">
                <div class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  支持 Agnes Image 2.0 Flash / 2.1 Flash，当前面板支持文生图、图生图和多图合成，任务会保留状态、进度和历史记录。
                </div>

                <div v-if="aiImageResult" class="ai-result-card space-y-4">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span class="ai-result-badge">{{ aiImageResult.source === 'agnes' ? 'Agnes AI' : '本地规则' }}</span>
                    <span>{{ aiImageResult.model }}</span>
                    <span>状态：{{ aiImageResult.status || 'queued' }}</span>
                    <span v-if="aiImageResult.progress">进度：{{ aiImageResult.progress }}%</span>
                  </div>

                  <div class="grid grid-cols-1 gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <div>任务 ID：{{ aiImageResult.taskId || '-' }}</div>
                    <div>创建时间：{{ formatAiVideoTimestamp(aiImageResult.createdAt) }}</div>
                    <div>最后更新：{{ formatAiVideoTimestamp(aiImageResult.updatedAt || aiImageResult.lastCheckedAt) }}</div>
                    <div v-if="aiImageResult.error" class="text-red-500">{{ aiImageResult.error }}</div>
                  </div>

                  <div v-if="aiImageResult.timeline?.length" class="space-y-2">
                    <div class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">状态时间线</div>
                    <div class="space-y-2">
                      <div v-for="event in aiImageResult.timeline" :key="event.id" class="ai-timeline-item">
                        <div class="ai-timeline-dot"></div>
                        <div class="min-w-0 flex-1">
                          <div class="flex flex-wrap items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100">
                            <span>{{ event.message }}</span>
                            <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ event.status }}</span>
                            <span v-if="event.progress" class="text-xs text-zinc-500 dark:text-zinc-400">{{ event.progress }}%</span>
                          </div>
                          <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ formatAiVideoTimestamp(event.occurredAt) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="aiImageResult.items?.length" class="ai-generated-grid">
                    <div v-for="item in aiImageResult.items" :key="item.id" class="ai-generated-card">
                      <img :src="item.previewUrl" alt="AI 生成图片" class="ai-generated-image" />
                      <button type="button" class="btn-secondary mt-3 w-full px-4 py-2 text-sm" @click="insertGeneratedImageBlock(item)">
                        插入图片块
                      </button>
                    </div>
                  </div>
                </div>

                <div class="ai-result-card space-y-4">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <div class="text-sm font-medium text-zinc-900 dark:text-white">任务历史</div>
                      <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">刷新页面后，仍可以恢复最近的生图任务。</p>
                    </div>
                    <button type="button" class="btn-ghost px-3 py-2 text-xs" :disabled="aiImageHistoryLoading" @click="loadAiImageHistory({ restoreActive: true })">
                      {{ aiImageHistoryLoading ? '加载中...' : '刷新历史' }}
                    </button>
                  </div>

                  <div v-if="aiImageHistory.length" class="space-y-3">
                    <div
                      v-for="item in aiImageHistory"
                      :key="item.id"
                      class="ai-history-card"
                      :class="{ 'ai-history-card-active': aiImageResult?.id === item.id }"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <button type="button" class="min-w-0 flex-1 text-left" @click="restoreAiImageTask(item)">
                          <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span class="ai-result-badge">{{ item.model }}</span>
                            <span>{{ getAiImageModeLabel(item.mode) }}</span>
                            <span>状态：{{ item.status }}</span>
                            <span v-if="item.progress">进度：{{ item.progress }}%</span>
                          </div>
                          <div class="ai-history-prompt mt-2 text-left text-sm leading-6 text-zinc-800 dark:text-zinc-100">{{ item.prompt }}</div>
                          <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>{{ formatAiVideoTimestamp(item.createdAt) }}</span>
                            <span v-if="item.sourceImages?.length">素材 {{ item.sourceImages.length }} 张</span>
                            <span v-if="item.items?.length">已出图</span>
                          </div>
                        </button>
                        <div class="flex shrink-0 flex-col gap-2">
                          <button type="button" class="ai-history-action" @click="restoreAiImageTask(item)">查看</button>
                          <button
                            type="button"
                            class="ai-history-delete"
                            :disabled="aiImageDeletingTaskId === item.taskId"
                            @click="deleteAiImageHistory(item)"
                          >
                            {{ aiImageDeletingTaskId === item.taskId ? '删除中...' : '删除' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-sm text-zinc-500 dark:text-zinc-400">
                    还没有可恢复的生图历史。
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="ai-panel-body space-y-4">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr,0.9fr]">
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiVideoMode === 'text_to_video' }" @click="aiVideoMode = 'text_to_video'">文生视频</button>
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiVideoMode === 'image_to_video' }" @click="aiVideoMode = 'image_to_video'">图生视频</button>
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiVideoMode === 'keyframes' }" @click="aiVideoMode = 'keyframes'">关键帧动画</button>
                </div>

                <label class="ai-panel-field">
                  <span>模型</span>
                  <select v-model="aiVideoModel" class="ai-panel-input">
                    <option v-for="item in aiVideoModelOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
                  </select>
                </label>

                <label class="ai-panel-field">
                  <span>视频提示词</span>
                  <textarea v-model="aiVideoPrompt" rows="4" class="ai-panel-textarea" placeholder="例如：镜头缓慢推进，黑白极简工作台，玻璃卡片依次浮现，光影柔和克制。" />
                </label>

                <label class="ai-panel-field">
                  <span>负面提示词</span>
                  <input v-model="aiVideoNegativePrompt" type="text" class="ai-panel-input" placeholder="例如：闪烁、拉伸、抖动、文字错乱。" />
                </label>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <label class="ai-panel-field">
                    <span>分辨率</span>
                    <select class="ai-panel-input" :value="`${aiVideoWidth}x${aiVideoHeight}`" @change="setAiVideoResolution($event.target.value)">
                      <option v-for="item in aiVideoResolutionOptions" :key="item.label" :value="`${item.width}x${item.height}`">{{ item.label }}</option>
                    </select>
                  </label>
                  <label class="ai-panel-field">
                    <span>帧数</span>
                    <input v-model="aiVideoFrames" type="number" min="9" max="441" step="8" class="ai-panel-input" />
                  </label>
                  <label class="ai-panel-field">
                    <span>帧率</span>
                    <input v-model="aiVideoFrameRate" type="number" min="12" max="30" class="ai-panel-input" />
                  </label>
                </div>

                <label v-if="aiVideoMode !== 'text_to_video'" class="ai-panel-field">
                  <span>{{ aiVideoMode === 'keyframes' ? '关键帧图片 URL（至少需要 2 张）' : '参考图 URL' }}</span>
                  <div class="flex flex-col gap-2 sm:flex-row">
                    <input
                      v-model="aiVideoSourceUrl"
                      type="url"
                      class="ai-panel-input"
                      placeholder="https://example.com/source-image.png"
                      @keydown.enter.prevent="appendAiVideoSourceUrl"
                    />
                    <button type="button" class="btn-secondary shrink-0 px-4 py-2 text-sm" @click="appendAiVideoSourceUrl">
                      添加 URL
                    </button>
                  </div>
                  <p class="text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                    Agnes 视频接口需要公网可访问的图片 URL，不能直接使用本地路径或 data URL。
                  </p>
                </label>

                <label v-if="aiVideoMode !== 'text_to_video'" class="ai-upload-field">
                  <span>{{ aiVideoMode === 'keyframes' ? '上传并自动生成关键帧 URL' : '上传并自动生成参考图 URL' }}</span>
                  <input type="file" accept="image/*" :multiple="aiVideoMode === 'keyframes'" @change="handleAiVideoUploadFiles" />
                  <p class="text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                    系统会先上传图片并尝试生成可公网访问的 `publicUrl`。如果当前环境只能返回本地地址，仍会保留预览，但 Agnes 可能无法直接读取。
                  </p>
                  <div v-if="aiVideoSourceUploading" class="text-xs text-zinc-500 dark:text-zinc-400">
                    正在上传参考图 {{ aiVideoSourceUploadProgress }}%
                  </div>
                </label>

                <div v-if="aiVideoSources.length" class="ai-source-grid">
                  <div v-for="item in aiVideoSources" :key="item.id" class="ai-source-card">
                    <img :src="item.previewUrl" :alt="item.name" class="ai-source-image" />
                    <div class="ai-source-footer">
                      <span>{{ item.isPublic ? item.name : `${item.name}（仅本地预览）` }}</span>
                      <button type="button" class="ai-source-remove" @click="removeAiVideoSource(item.id)">移除</button>
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <button type="button" class="btn-primary px-4 py-2 text-sm" :disabled="aiVideoLoading || isAiCoolingDown('video')" @click="runAiVideo">
                    {{ getAiActionButtonText('video', '开始生成视频', aiVideoLoading, '提交中...') }}
                  </button>
                  <button v-if="aiVideoResult?.videoId" type="button" class="btn-secondary px-4 py-2 text-sm" @click="pollAiVideoStatus">
                    刷新状态
                  </button>
                </div>
              </div>

              <div class="space-y-4">
                <div class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  支持 Agnes Video V2.0，当前可生成文生视频、图生视频和关键帧动画，异步任务会自动轮询状态并保留历史记录。
                </div>

                <div v-if="aiVideoResult" class="ai-result-card space-y-4">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span class="ai-result-badge">{{ aiVideoResult.source === 'agnes' ? 'Agnes AI' : '本地规则' }}</span>
                    <span>{{ aiVideoResult.model }}</span>
                    <span>状态：{{ aiVideoResult.status || 'queued' }}</span>
                    <span v-if="aiVideoResult.progress">进度：{{ aiVideoResult.progress }}%</span>
                  </div>

                  <div class="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-950">
                    <video v-if="aiVideoResult.url" :src="aiVideoResult.url" class="ai-generated-video" controls playsinline />
                    <div v-else class="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      视频任务已提交，正在等待 Agnes 返回结果...
                    </div>
                  </div>

                  <div class="grid grid-cols-1 gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <div>任务 ID：{{ aiVideoResult.taskId || '-' }}</div>
                    <div>视频 ID：{{ aiVideoResult.videoId || '-' }}</div>
                    <div>创建时间：{{ formatAiVideoTimestamp(aiVideoResult.createdAt) }}</div>
                    <div>最后更新：{{ formatAiVideoTimestamp(aiVideoResult.updatedAt || aiVideoResult.lastCheckedAt) }}</div>
                    <div v-if="aiVideoResult.error" class="text-red-500">{{ aiVideoResult.error }}</div>
                  </div>

                  <div v-if="aiVideoResult.timeline?.length" class="space-y-2">
                    <div class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">状态时间线</div>
                    <div class="space-y-2">
                      <div v-for="event in aiVideoResult.timeline" :key="event.id" class="ai-timeline-item">
                        <div class="ai-timeline-dot"></div>
                        <div class="min-w-0 flex-1">
                          <div class="flex flex-wrap items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100">
                            <span>{{ event.message }}</span>
                            <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ event.status }}</span>
                            <span v-if="event.progress" class="text-xs text-zinc-500 dark:text-zinc-400">{{ event.progress }}%</span>
                          </div>
                          <div class="text-xs text-zinc-500 dark:text-zinc-400">{{ formatAiVideoTimestamp(event.occurredAt) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <button v-if="aiVideoResult.url" type="button" class="btn-secondary px-4 py-2 text-sm" @click="insertGeneratedVideoBlock(aiVideoResult)">
                      插入视频块
                    </button>
                    <a v-if="aiVideoResult.url" :href="aiVideoResult.url" target="_blank" rel="noreferrer" class="btn-ghost px-4 py-2 text-sm">
                      打开原视频
                    </a>
                  </div>
                </div>

                <div class="ai-result-card space-y-4">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <div class="text-sm font-medium text-zinc-900 dark:text-white">任务历史</div>
                      <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">刷新页面后，仍可以恢复最近的视频任务。</p>
                    </div>
                    <button type="button" class="btn-ghost px-3 py-2 text-xs" :disabled="aiVideoHistoryLoading" @click="loadAiVideoHistory({ restoreActive: true })">
                      {{ aiVideoHistoryLoading ? '加载中...' : '刷新历史' }}
                    </button>
                  </div>

                  <div v-if="aiVideoHistory.length" class="space-y-3">
                    <div
                      v-for="item in aiVideoHistory"
                      :key="item.id"
                      class="ai-history-card"
                      :class="{ 'ai-history-card-active': aiVideoResult?.id === item.id }"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <button type="button" class="min-w-0 flex-1 text-left" @click="restoreAiVideoTask(item)">
                          <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span class="ai-result-badge">{{ item.model }}</span>
                            <span>{{ getAiVideoModeLabel(item.mode) }}</span>
                            <span>状态：{{ item.status }}</span>
                            <span v-if="item.progress">进度：{{ item.progress }}%</span>
                          </div>
                          <div class="ai-history-prompt mt-2 text-left text-sm leading-6 text-zinc-800 dark:text-zinc-100">{{ item.prompt }}</div>
                          <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>{{ formatAiVideoTimestamp(item.createdAt) }}</span>
                            <span v-if="item.sourceImages?.length">素材 {{ item.sourceImages.length }} 张</span>
                            <span v-if="item.url">已出片</span>
                          </div>
                        </button>
                        <div class="flex shrink-0 flex-col gap-2">
                          <button type="button" class="ai-history-action" @click="restoreAiVideoTask(item)">查看</button>
                          <button
                            type="button"
                            class="ai-history-delete"
                            :disabled="aiVideoDeletingTaskId === item.taskId"
                            @click="deleteAiVideoHistory(item)"
                          >
                            {{ aiVideoDeletingTaskId === item.taskId ? '删除中...' : '删除' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-sm text-zinc-500 dark:text-zinc-400">
                    还没有可恢复的视频历史。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import {
  polishPlanBlockAI,
  generatePlanOutlineAI,
  generatePlanQuestionsAI,
  generatePlanImageAI,
  getPlanImageStatusAI,
  listPlanImageHistoryAI,
  deletePlanImageHistoryAI,
  createPlanVideoAI,
  getPlanVideoStatusAI,
  listPlanVideoHistoryAI,
  deletePlanVideoHistoryAI
} from '@/api/plans'
import { uploadImage } from '@/api/uploads'
import { useImportExport } from '@/composables/useImportExport'
import { useToast } from '@/composables/useToast'
import { usePlanStore } from '@/stores/plan'
import { resolveMediaUrl } from '@/utils/media'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()
const { exportPlan, exportWorkspaceBackup, importPlan } = useImportExport()
const { success: showSuccess, error: showError, info: showInfo } = useToast()

const planId = computed(() => route.params.id)
const isLoading = ref(false)
const title = ref('')
const status = ref('not_started')
const priority = ref('medium')
const planType = ref('project')
const customTypeName = ref('')
const dueDate = ref('')
const blocks = ref([])
const activeBlockId = ref(null)
const hoveredBlockId = ref(null)
const selectedBlockIds = ref(new Set())
const blockSelection = ref({ active: false, anchorIndex: -1, lastIndex: -1, mode: 'replace' })
const saveStatus = ref('saved')
const pendingBlockIds = ref(new Set())
const showExportMenu = ref(false)
const fileInputRef = ref(null)
const titleRef = ref(null)
const commandInputRef = ref(null)
const commandListRef = ref(null)
const rowMenu = ref({ show: false, blockId: null, blockIndex: -1, top: 0, left: 0 })
const dragState = ref({ draggingId: null, draggingIds: [], fromIndex: -1, overIndex: -1, position: 'after' })
const commandMenu = ref({ show: false, mode: 'insert-after', index: null, top: 0, left: 0, query: '', selectedCategory: 'all', highlight: 0 })
const aiPanel = ref({ show: false, tab: 'outline' })
const aiOutlinePrompt = ref('')
const aiOutlineLoading = ref(false)
const aiOutlineResult = ref(null)
const aiPolishInstruction = ref('')
const aiPolishLoading = ref(false)
const aiPolishResult = ref(null)
const aiQuestionsLoading = ref(false)
const aiQuestionsResult = ref(null)
const aiPolishTarget = ref({ blockId: null, fieldKey: '', itemIndex: null })
const aiImageMode = ref('text_to_image')
const aiImageModel = ref('agnes-image-2.1-flash')
const aiImagePrompt = ref('')
const aiImageNegativePrompt = ref('')
const aiImageSize = ref('1024x1024')
const aiImageRatio = ref('1:1')
const aiImageLoading = ref(false)
const aiImageResult = ref(null)
const aiImageSources = ref([])
const aiImageHistory = ref([])
const aiImageHistoryLoading = ref(false)
const aiImageDeletingTaskId = ref('')
const aiImagePollingTimer = ref(null)
const aiVideoMode = ref('text_to_video')
const aiVideoModel = ref('agnes-video-v2.0')
const aiVideoPrompt = ref('')
const aiVideoNegativePrompt = ref('')
const aiVideoWidth = ref(720)
const aiVideoHeight = ref(1280)
const aiVideoFrames = ref(121)
const aiVideoFrameRate = ref(24)
const aiVideoLoading = ref(false)
const aiVideoResult = ref(null)
const aiVideoSources = ref([])
const aiVideoSourceUrl = ref('')
const aiVideoSourceUploading = ref(false)
const aiVideoSourceUploadProgress = ref(0)
const aiVideoHistory = ref([])
const aiVideoHistoryLoading = ref(false)
const aiVideoDeletingTaskId = ref('')
const aiVideoPollingTimer = ref(null)
const AI_TEMPLATE_STORAGE_KEY = 'habitlearner.plan.ai-template.registry.v2'
const createAiTemplateFields = (value = {}) => ({
  role: String(value.role || '').trim(),
  task: String(value.task || '').trim(),
  constraints: String(value.constraints || '').trim(),
  prohibitions: String(value.prohibitions || '').trim()
})
const aiTemplateScopeLabels = {
  text: 'AI 生成',
  image: 'AI 绘图',
  video: 'AI 视频'
}
const aiTemplateScopeDescriptions = {
  text: '用于生成大纲、润色、提问和块内 AI。',
  image: '用于生图、图生图、多图合成等视觉提示词。',
  video: '用于文生视频、图生视频和关键帧动画。'
}
const aiTemplateBuiltinPresetsByScope = {
  text: [
    {
      key: 'execution_planner',
      label: '执行型规划师',
      role: '你是一位有 10 年经验的中文计划编辑与执行规划顾问。',
      task: '围绕当前计划内容进行生成、润色、提问、提纲整理时，优先保证可执行性、结构清晰和落地顺序。',
      constraints: '输出简体中文；优先使用短句和明确动作；表达要适合直接粘贴进计划页；保留原始逻辑，但要更清楚。',
      prohibitions: '不要输出空话；不要偏离计划主题；不要只做同义词替换；不要写成营销文案；不要输出额外解释。'
    },
    {
      key: 'editorial_writer',
      label: '专业文案编辑',
      role: '你是一位擅长简洁表达和结构化叙述的中文编辑。',
      task: '把用户输入整理成更自然、更简洁、更有层次的内容。',
      constraints: '输出需要克制、简洁、通顺；适合知识记录和计划页；保持原意不变。',
      prohibitions: '不要夸张；不要加戏；不要扩展不存在的信息；不要生成冗长段落。'
    },
    {
      key: 'analytic_advisor',
      label: '严谨分析顾问',
      role: '你是一位擅长分析问题、识别风险和补齐信息缺口的计划顾问。',
      task: '帮助用户发现当前内容中的缺失项、冲突点、风险点和下一步行动。',
      constraints: '输出要具体、可验证、偏事实；每条建议都应能直接用于推进计划。',
      prohibitions: '不要泛泛而谈；不要重复同义内容；不要输出无意义鼓励；不要跳出上下文。'
    },
    {
      key: 'notion_formatter',
      label: 'Notion 风格整理器',
      role: '你是一位熟悉 Notion 风格块结构的中文内容整理助手。',
      task: '把输入内容整理成适合块编辑器的层级结构和清晰段落。',
      constraints: '输出要像高质量工作区内容；强调标题、层级、待办和重点；保持视觉上易读。',
      prohibitions: '不要把内容堆成一整段；不要忽略层级；不要过度装饰；不要输出与编辑器不兼容的格式。'
    }
  ],
  image: [
    {
      key: 'visual_director',
      label: '视觉导演',
      role: '你是一位专业视觉导演与图像提示词设计师。',
      task: '围绕生图、图生图、多图合成，输出适合直接提交给模型的高质量图像提示词。',
      constraints: '输出简体中文；重点描述主体、构图、光影、材质、风格、镜头感和画面比例。',
      prohibitions: '不要空泛；不要塞入无关解释；不要让提示词过长失焦。'
    },
    {
      key: 'ios_glass',
      label: 'iOS 玻璃感',
      role: '你是一位熟悉 iOS 玻璃拟态和高级极简风格的视觉提示词设计师。',
      task: '生成有苹果式高级感的生图提示词，适合计划页、卡片和工具区视觉。',
      constraints: '强调黑白主色、柔和高光、半透明玻璃、留白和秩序感。',
      prohibitions: '不要使用花哨颜色；不要赛博科技蓝；不要堆砌复杂元素。'
    },
    {
      key: 'poster_layout',
      label: '海报构图师',
      role: '你是一位擅长商业海报和信息可视化的视觉编辑。',
      task: '把用户需求整理成适合直出海报或封面图的提示词。',
      constraints: '强调层级、排版、视觉焦点和阅读动线。',
      prohibitions: '不要生成杂乱拼贴；不要缺少主体；不要忽略留白。'
    }
  ],
  video: [
    {
      key: 'motion_director',
      label: '镜头导演',
      role: '你是一位擅长视频镜头语言和节奏控制的导演。',
      task: '围绕文生视频、图生视频和关键帧动画，输出适合直接提交给视频模型的高质量提示词。',
      constraints: '输出简体中文；明确镜头推进、运动方式、转场节奏、画面风格和时长感。',
      prohibitions: '不要只写静态画面；不要缺少镜头动作；不要让描述过于抽象。'
    },
    {
      key: 'product_demo',
      label: '产品演示',
      role: '你是一位擅长产品演示视频策划的导演。',
      task: '把产品、工作流或计划页内容整理成流畅的视频提示词。',
      constraints: '强调步骤感、交互感、镜头变化和信息呈现顺序。',
      prohibitions: '不要堆满旁白；不要让镜头切换混乱；不要忽略动作目标。'
    },
    {
      key: 'cinematic_short',
      label: '电影短片',
      role: '你是一位擅长电影感短片创作的导演。',
      task: '生成适合 Agnes Video V2.0 的电影感视频提示词。',
      constraints: '突出氛围、光影、运动、景别和节奏，适合短时长成片。',
      prohibitions: '不要写成长篇文案；不要缺少运动信息；不要过度抽象。'
    }
  ]
}
const createAiTemplateState = (scope) => ({
  mode: 'preset',
  presetKey: aiTemplateBuiltinPresetsByScope[scope]?.[0]?.key || '',
  custom: createAiTemplateFields(),
  customBaseName: '',
  savedBases: []
})
const loadAiTemplateStore = () => {
  const createStore = () => ({
    text: createAiTemplateState('text'),
    image: createAiTemplateState('image'),
    video: createAiTemplateState('video')
  })

  if (typeof window === 'undefined') return createStore()

  try {
    const modernRaw = window.localStorage.getItem(AI_TEMPLATE_STORAGE_KEY)
    if (modernRaw) {
      const parsed = JSON.parse(modernRaw)
      const next = createStore()
      ;['text', 'image', 'video'].forEach((scope) => {
        const state = parsed?.[scope]
        if (!state) return
        next[scope].mode = state.mode === 'custom' ? 'custom' : 'preset'
        next[scope].presetKey = String(state.presetKey || '').trim() || next[scope].presetKey
        next[scope].custom = createAiTemplateFields(state.custom)
        next[scope].customBaseName = String(state.customBaseName || '')
        next[scope].savedBases = Array.isArray(state.savedBases)
          ? state.savedBases.map((item) => ({
              id: String(item?.id || `${scope}-${Date.now()}`),
              label: String(item?.label || '').trim(),
              template: createAiTemplateFields(item?.template || item)
            })).filter((item) => item.label)
          : []
      })
      return next
    }

    const legacyRaw = window.localStorage.getItem('habitlearner.plan.ai-template.v1')
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw)
      const next = createStore()
      next.text.mode = parsed?.mode === 'custom' ? 'custom' : 'preset'
      next.text.presetKey = String(parsed?.preset || '').trim() || next.text.presetKey
      next.text.custom = createAiTemplateFields(parsed?.custom)
      return next
    }
  } catch (error) {
    console.warn('Failed to load AI template store', error)
  }

  return createStore()
}
const aiTemplateStore = ref(loadAiTemplateStore())
const currentAiTemplateScope = computed(() => {
  if (aiPanel.value.tab === 'image') return 'image'
  if (aiPanel.value.tab === 'video') return 'video'
  return 'text'
})
const ensureAiTemplateScopeState = (scope) => {
  if (!aiTemplateStore.value[scope]) {
    aiTemplateStore.value[scope] = createAiTemplateState(scope)
  }

  const state = aiTemplateStore.value[scope]
  if (!state.custom || typeof state.custom !== 'object') {
    state.custom = createAiTemplateFields()
  }
  if (!Array.isArray(state.savedBases)) {
    state.savedBases = []
  }
  if (!['preset', 'custom'].includes(state.mode)) {
    state.mode = 'preset'
  }

  const availableKeys = new Set((aiTemplateBuiltinPresetsByScope[scope] || []).map((item) => item.key))
  state.savedBases.forEach((item, index) => {
    if (!item.id) {
      item.id = `${scope}-custom-${index + 1}`
    }
    item.label = String(item.label || '').trim()
    item.template = createAiTemplateFields(item.template)
  })
  const allKeys = new Set([...availableKeys, ...state.savedBases.map((item) => item.id)])
  if (!allKeys.has(state.presetKey)) {
    state.presetKey = aiTemplateBuiltinPresetsByScope[scope]?.[0]?.key || ''
  }
  return state
}
const activeAiTemplateState = computed(() => ensureAiTemplateScopeState(currentAiTemplateScope.value))
const aiTemplateMode = computed({
  get: () => activeAiTemplateState.value.mode,
  set: (value) => {
    activeAiTemplateState.value.mode = value === 'custom' ? 'custom' : 'preset'
  }
})
const aiTemplatePreset = computed({
  get: () => activeAiTemplateState.value.presetKey,
  set: (value) => {
    activeAiTemplateState.value.presetKey = String(value || '').trim()
  }
})
const aiTemplateCustom = computed(() => activeAiTemplateState.value.custom)
const aiTemplateCustomBaseName = computed({
  get: () => activeAiTemplateState.value.customBaseName,
  set: (value) => {
    activeAiTemplateState.value.customBaseName = String(value || '')
  }
})
const aiTemplatePresets = computed(() => {
  const scope = currentAiTemplateScope.value
  const state = ensureAiTemplateScopeState(scope)
  const builtins = (aiTemplateBuiltinPresetsByScope[scope] || []).map((item) => ({
    key: item.key,
    label: item.label,
    source: 'builtin',
    template: createAiTemplateFields(item)
  }))
  const savedBases = state.savedBases.map((item) => ({
    key: item.id,
    label: item.label,
    source: 'custom',
    template: createAiTemplateFields(item.template)
  }))
  return [...builtins, ...savedBases]
})
const activeAiTemplatePreset = computed(() => (
  aiTemplatePresets.value.find((item) => item.key === aiTemplatePreset.value) || aiTemplatePresets.value[0] || null
))
const getResolvedAiTemplate = (scope = currentAiTemplateScope.value) => {
  const state = ensureAiTemplateScopeState(scope)
  if (state.mode === 'custom') {
    return {
      presetKey: 'custom',
      presetLabel: '高级自定义',
      ...createAiTemplateFields(state.custom)
    }
  }

  const preset = (
    (aiTemplateBuiltinPresetsByScope[scope] || []).find((item) => item.key === state.presetKey) ||
    state.savedBases.find((item) => item.id === state.presetKey) ||
    aiTemplateBuiltinPresetsByScope[scope]?.[0] ||
    null
  )

  const template = preset?.template || preset || {}
  return {
    presetKey: preset?.key || '',
    presetLabel: preset?.label || '',
    ...createAiTemplateFields(template)
  }
}
const resolvedAiTemplate = computed(() => getResolvedAiTemplate())
const aiTemplateSummary = computed(() => {
  const template = resolvedAiTemplate.value
  return [
    template.role,
    template.task,
    template.constraints,
    template.prohibitions
  ].filter(Boolean).slice(0, 2).join(' ')
})
const aiTemplateScopeLabel = computed(() => aiTemplateScopeLabels[currentAiTemplateScope.value] || 'AI 生成')
const aiTemplateScopeDescription = computed(() => aiTemplateScopeDescriptions[currentAiTemplateScope.value] || '用于当前 AI 工作区。')
const aiTemplateCustomBaseCount = computed(() => activeAiTemplateState.value.savedBases.length)
const persistAiTemplateStore = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(AI_TEMPLATE_STORAGE_KEY, JSON.stringify(aiTemplateStore.value))
  } catch (error) {
    console.warn('Failed to persist AI template store', error)
  }
}
const saveAiTemplateBase = () => {
  const state = activeAiTemplateState.value
  const template = createAiTemplateFields(state.custom)
  if (!template.role && !template.task && !template.constraints && !template.prohibitions) {
    showInfo('模板内容为空', { description: '先填写四段内容，再保存为模板底座。' })
    return
  }

  const scope = currentAiTemplateScope.value
  const label = String(state.customBaseName || '').trim() || `${aiTemplateScopeLabel.value}模板 ${state.savedBases.length + 1}`
  const savedBase = {
    id: `${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    template,
    createdAt: new Date().toISOString()
  }

  state.savedBases = [
    ...state.savedBases.filter((item) => item.label !== label),
    savedBase
  ]
  state.mode = 'preset'
  state.presetKey = savedBase.id
  state.customBaseName = ''
  showSuccess('已保存为模板底座')
}
const aiActionCooldownUntil = ref({
  outline: 0,
  polish: 0,
  questions: 0,
  inline: 0,
  image: 0,
  video: 0
})
const aiCooldownTick = ref(Date.now())
const inlineAiToolbar = ref({
  show: false,
  blockId: null,
  fieldKey: '',
  itemIndex: null,
  top: 0,
  left: 0,
  rangeStart: 0,
  rangeEnd: 0,
  hasSelection: false,
  selectedText: '',
  sourceText: ''
})
const inlineFormatToolbar = ref({
  show: false,
  blockId: null,
  fieldKey: '',
  itemIndex: null,
  top: 0,
  left: 0,
  rangeStart: 0,
  rangeEnd: 0,
  hasSelection: false,
  selectedText: '',
  sourceText: '',
  marks: {
    bold: false,
    italic: false,
    code: false,
    strike: false,
    highlight: false,
    link: false
  }
})
const inlineAi = ref({
  show: false,
  blockId: null,
  fieldKey: '',
  itemIndex: null,
  action: 'continue',
  prompt: '',
  loading: false,
  result: null,
  rangeStart: 0,
  rangeEnd: 0,
  hasSelection: false,
  selectedText: '',
  sourceText: ''
})
let removeKeydownListener = null
let removeClickListener = null
let removeSelectionChangeListener = null
let removeMouseupListener = null
let removeEditorKeyupListener = null
let removeResizeListener = null
let aiCooldownTimer = null
const commandItemsPerPage = 6

const blockComponents = {
  heading: defineAsyncComponent(() => import('@/views/plan/blocks/HeadingBlock.vue')),
  text: defineAsyncComponent(() => import('@/views/plan/blocks/TextBlock.vue')),
  page: defineAsyncComponent(() => import('@/views/plan/blocks/PageBlock.vue')),
  todo: defineAsyncComponent(() => import('@/views/plan/blocks/TodoBlock.vue')),
  toggle: defineAsyncComponent(() => import('@/views/plan/blocks/ToggleBlock.vue')),
  collapse: defineAsyncComponent(() => import('@/views/plan/blocks/ToggleBlock.vue')),
  divider: defineAsyncComponent(() => import('@/views/plan/blocks/DividerBlock.vue')),
  link_page: defineAsyncComponent(() => import('@/views/plan/blocks/LinkPageBlock.vue')),
  image: defineAsyncComponent(() => import('@/views/plan/blocks/ImageBlock.vue')),
  video: defineAsyncComponent(() => import('@/views/plan/blocks/VideoBlock.vue')),
  audio: defineAsyncComponent(() => import('@/views/plan/blocks/AudioBlock.vue')),
  quote: defineAsyncComponent(() => import('@/views/plan/blocks/QuoteBlock.vue')),
  callout: defineAsyncComponent(() => import('@/views/plan/blocks/CalloutBlock.vue')),
  code: defineAsyncComponent(() => import('@/views/plan/blocks/CodeBlock.vue')),
  file: defineAsyncComponent(() => import('@/views/plan/blocks/FileBlock.vue')),
  bookmark: defineAsyncComponent(() => import('@/views/plan/blocks/BookmarkBlock.vue')),
  table: defineAsyncComponent(() => import('@/views/plan/blocks/TableBlock.vue')),
  list: defineAsyncComponent(() => import('@/views/plan/blocks/ListBlock.vue')),
  database: defineAsyncComponent(() => import('@/views/plan/blocks/DatabaseViewBlock.vue')),
  toc: defineAsyncComponent(() => import('@/views/plan/blocks/TableOfContentsBlock.vue')),
  button: defineAsyncComponent(() => import('@/views/plan/blocks/ButtonBlock.vue')),
  breadcrumb: defineAsyncComponent(() => import('@/views/plan/blocks/BreadcrumbBlock.vue')),
  equation: defineAsyncComponent(() => import('@/views/plan/blocks/EquationBlock.vue')),
  formula: defineAsyncComponent(() => import('@/views/plan/blocks/EquationBlock.vue')),
  template_button: defineAsyncComponent(() => import('@/views/plan/blocks/TemplateButtonBlock.vue')),
  synced_block: defineAsyncComponent(() => import('@/views/plan/blocks/SyncedBlock.vue')),
  embed: defineAsyncComponent(() => import('@/views/plan/blocks/EmbedBlock.vue'))
}

const createBlockContent = (type) => ({
  heading: { text: '', level: 1 },
  text: { text: '' },
  page: { title: '子页面', summary: '', pageId: null, icon: 'P' },
  todo: { text: '', done: false },
  toggle: { title: '', text: '', open: true },
  collapse: { title: '', text: '', open: true },
  divider: { style: 'solid' },
  link_page: { pageId: '', pageTitle: '', note: '' },
  image: { url: '', alt: '', displayStyle: 'full-width' },
  video: { url: '', title: '', mimeType: '' },
  audio: { url: '', title: '', mimeType: '' },
  quote: { text: '' },
  callout: { text: '', variant: 'info' },
  code: { lang: 'javascript', code: '' },
  file: { url: '', name: '', caption: '', size: 0, mimeType: '' },
  bookmark: { url: '', title: '', description: '' },
  table: { headers: ['列 1', '列 2'], rows: [['', '']] },
  list: { listType: 'unordered', items: ['列表项 1', '列表项 2'] },
  database: { title: '数据库', viewType: 'table', rows: [{ id: '1', title: '条目 1', status: '未开始', date: '', note: '' }] },
  toc: { title: '目录' },
  button: { label: '按钮', url: '', style: 'primary' },
  breadcrumb: { rootLabel: '首页', currentLabel: '' },
  equation: { latex: '' },
  formula: { latex: '' },
  template_button: { label: '插入模板', template: 'meeting' },
  synced_block: { syncKey: '', role: 'source', text: '' },
  embed: { variant: 'embed', url: '', title: '' }
}[type] || { text: '' })

const commandItems = [
  { key: 'text', category: '文本', type: 'text', icon: 'TXT', label: 'Text', description: '普通正文段落', tags: ['文本', 'paragraph', 'text'] },
  { key: 'page', category: '文本', type: 'page', icon: 'PAGE', label: 'Page', description: '插入一个子页面块', tags: ['页面', 'subpage'] },
  { key: 'todo', category: '文本', type: 'todo', icon: 'TODO', label: 'To-do list', description: '可勾选的待办清单', tags: ['待办', 'task', 'checkbox'] },
  { key: 'heading-1', category: '文本', type: 'heading', icon: 'H1', label: 'Heading 1', description: '一级标题', tags: ['标题', 'h1'], createContent: () => ({ text: '', level: 1 }) },
  { key: 'heading-2', category: '文本', type: 'heading', icon: 'H2', label: 'Heading 2', description: '二级标题', tags: ['标题', 'h2'], createContent: () => ({ text: '', level: 2 }) },
  { key: 'heading-3', category: '文本', type: 'heading', icon: 'H3', label: 'Heading 3', description: '三级标题', tags: ['标题', 'h3'], createContent: () => ({ text: '', level: 3 }) },
  { key: 'bulleted-list', category: '文本', type: 'list', icon: 'UL', label: 'Bulleted list', description: '项目符号列表', tags: ['bullet', '项目列表'], createContent: () => ({ listType: 'unordered', items: ['列表项 1'] }) },
  { key: 'numbered-list', category: '文本', type: 'list', icon: 'OL', label: 'Numbered list', description: '编号列表', tags: ['ordered', '编号列表'], createContent: () => ({ listType: 'ordered', items: ['列表项 1'] }) },
  { key: 'toggle', category: '文本', type: 'toggle', icon: 'TOG', label: 'Toggle list', description: '可折叠内容块', tags: ['toggle', '折叠'] },
  { key: 'quote', category: '文本', type: 'quote', icon: 'QTE', label: 'Quote', description: '引用说明块', tags: ['quote', '引用'] },
  { key: 'divider', category: '文本', type: 'divider', icon: '---', label: 'Divider', description: '插入分割线', tags: ['divider', '分割线'] },
  { key: 'link-page', category: '文本', type: 'link_page', icon: 'LINK', label: 'Link to page', description: '链接到其他页面', tags: ['页面链接', 'link'] },
  { key: 'callout', category: '文本', type: 'callout', icon: 'NOTE', label: 'Callout', description: '重点标注块', tags: ['callout', '提示块'] },

  { key: 'image', category: '媒体', type: 'image', icon: 'IMG', label: 'Image', description: '图片块', tags: ['图片', 'image'] },
  { key: 'video', category: '媒体', type: 'video', icon: 'VID', label: 'Video', description: '视频块', tags: ['视频', 'video'] },
  { key: 'audio', category: '媒体', type: 'audio', icon: 'AUD', label: 'Audio', description: '音频块', tags: ['音频', 'audio'] },
  { key: 'code', category: '媒体', type: 'code', icon: 'CODE', label: 'Code', description: '代码块', tags: ['代码', 'snippet'] },
  { key: 'file', category: '媒体', type: 'file', icon: 'FILE', label: 'File', description: '通用文件附件', tags: ['文件', 'attachment'] },
  { key: 'bookmark', category: '媒体', type: 'bookmark', icon: 'WEB', label: 'Web bookmark', description: '网页书签卡片', tags: ['书签', 'bookmark', 'web'] },

  { key: 'db-table', category: '数据库', type: 'database', icon: 'DB', label: 'Table', description: '表格视图数据库', tags: ['database', 'table'], createContent: () => ({ ...createBlockContent('database'), viewType: 'table' }) },
  { key: 'db-board', category: '数据库', type: 'database', icon: 'KAN', label: 'Board', description: '看板视图数据库', tags: ['database', 'board', 'kanban'], createContent: () => ({ ...createBlockContent('database'), viewType: 'board' }) },
  { key: 'db-gallery', category: '数据库', type: 'database', icon: 'GAL', label: 'Gallery', description: '画廊视图数据库', tags: ['database', 'gallery'], createContent: () => ({ ...createBlockContent('database'), viewType: 'gallery' }) },
  { key: 'db-list', category: '数据库', type: 'database', icon: 'LST', label: 'List', description: '列表视图数据库', tags: ['database', 'list'], createContent: () => ({ ...createBlockContent('database'), viewType: 'list' }) },
  { key: 'db-calendar', category: '数据库', type: 'database', icon: 'CAL', label: 'Calendar', description: '日历视图数据库', tags: ['database', 'calendar'], createContent: () => ({ ...createBlockContent('database'), viewType: 'calendar' }) },
  { key: 'db-timeline', category: '数据库', type: 'database', icon: 'TL', label: 'Timeline', description: '时间轴视图数据库', tags: ['database', 'timeline'], createContent: () => ({ ...createBlockContent('database'), viewType: 'timeline' }) },

  { key: 'toc', category: '高级', type: 'toc', icon: 'TOC', label: 'Table of contents', description: '自动目录', tags: ['目录', 'toc'] },
  { key: 'button', category: '高级', type: 'button', icon: 'BTN', label: 'Button', description: '操作按钮块', tags: ['按钮', 'button'] },
  { key: 'breadcrumb', category: '高级', type: 'breadcrumb', icon: 'BC', label: 'Breadcrumb', description: '面包屑导航', tags: ['breadcrumb', '导航'] },
  { key: 'equation', category: '高级', type: 'equation', icon: 'EQ', label: 'Equation', description: '公式块', tags: ['公式', 'equation', 'latex'] },
  { key: 'template-button', category: '高级', type: 'template_button', icon: 'TPL', label: 'Template button', description: '一键插入模板', tags: ['模板按钮', 'template'] },
  { key: 'synced-block', category: '高级', type: 'synced_block', icon: 'SYNC', label: 'Synced block', description: '同步块', tags: ['同步块', 'sync'] },

  { key: 'embed', category: '嵌入', type: 'embed', icon: 'EMB', label: 'Embed', description: '嵌入网页或服务', tags: ['嵌入', 'embed'], createContent: () => ({ variant: 'embed', url: '', title: '' }) },
  { key: 'google-drive', category: '嵌入', type: 'embed', icon: 'DRV', label: 'Google Drive', description: '嵌入云端文件', tags: ['drive', 'google drive'], createContent: () => ({ variant: 'google_drive', url: '', title: 'Google Drive' }) },
  { key: 'tweet', category: '嵌入', type: 'embed', icon: 'TWT', label: 'Tweet', description: '嵌入社交动态', tags: ['tweet', 'twitter'], createContent: () => ({ variant: 'tweet', url: '', title: 'Tweet' }) },
  { key: 'gist', category: '嵌入', type: 'embed', icon: 'GST', label: 'GitHub Gist', description: '嵌入代码片段', tags: ['gist', 'github gist'], createContent: () => ({ variant: 'github_gist', url: '', title: 'GitHub Gist' }) },
  { key: 'maps', category: '嵌入', type: 'embed', icon: 'MAP', label: 'Maps', description: '嵌入地图', tags: ['maps', 'map'], createContent: () => ({ variant: 'maps', url: '', title: 'Maps' }) }
]

const inlineAiActions = [
  { key: 'continue', label: '继续写', runLabel: '开始续写', resultLabel: '续写结果', fieldLabel: '续写要求' },
  { key: 'rewrite', label: '改写', runLabel: '开始改写', resultLabel: '改写结果', fieldLabel: '改写要求' },
  { key: 'summarize', label: '总结', runLabel: '生成总结', resultLabel: '总结结果', fieldLabel: '总结要求' },
  { key: 'todo', label: '转待办', runLabel: '生成待办', resultLabel: '待办建议', fieldLabel: '待办要求' },
  { key: 'outline', label: '转大纲', runLabel: '生成大纲', resultLabel: '大纲建议', fieldLabel: '大纲要求' }
]

const workspaceAiToolbarActions = [
  { tab: 'outline', label: 'AI 生成' },
  { tab: 'polish', label: 'AI 润色' },
  { tab: 'questions', label: 'AI 提问' },
  { tab: 'image', label: 'AI 生图' },
  { tab: 'video', label: 'AI 生视频' }
]

const inlineFormatAllowedFields = ['text', 'title', 'summary', 'pageTitle', 'note', 'label', 'rootLabel', 'currentLabel']

const inlineAiFieldMap = {
  heading: 'text',
  text: 'text',
  todo: 'text',
  quote: 'text',
  callout: 'text',
  code: 'code',
  page: 'title',
  toggle: 'title',
  collapse: 'title',
  link_page: 'pageTitle',
  list: 'items',
  button: 'label',
  breadcrumb: 'rootLabel',
  equation: 'latex',
  formula: 'latex',
  synced_block: 'text'
}

const getAiCooldownRemaining = (action) => {
  const until = Number(aiActionCooldownUntil.value[action] || 0)
  return Math.max(0, Math.ceil((until - aiCooldownTick.value) / 1000))
}

const isAiCoolingDown = (action) => getAiCooldownRemaining(action) > 0

const startAiCooldown = (action, seconds = 12) => {
  aiActionCooldownUntil.value = {
    ...aiActionCooldownUntil.value,
    [action]: Date.now() + (seconds * 1000)
  }
}

const maybeStartAiCooldown = (action, response, seconds = 12) => {
  const message = `${response?.error || ''} ${response?.message || ''}`
  if (response?.code === 429 || /频繁|过于频繁|rate limit|too many requests/i.test(message)) {
    startAiCooldown(action, seconds)
    return true
  }
  return false
}

const getAiActionButtonText = (action, idleText, loading, loadingText = '处理中...') => {
  if (loading) return loadingText
  const cooldown = getAiCooldownRemaining(action)
  return cooldown > 0 ? `${cooldown}s 后再试` : idleText
}

const aiImageModelOptions = [
  { value: 'agnes-image-2.0-flash', label: 'Agnes Image 2.0 Flash' },
  { value: 'agnes-image-2.1-flash', label: 'Agnes Image 2.1 Flash' }
]

const aiVideoModelOptions = [
  { value: 'agnes-video-v2.0', label: 'Agnes Video V2.0' }
]

const aiImageSizeOptions = [
  '1024x1024',
  '1024x1536',
  '1536x1024',
  '2048x2048'
]

const aiImageRatioOptions = ['1:1', '3:2', '2:3', '16:9', '9:16']

const aiVideoResolutionOptions = [
  { label: '竖版 720x1280', width: 720, height: 1280 },
  { label: '横版 1280x720', width: 1280, height: 720 },
  { label: '方形 1024x1024', width: 1024, height: 1024 }
]

const cloneContent = (value) => JSON.parse(JSON.stringify(value ?? null))
const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const getBlockTextContent = (block) => {
  const content = block?.content || {}
  switch (block?.type) {
    case 'heading':
    case 'text':
    case 'todo':
    case 'quote':
    case 'callout':
      return content.text || ''
    case 'page':
      return [content.title, content.summary].filter(Boolean).join('\n')
    case 'toggle':
    case 'collapse':
      return [content.title, content.text].filter(Boolean).join('\n')
    case 'link_page':
      return [content.pageTitle, content.note].filter(Boolean).join('\n')
    case 'code':
      return content.code || ''
    case 'file':
      return [content.name, content.caption].filter(Boolean).join('\n')
    case 'bookmark':
      return [content.title, content.description, content.url].filter(Boolean).join('\n')
    case 'list':
      return Array.isArray(content.items) ? content.items.join('\n') : ''
    case 'table': {
      const headers = Array.isArray(content.headers) ? content.headers.join(', ') : ''
      const rows = Array.isArray(content.rows) ? content.rows.map((row) => row.join(', ')).join('\n') : ''
      return [headers, rows].filter(Boolean).join('\n')
    }
    case 'database':
      return Array.isArray(content.rows) ? content.rows.map((row) => row.title || '').join('\n') : ''
    case 'equation':
    case 'formula':
      return content.latex || ''
    case 'button':
      return [content.label, content.url].filter(Boolean).join(' ')
    case 'breadcrumb':
      return [content.rootLabel, content.currentLabel || title.value].filter(Boolean).join(' / ')
    case 'synced_block':
      return content.text || ''
    case 'embed':
      return [content.title, content.url].filter(Boolean).join(' ')
    case 'image':
      return content.alt || ''
    default:
      return content.text || ''
  }
}

const getBlockById = (blockId) => blocks.value.find((block) => String(block.id) === String(blockId)) || null

const getBlockIndexById = (blockId) => blocks.value.findIndex((block) => String(block.id) === String(blockId))

const supportsInlineAi = (block) => !!inlineAiFieldMap[block?.type]

const createInlineAiTarget = (block, context = {}) => {
  const itemIndex = Number.isInteger(context?.itemIndex)
    ? context.itemIndex
    : (Number.isFinite(Number(context?.itemIndex)) ? Number(context.itemIndex) : null)

  return {
    fieldKey: context?.fieldKey || inlineAiFieldMap[block?.type] || 'text',
    itemIndex
  }
}

const getInlineAiEditableText = (block, context = {}) => {
  if (!block || !supportsInlineAi(block)) return ''
  const content = block.content || {}
  const target = createInlineAiTarget(block, context)

  switch (block.type) {
    case 'list':
      if (target.fieldKey === 'items' && Number.isInteger(target.itemIndex)) {
        return String((Array.isArray(content.items) ? content.items[target.itemIndex] : '') || '')
      }
      return Array.isArray(content.items) ? content.items.join('\n') : ''
    case 'page':
      return String(content[target.fieldKey === 'summary' ? 'summary' : 'title'] || '')
    case 'toggle':
    case 'collapse':
      return String(content[target.fieldKey === 'text' ? 'text' : 'title'] || '')
    case 'link_page':
      return String(content[target.fieldKey === 'note' ? 'note' : 'pageTitle'] || '')
    case 'button':
      return String(content[target.fieldKey === 'url' ? 'url' : 'label'] || '')
    case 'breadcrumb':
      return String(content[target.fieldKey === 'currentLabel' ? 'currentLabel' : 'rootLabel'] || '')
    case 'equation':
    case 'formula':
      return String(content.latex || '')
    case 'synced_block':
      return String(content[target.fieldKey === 'syncKey' ? 'syncKey' : 'text'] || '')
    default:
      return String(content[target.fieldKey] || '')
  }
}

const buildInlineAiPreviewText = (value, emptyFallback = '当前块为空，先写一点内容再调用 AI。') => {
  const text = String(value || '').trim()
  if (!text) return emptyFallback
  return text.length > 140 ? `${text.slice(0, 140)}...` : text
}

const getInlineAiOutlineLabel = (block) => {
  const typeLabels = {
    heading: '标题',
    text: '文本',
    todo: '待办',
    list: '列表',
    table: '表格',
    callout: '标注',
    quote: '引用',
    code: '代码'
  }
  return typeLabels[block?.type] || '数据库'
}

const getInlineAiOutlinePreview = (block) => buildInlineAiPreviewText(getBlockTextContent(block), '这个块暂时没有可预览内容。')

const normalizeTodoItems = (text = '') => {
  return String(text || '')
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*]|\d+[.)]|[\u2610\u2611])\s*/, '').trim())
    .filter(Boolean)
}

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result || ''))
  reader.onerror = () => reject(new Error('读取文件失败'))
  reader.readAsDataURL(file)
})

const normalizeMediaLabel = (fileName = '') => fileName || `素材-${Date.now()}`
const isPublicHttpUrl = (value = '') => /^https?:\/\//i.test(String(value || '').trim())
const isAgnesReachableHttpUrl = (value = '') => {
  const trimmed = String(value || '').trim()
  if (!isPublicHttpUrl(trimmed)) return false

  try {
    const { hostname } = new URL(trimmed)
    if (!hostname) return false
    if (/^(localhost|127\.)/i.test(hostname)) return false
    if (/^10\./.test(hostname)) return false
    if (/^192\.168\./.test(hostname)) return false
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)) return false
    if (/^\[?::1\]?$/.test(hostname)) return false
    return true
  } catch (error) {
    return false
  }
}
const createRemoteMediaSource = (url, name = '', options = {}) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: normalizeMediaLabel(name || `参考图-${Date.now()}`),
  previewUrl: String(options.previewUrl || url || '').trim(),
  remoteUrl: String(url || '').trim(),
  absoluteUrl: String(options.absoluteUrl || options.previewUrl || url || '').trim(),
  isPublic: options.isPublic !== false
})

const clearAiImagePolling = () => {
  if (aiImagePollingTimer.value) {
    window.clearInterval(aiImagePollingTimer.value)
    aiImagePollingTimer.value = null
  }
}

const clearAiVideoPolling = () => {
  if (aiVideoPollingTimer.value) {
    window.clearInterval(aiVideoPollingTimer.value)
    aiVideoPollingTimer.value = null
  }
}

const insertGeneratedImageBlock = async (item) => {
  const url = item?.previewUrl || item?.url
  if (!url) return
  const anchorIndex = activeBlock.value
    ? blocks.value.findIndex((block) => block.id === activeBlock.value.id)
    : blocks.value.length - 1
  await insertBlocksAfter(anchorIndex, [{
    type: 'image',
    content: {
      url,
      alt: aiImagePrompt.value.trim() || 'AI 生成图片',
      displayStyle: 'full-width'
    }
  }])
  showSuccess('图片已插入当前计划')
}

const insertGeneratedVideoBlock = async (video) => {
  const url = video?.url
  if (!url) return
  const anchorIndex = activeBlock.value
    ? blocks.value.findIndex((block) => block.id === activeBlock.value.id)
    : blocks.value.length - 1
  await insertBlocksAfter(anchorIndex, [{
    type: 'video',
    content: {
      url,
      title: aiVideoPrompt.value.trim() || 'AI 生成视频',
      mimeType: 'video/mp4'
    }
  }])
  showSuccess('视频已插入当前计划')
}

const currentInlineAiAction = computed(() => inlineAiActions.find((item) => item.key === inlineAi.value.action) || inlineAiActions[0])

const inlineAiPromptPlaceholder = computed(() => ({
  continue: '补充你想继续写的方向，例如“围绕执行步骤展开，并控制在 100 字内”。',
  rewrite: '补充你想改写的风格，例如“更简洁，更像 Notion 文档语气”。',
  summarize: '补充你想总结的形式，例如“提炼成 3 条重点”。',
  todo: '补充你想拆解的目标，例如“整理成可直接执行的待办清单”。',
  outline: '补充你想要的大纲结构，例如“按目标、步骤、风险来组织”。'
}[inlineAi.value.action] || '补充要求'))

const inlineAiContextPreview = computed(() => {
  const source = inlineAi.value.hasSelection ? inlineAi.value.selectedText : inlineAi.value.sourceText
  return buildInlineAiPreviewText(source)
})

const getBlockEditor = (blockId, context = {}) => {
  const row = document.querySelector(`.plan-row[data-block-id="${String(blockId)}"]`)
  const fieldKey = context?.fieldKey || ''
  const itemIndex = Number.isInteger(context?.itemIndex) ? context.itemIndex : null

  if (row && fieldKey) {
    if (itemIndex !== null) {
      const indexed = row.querySelector(`[data-ai-field="${fieldKey}"][data-ai-item-index="${String(itemIndex)}"]`)
      if (indexed) return indexed
    }
    const fieldEditor = row.querySelector(`[data-ai-field="${fieldKey}"]`)
    if (fieldEditor) return fieldEditor
  }

  return row?.querySelector('textarea, input, [contenteditable="true"]') || null
}

const focusBlockRange = async (blockId, start = 0, end = start, context = {}) => {
  await nextTick()
  const editor = getBlockEditor(blockId, context)
  editor?.focus?.()
  if (typeof editor?.__setSelectionRange === 'function') {
    editor.__setSelectionRange(start, end)
    return
  }
  if (typeof editor?.setSelectionRange === 'function') {
    editor.setSelectionRange(start, end)
  }
}

const setInlineAiEditableText = async (block, nextText, selectionStart = null, selectionEnd = selectionStart, context = {}) => {
  if (!block || !supportsInlineAi(block)) return false
  const current = cloneContent(block.content) || createBlockContent(block.type)
  const field = context.fieldKey || inlineAiFieldMap[block.type]
  let nextContent = current

  if (block.type === 'list') {
    const items = Array.isArray(current.items) ? [...current.items] : []
    if (Number.isInteger(context.itemIndex) && context.itemIndex >= 0) {
      items[context.itemIndex] = String(nextText || '')
    } else {
      const listItems = String(nextText || '').split('\n').map((line) => line.trim()).filter(Boolean)
      nextContent = {
        ...current,
        items: listItems.length ? listItems : items.length ? items : ['']
      }
    }
    if (!nextContent.items) {
      nextContent = { ...current, items: items.length ? items : [''] }
    }
  } else {
    nextContent = {
      ...current,
      [field]: String(nextText || '')
    }
  }

  updateBlockContent(block, nextContent)
  if (selectionStart !== null) {
    await focusBlockRange(block.id, selectionStart, selectionEnd ?? selectionStart, context)
  }
  return true
}

const closeInlineAiToolbar = () => {
  inlineAiToolbar.value = {
    show: false,
    blockId: null,
    fieldKey: '',
    itemIndex: null,
    top: 0,
    left: 0,
    rangeStart: 0,
    rangeEnd: 0,
    hasSelection: false,
    selectedText: '',
    sourceText: ''
  }
}

const closeInlineFormatToolbar = () => {
  inlineFormatToolbar.value = {
    show: false,
    blockId: null,
    fieldKey: '',
    itemIndex: null,
    top: 0,
    left: 0,
    rangeStart: 0,
    rangeEnd: 0,
    hasSelection: false,
    selectedText: '',
    sourceText: '',
    marks: {
      bold: false,
      italic: false,
      code: false,
      strike: false,
      highlight: false,
      link: false
    }
  }
}

const closeInlineAi = () => {
  inlineAi.value = {
    show: false,
    blockId: null,
    fieldKey: '',
    itemIndex: null,
    action: 'continue',
    prompt: '',
    loading: false,
    result: null,
    rangeStart: 0,
    rangeEnd: 0,
    hasSelection: false,
    selectedText: '',
    sourceText: ''
  }
}

const isTextBlockEditable = (element) => !!element?.closest?.('.text-block')

const supportsInlineFormatContext = (context, element) => {
  if (!context?.blockId) return false
  if (isTextBlockEditable(element)) return false
  return inlineFormatAllowedFields.includes(context.fieldKey || '')
}

const isWrappedSelection = (value, start, end, leftToken, rightToken = leftToken) => {
  if (start < leftToken.length || end + rightToken.length > value.length) return false
  return value.slice(start - leftToken.length, start) === leftToken
    && value.slice(end, end + rightToken.length) === rightToken
}

const isWrappedCursor = (value, cursor, leftToken, rightToken = leftToken) => {
  if (cursor < leftToken.length || cursor + rightToken.length > value.length) return false
  return value.slice(cursor - leftToken.length, cursor) === leftToken
    && value.slice(cursor, cursor + rightToken.length) === rightToken
}

const getInlineFormatMarks = (value = '', start = 0, end = 0) => {
  const text = String(value || '')
  const collapsed = start === end
  const wrapped = (leftToken, rightToken = leftToken) => (
    collapsed
      ? isWrappedCursor(text, start, leftToken, rightToken)
      : isWrappedSelection(text, start, end, leftToken, rightToken)
  )

  const segment = start === end ? '' : text.slice(start, end)
  const linkWrapped = collapsed
    ? /\[[^\]]*\]\((https?:\/\/|mailto:)[^)]*\)$/i.test(text.slice(0, start))
    : /^\[[\s\S]+\]\((https?:\/\/|mailto:)[^)]*\)$/i.test(segment)

  return {
    bold: wrapped('**'),
    italic: wrapped('*'),
    code: wrapped('`'),
    strike: wrapped('~~'),
    highlight: wrapped('=='),
    link: linkWrapped
  }
}

const buildInlineAiContextFromElement = (element, options = {}) => {
  const { allowCollapsed = true } = options
  if (!element?.closest) return null

  const row = element.closest('.plan-row')
  if (!row) return null

  const block = getBlockById(row.dataset.blockId)
  if (!supportsInlineAi(block)) return null

  const fieldKey = element.dataset?.aiField || inlineAiFieldMap[block.type] || 'text'
  const itemIndex = Number.isFinite(Number(element.dataset?.aiItemIndex)) ? Number(element.dataset.aiItemIndex) : null

  const value = typeof element.__getPlainText === 'function'
    ? element.__getPlainText()
    : (typeof element.value === 'string' ? element.value : getInlineAiEditableText(block, { fieldKey, itemIndex }))
  const selection = typeof element.__getSelectionRange === 'function'
    ? element.__getSelectionRange()
    : {
        start: Number.isInteger(element.selectionStart) ? element.selectionStart : value.length,
        end: Number.isInteger(element.selectionEnd) ? element.selectionEnd : value.length
      }
  const rangeStart = selection.start
  const rangeEnd = selection.end
  const hasSelection = rangeEnd > rangeStart

  if (!allowCollapsed && !hasSelection) return null

  const rect = element.getBoundingClientRect()
  const centerX = rect.left + (rect.width / 2)

  return {
    blockId: block.id,
    fieldKey,
    itemIndex,
    sourceText: value,
    selectedText: hasSelection ? value.slice(rangeStart, rangeEnd) : '',
    hasSelection,
    rangeStart,
    rangeEnd,
    top: Math.max(16, rect.top - 44),
    left: clamp(centerX, 140, window.innerWidth - 140)
  }
}

const buildInlineFormatContextFromElement = (element, options = {}) => {
  const context = buildInlineAiContextFromElement(element, options)
  if (!context || !supportsInlineFormatContext(context, element)) return null

  const rect = element.getBoundingClientRect()
  const centerX = rect.left + (rect.width / 2)

  return {
    ...context,
    top: Math.max(58, rect.top + 2),
    left: clamp(centerX, 140, window.innerWidth - 140),
    marks: getInlineFormatMarks(context.sourceText, context.rangeStart, context.rangeEnd)
  }
}

const refreshInlineAiToolbar = () => {
  if (inlineAi.value.show) {
    closeInlineAiToolbar()
    return
  }

  const activeElement = document.activeElement
  const context = buildInlineAiContextFromElement(activeElement, { allowCollapsed: true })
  if (!context) {
    closeInlineAiToolbar()
    return
  }

  inlineAiToolbar.value = {
    show: true,
    fieldKey: context.fieldKey || '',
    itemIndex: Number.isInteger(context.itemIndex) ? context.itemIndex : null,
    ...context
  }
}

const refreshInlineFormatToolbar = () => {
  if (inlineAi.value.show) {
    closeInlineFormatToolbar()
    return
  }

  const activeElement = document.activeElement
  const context = buildInlineFormatContextFromElement(activeElement, { allowCollapsed: true })
  if (!context) {
    closeInlineFormatToolbar()
    return
  }

  inlineFormatToolbar.value = {
    show: true,
    fieldKey: context.fieldKey || '',
    itemIndex: Number.isInteger(context.itemIndex) ? context.itemIndex : null,
    ...context
  }
}

const handleBlockFocus = (blockId) => {
  activeBlockId.value = blockId
  window.setTimeout(() => {
    refreshInlineAiToolbar()
    refreshInlineFormatToolbar()
  }, 0)
}

const openInlineAi = (context, action = 'continue') => {
  if (!context?.blockId) {
    showInfo('未定位到可编辑块', { description: '请先选中或聚焦一个文本块，再打开 AI。' })
    return
  }

  closeCommandMenu()
  closeRowMenu()
  closeAiPanel()
  closeInlineAiToolbar()
  closeInlineFormatToolbar()
  activeBlockId.value = context.blockId

  inlineAi.value = {
    show: true,
    blockId: context.blockId,
    fieldKey: context.fieldKey || '',
    itemIndex: Number.isInteger(context.itemIndex) ? context.itemIndex : null,
    action,
    prompt: '',
    loading: false,
    result: null,
    rangeStart: context.rangeStart || 0,
    rangeEnd: context.rangeEnd || 0,
    hasSelection: !!context.hasSelection,
    selectedText: context.selectedText || '',
    sourceText: context.sourceText || ''
  }
}

const openInlineAiFromBlock = async (block) => {
  if (!supportsInlineAi(block)) {
    showInfo('当前内容不支持块内 AI', { description: '目前支持文本、标题、待办、引用、标注和代码块。' })
    return
  }

  activeBlockId.value = block.id
  await focusBlockById(block.id)
  const editor = getBlockEditor(block.id)
  const context = buildInlineAiContextFromElement(editor, { allowCollapsed: true }) || {
    blockId: block.id,
    fieldKey: inlineAi.value.fieldKey || inlineAiFieldMap[block.type] || 'text',
    itemIndex: Number.isInteger(inlineAi.value.itemIndex) ? inlineAi.value.itemIndex : null,
    sourceText: getInlineAiEditableText(block, inlineAi.value),
    selectedText: '',
    hasSelection: false,
    rangeStart: getInlineAiEditableText(block, inlineAi.value).length,
    rangeEnd: getInlineAiEditableText(block, inlineAi.value).length
  }
  openInlineAi(context, inlineAi.value.show && inlineAi.value.blockId === block.id ? inlineAi.value.action : 'continue')
}

const openInlineAiFromActiveBlock = async () => {
  const block = activeBlock.value || blocks.value.find((item) => supportsInlineAi(item))
  if (!block) {
    showInfo('还没有可用的文本块', { description: '先新建一个文本块，再打开 AI 快捷操作。' })
    return
  }
  await openInlineAiFromBlock(block)
}

const triggerInlineAiQuickAction = (action) => {
  openInlineAi({ ...inlineAiToolbar.value }, action)
}

const applyWrappedTextFormat = async (leftToken, rightToken = leftToken) => {
  const activeElement = document.activeElement
  const context = buildInlineFormatContextFromElement(activeElement, { allowCollapsed: true })
  if (!context?.blockId) return

  const block = getBlockById(context.blockId)
  if (!block) return

  const currentText = String(context.sourceText || '')
  const start = context.rangeStart || 0
  const end = context.rangeEnd || 0

  let nextText = currentText
  let nextStart = start
  let nextEnd = end

  if (start === end) {
    if (isWrappedCursor(currentText, start, leftToken, rightToken)) {
      nextText = `${currentText.slice(0, start - leftToken.length)}${currentText.slice(start + rightToken.length)}`
      nextStart = Math.max(0, start - leftToken.length)
      nextEnd = nextStart
    } else {
      nextText = `${currentText.slice(0, start)}${leftToken}${rightToken}${currentText.slice(end)}`
      nextStart = start + leftToken.length
      nextEnd = nextStart
    }
  } else if (isWrappedSelection(currentText, start, end, leftToken, rightToken)) {
    nextText = `${currentText.slice(0, start - leftToken.length)}${currentText.slice(start, end)}${currentText.slice(end + rightToken.length)}`
    nextStart = start - leftToken.length
    nextEnd = end - leftToken.length
  } else {
    nextText = `${currentText.slice(0, start)}${leftToken}${currentText.slice(start, end)}${rightToken}${currentText.slice(end)}`
    nextStart = start + leftToken.length
    nextEnd = end + leftToken.length
  }

  await setInlineAiEditableText(block, nextText, nextStart, nextEnd, context)
  await nextTick()
  refreshInlineFormatToolbar()
  refreshInlineAiToolbar()
}

const applyLinkTextFormat = async () => {
  const activeElement = document.activeElement
  const context = buildInlineFormatContextFromElement(activeElement, { allowCollapsed: true })
  if (!context?.blockId) return

  const block = getBlockById(context.blockId)
  if (!block) return

  const url = window.prompt('请输入链接地址', 'https://')
  if (!url) return

  const normalizedUrl = /^(https?:\/\/|mailto:)/i.test(url) ? url : `https://${url}`
  const currentText = String(context.sourceText || '')
  const start = context.rangeStart || 0
  const end = context.rangeEnd || 0
  const selected = currentText.slice(start, end)
  const label = window.prompt('请输入链接显示名称', selected || '链接文本')
  if (label === null) return
  const linkLabel = label.trim() || selected || normalizedUrl
  const linkText = `[${linkLabel}](${normalizedUrl})`
  const nextText = `${currentText.slice(0, start)}${linkText}${currentText.slice(end)}`
  const cursor = start + linkText.length

  await setInlineAiEditableText(block, nextText, cursor, cursor, context)
  await nextTick()
  refreshInlineFormatToolbar()
  refreshInlineAiToolbar()
}
const applyInlineFormat = async (action) => {
  switch (action) {
    case 'bold':
      await applyWrappedTextFormat('**')
      return
    case 'italic':
      await applyWrappedTextFormat('*')
      return
    case 'code':
      await applyWrappedTextFormat('`')
      return
    case 'strike':
      await applyWrappedTextFormat('~~')
      return
    case 'highlight':
      await applyWrappedTextFormat('==')
      return
    case 'link':
      await applyLinkTextFormat()
      return
    case 'ai':
      openInlineAi({ ...inlineFormatToolbar.value }, inlineAi.value.show ? inlineAi.value.action : 'continue')
      return
    default:
  }
}

const switchInlineAiAction = (action) => {
  inlineAi.value.action = action
  inlineAi.value.result = null
}

const buildInlineAiInstruction = (action, prompt, contextText) => {
  const suffix = prompt ? `\n补充要求：${prompt}` : ''
  switch (action) {
    case 'continue':
      return `请基于当前内容继续往下写，保持原有语气和结构，不要重复已经出现的内容，只输出可以直接插入编辑器的正文。${suffix}`.trim()
    case 'rewrite':
      return `请在不改变原意的前提下改写这段内容，让表达更清晰、更自然，并适合放进 Notion 风格的计划文档。${suffix}`.trim()
    case 'summarize':
      return `请总结下面的内容，输出可以直接放进文档的简洁总结。${suffix}`.trim()
    case 'todo':
      return `请把下面的内容拆成可执行的待办清单，每行一条，不要解释，只输出待办项。${suffix}`.trim()
    default:
      return `请处理下面的内容。${suffix}`.trim()
  }
}

const summarizeBlocksForAi = (limit = 80) => {
  return blocks.value.slice(0, limit).map((block, index) => ({
    id: block.id,
    type: block.type,
    order: block.order || index + 1,
    summary: getBlockTextContent(block),
    content: block.content || createBlockContent(block.type)
  }))
}

const activeBlock = computed(() => {
  if (!blocks.value.length) return null
  return blocks.value.find((block) => block.id === activeBlockId.value) || blocks.value[0] || null
})

const selectedBlockCount = computed(() => selectedBlockIds.value.size)

const activePolishHint = computed(() => {
  if (!activeBlock.value) {
    return '当前没有可润色的块，请先在编辑区选中一个文本块。'
  }

  const preview = getBlockTextContent(activeBlock.value)
  if (!preview) {
    return `当前块类型为 ${activeBlock.value.type}，内容为空，先写一点再开始润色。`
  }

  return `正在润色当前块：${preview.slice(0, 100)}${preview.length > 100 ? '...' : ''}`
})

const previewBlockContent = (block) => {
  if (!block) return ''
  return getBlockTextContent(block) || JSON.stringify(block.content || {})
}

const buildTableContentFromText = (text = '') => {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
  if (!lines.length) return createBlockContent('table')

  const rows = lines.map((line) => line.split(/[,\t|]/).map((cell) => cell.trim()))
  const headers = rows.shift() || ['列 1', '列 2']
  const normalizedRows = rows.length ? rows : [new Array(headers.length || 2).fill('')]

  return {
    headers: headers.length ? headers : ['列 1', '列 2'],
    rows: normalizedRows.map((row) => {
      const width = Math.max(headers.length, row.length, 1)
      return Array.from({ length: width }, (_, index) => row[index] || '')
    })
  }
}

const migrateBlockContent = (block, targetType) => {
  const text = getBlockTextContent(block)
  const current = cloneContent(block?.content) || {}

  switch (targetType) {
    case 'heading':
      return { text, level: current.level || 1 }
    case 'text':
      return { text }
    case 'page':
      return { title: text || current.title || '子页面', summary: current.summary || '', pageId: current.pageId || null, icon: current.icon || 'P' }
    case 'todo':
      return { text, done: !!current.done }
    case 'toggle':
    case 'collapse':
      return { title: text || current.title || '', text: current.text || '', open: current.open ?? true }
    case 'quote':
      return { text }
    case 'callout':
      return { text, variant: current.variant || 'info' }
    case 'link_page':
      return { pageId: current.pageId || '', pageTitle: current.pageTitle || text || '', note: current.note || '' }
    case 'code':
      return { lang: current.lang || 'markdown', code: text }
    case 'file':
      return { url: current.url || '', name: current.name || text || '', caption: current.caption || '', size: current.size || 0, mimeType: current.mimeType || '' }
    case 'bookmark':
      return { url: current.url || '', title: current.title || text || '', description: current.description || '' }
    case 'list':
      return {
        listType: current.listType || 'unordered',
        items: text ? text.split('\n').map((line) => line.trim()).filter(Boolean) : ['列表项 1']
      }
    case 'table':
      return buildTableContentFromText(text)
    case 'database':
      return {
        title: current.title || '数据库',
        viewType: current.viewType || 'table',
        rows: [{ id: `${Date.now()}`, title: text || '条目 1', status: '未开始', date: '', note: '' }]
      }
    case 'equation':
    case 'formula':
      return { latex: text }
    case 'button':
      return { label: text || current.label || '按钮', url: current.url || '', style: current.style || 'primary' }
    case 'breadcrumb':
      return { rootLabel: current.rootLabel || '首页', currentLabel: text || current.currentLabel || '' }
    case 'template_button':
      return { label: current.label || '插入模板', template: current.template || 'meeting' }
    case 'synced_block':
      return { syncKey: current.syncKey || '', role: current.role || 'source', text }
    case 'embed':
      return { variant: current.variant || 'embed', url: current.url || '', title: text || current.title || '' }
    case 'image':
      return {
        url: current.url || '',
        alt: current.alt || text,
        displayStyle: current.displayStyle || 'full-width'
      }
    default:
      return createBlockContent(targetType)
  }
}

const resolveBlock = (type) => blockComponents[type] || blockComponents.text

const statusLabel = computed(() => ({
  not_started: '未开始',
  in_progress: '进行中',
  completed: '已完成',
  archived: '已归档'
}[status.value] || '未开始'))

const priorityLabel = computed(() => ({
  low: '低优先级',
  medium: '中优先级',
  high: '高优先级'
}[priority.value] || '中优先级'))

const typeLabel = computed(() => ({
  project: '项目',
  task: '任务',
  goal: '目标',
  custom: customTypeName.value.trim() || '自定义'
}[planType.value] || '项目'))

const isCustomPlanType = computed(() => planType.value === 'custom')

const saveStatusText = computed(() => ({
  saved: '已保存',
  saving: '保存中',
  unsaved: '未保存',
  error: '保存失败'
}[saveStatus.value] || '已保存'))

const saveDotClass = computed(() => ({
  saved: 'bg-zinc-950 dark:bg-white',
  saving: 'bg-zinc-400',
  unsaved: 'bg-amber-500',
  error: 'bg-red-500'
}[saveStatus.value] || 'bg-zinc-500'))

const hasUnsavedChanges = computed(() => saveStatus.value !== 'saved' || pendingBlockIds.value.size > 0)

const filteredCommandItems = computed(() => {
  const query = commandMenu.value.query.trim().toLowerCase()
  if (!query) return commandItems
  return commandItems.filter((item) => {
    const searchText = [item.label, item.description, item.type, ...(item.tags || [])].join(' ').toLowerCase()
    return searchText.includes(query)
  })
})

const commandCategories = computed(() => {
  const sourceItems = filteredCommandItems.value
  const counts = sourceItems.reduce((map, item) => {
    map.set(item.category, (map.get(item.category) || 0) + 1)
    return map
  }, new Map())

  return [
    { key: 'all', label: '全部', count: sourceItems.length },
    ...Array.from(counts.entries()).map(([key, count]) => ({
      key,
      label: key,
      count
    }))
  ]
})

const visibleCommandItems = computed(() => {
  if (commandMenu.value.selectedCategory === 'all') {
    return filteredCommandItems.value
  }

  return filteredCommandItems.value.filter((item) => item.category === commandMenu.value.selectedCategory)
})

const totalCommandPages = computed(() => Math.max(1, Math.ceil(visibleCommandItems.value.length / commandItemsPerPage)))

const currentCommandPage = computed(() => {
  if (!visibleCommandItems.value.length) return 0
  const maxPage = totalCommandPages.value - 1
  return Math.min(Math.floor(commandMenu.value.highlight / commandItemsPerPage), maxPage)
})

const pagedCommandItems = computed(() => {
  const start = currentCommandPage.value * commandItemsPerPage
  return visibleCommandItems.value.slice(start, start + commandItemsPerPage)
})

const pageItemRangeText = computed(() => {
  if (!visibleCommandItems.value.length) return '0 / 0'
  const start = currentCommandPage.value * commandItemsPerPage + 1
  const end = Math.min(start + commandItemsPerPage - 1, visibleCommandItems.value.length)
  return `${start}-${end} / ${visibleCommandItems.value.length}`
})

const normalizeImportedStatus = (value) => ({
  '未开始': 'not_started',
  '进行中': 'in_progress',
  '已完成': 'completed',
  '已归档': 'archived',
  done: 'completed'
}[value] || value || 'not_started')

const normalizeImportedPriority = (value) => ({
  '低': 'low',
  '中': 'medium',
  '高': 'high'
}[value] || value || 'medium')

const normalizeImportedType = (value) => ({
  '项目': 'project',
  '任务': 'task',
  '目标': 'goal',
  '自定义': 'custom',
  custom: 'custom',
  note: 'goal'
}[value] || value || 'project')

const closeRowMenu = () => {
  rowMenu.value = { show: false, blockId: null, blockIndex: -1, top: 0, left: 0 }
}

const closeCommandMenu = () => {
  commandMenu.value = { show: false, mode: 'insert-after', index: null, top: 0, left: 0, query: '', selectedCategory: 'all', highlight: 0 }
}

const clearDragState = () => {
  dragState.value = { draggingId: null, draggingIds: [], fromIndex: -1, overIndex: -1, position: 'after' }
}

const clearSelectedBlocks = () => {
  selectedBlockIds.value = new Set()
}

const finishBlockSelection = () => {
  blockSelection.value = { active: false, anchorIndex: -1, lastIndex: -1, mode: 'replace' }
}

const setSelectedBlockRange = (anchorIndex, currentIndex, mode = 'replace') => {
  if (anchorIndex < 0 || currentIndex < 0 || !blocks.value.length) return
  const start = Math.min(anchorIndex, currentIndex)
  const end = Math.max(anchorIndex, currentIndex)
  const nextSelected = mode === 'add' ? new Set(selectedBlockIds.value) : new Set()
  blocks.value.slice(start, end + 1).forEach((block) => nextSelected.add(block.id))
  selectedBlockIds.value = nextSelected
  activeBlockId.value = blocks.value[currentIndex]?.id || blocks.value[start]?.id || null
}

const beginBlockSelection = (event, index) => {
  if (event.button !== 0) return
  closeRowMenu()
  closeCommandMenu()
  closeInlineAiToolbar()
  const mode = event.ctrlKey || event.metaKey ? 'add' : 'replace'
  blockSelection.value = { active: true, anchorIndex: index, lastIndex: index, mode }
  setSelectedBlockRange(index, index, mode)
}

const extendBlockSelection = (index) => {
  if (!blockSelection.value.active || index === blockSelection.value.lastIndex) return
  blockSelection.value.lastIndex = index
  setSelectedBlockRange(blockSelection.value.anchorIndex, index, blockSelection.value.mode)
}

const isEditableElement = (target) => !!target?.closest?.('textarea, input, [contenteditable="true"], select')

const deleteSelectedBlocks = async () => {
  const idsToDelete = new Set(selectedBlockIds.value)
  if (!idsToDelete.size) return

  clearSelectedBlocks()
  closeRowMenu()
  closeCommandMenu()
  closeInlineAi()
  closeInlineAiToolbar()

  const remainingBlocks = blocks.value.filter((block) => !idsToDelete.has(block.id))
  const deletingBlocks = blocks.value.filter((block) => idsToDelete.has(block.id))

  deletingBlocks.forEach((block) => {
    clearBlockSaveTimer(block)
    pendingBlockIds.value.delete(block.id)
  })

  blocks.value = remainingBlocks
  activeBlockId.value = remainingBlocks[0]?.id || null

  if (!planId.value) {
    markDirty()
    return
  }

  const persistedBlocks = deletingBlocks.filter((block) => !String(block.id).startsWith('temp-'))
  const results = await Promise.allSettled(persistedBlocks.map((block) => planStore.deleteBlock(block.id, planId.value)))
  if (results.some((item) => item.status === 'rejected' || !item.value?.success)) {
    saveStatus.value = 'error'
    await loadPlan()
    return
  }

  const saved = await persistCurrentOrder()
  saveStatus.value = saved ? 'saved' : 'error'
}

const clearBlockSaveTimer = (block) => {
  if (block?.__saveTimer) {
    window.clearTimeout(block.__saveTimer)
    block.__saveTimer = null
  }
}

const clearAllBlockSaveTimers = () => {
  blocks.value.forEach((block) => clearBlockSaveTimer(block))
}

const markDirty = () => {
  if (saveStatus.value !== 'saving') saveStatus.value = 'unsaved'
}

const buildPlanAiPayload = (scope = 'text') => ({
  title: title.value.trim() || '无标题',
  status: status.value,
  priority: priority.value,
  planType: planType.value,
  dueDate: dueDate.value || '',
  blocks: summarizeBlocksForAi(),
  promptTemplate: getResolvedAiTemplate(scope)
})

const openAiPanel = (tab = 'outline') => {
  closeCommandMenu()
  closeRowMenu()
  aiPanel.value = { show: true, tab }
  if (tab === 'image') {
    loadAiImageHistory({ restoreActive: true })
  }
  if (tab === 'video') {
    loadAiVideoHistory({ restoreActive: true })
  }
}

const closeAiPanel = () => {
  aiPanel.value.show = false
}


const applyTextToBlock = (block, text) => {
  if (!block) return false
  const nextText = String(text || '').trim()
  if (!nextText) return false

  const current = cloneContent(block.content) || {}
  let nextContent = null

  switch (block.type) {
    case 'heading':
      nextContent = { ...current, text: nextText, level: current.level || 1 }
      break
    case 'text':
      nextContent = { ...current, text: nextText }
      break
    case 'todo':
      nextContent = { ...current, text: nextText, done: !!current.done }
      break
    case 'quote':
      nextContent = { ...current, text: nextText }
      break
    case 'callout':
      nextContent = { ...current, text: nextText, variant: current.variant || 'info' }
      break
    case 'page':
      nextContent = { ...current, title: nextText, summary: current.summary || '' }
      break
    case 'toggle':
    case 'collapse':
      nextContent = { ...current, title: nextText, text: current.text || '', open: current.open ?? true }
      break
    case 'link_page':
      nextContent = { ...current, pageTitle: nextText, note: current.note || '' }
      break
    case 'button':
      nextContent = { ...current, label: nextText, url: current.url || '', style: current.style || 'primary' }
      break
    case 'breadcrumb':
      nextContent = { ...current, rootLabel: nextText, currentLabel: current.currentLabel || '' }
      break
    case 'equation':
    case 'formula':
      nextContent = { ...current, latex: nextText }
      break
    case 'synced_block':
      nextContent = { ...current, text: nextText, syncKey: current.syncKey || '', role: current.role || 'source' }
      break
    default:
      return false
  }

  updateBlockContent(block, nextContent)
  return true
}

const runAiPolish = async () => {
  const block = activeBlock.value
  if (!block) {
    showInfo('没有可润色的块', { description: '请先在编辑区选中一个可编辑块。' })
    return
  }

  if (!supportsInlineAi(block)) {
    showInfo('当前内容不支持润色', { description: '目前支持文本、标题、待办、引用、标注以及部分可编辑块。' })
    return
  }

  if (isAiCoolingDown('polish')) {
    showInfo('AI 请求过于频繁', { description: '请在 ' + getAiCooldownRemaining('polish') + ' 秒后再试。' })
    return
  }

  const sourceElement = document.activeElement?.closest?.('.plan-row')?.dataset?.blockId === String(block.id)
    ? document.activeElement
    : null
  const context = sourceElement
    ? buildInlineAiContextFromElement(sourceElement, { allowCollapsed: true })
    : null
  const activeContext = context || {
    blockId: block.id,
    fieldKey: inlineAiFieldMap[block.type] || 'text',
    itemIndex: null,
    sourceText: getInlineAiEditableText(block)
  }
  const text = getInlineAiEditableText(block, activeContext)

  if (!text.trim()) {
    showInfo('当前块内容为空', { description: '先写一点内容，再进行 AI 润色。' })
    return
  }

  aiPolishTarget.value = {
    blockId: block.id,
    fieldKey: activeContext.fieldKey || inlineAiFieldMap[block.type] || 'text',
    itemIndex: Number.isInteger(activeContext.itemIndex) ? activeContext.itemIndex : null
  }

  aiPolishLoading.value = true
  try {
    const res = await polishPlanBlockAI({
      ...buildPlanAiPayload(),
      blockType: block.type,
      instruction: aiPolishInstruction.value.trim(),
      text
    })

    if (!res.success) {
      maybeStartAiCooldown('polish', res, 12)
      showError('AI 润色失败', { description: getAiFailureDescription(res) })
      return
    }

    aiPolishResult.value = res.data || null
  } finally {
    aiPolishLoading.value = false
  }
}

const applyAiPolish = () => {
  if (!aiPolishResult.value?.text) return
  const block = getBlockById(aiPolishTarget.value?.blockId) || activeBlock.value
  if (!block) return

  const applied = applyTextToBlock(block, aiPolishResult.value.text)
  if (!applied) {
    showInfo('当前块不支持直接写回', { description: '列表、表格和媒体块请先切换为可编辑文本字段再使用。' })
    return
  }

  showSuccess('已写回当前块')
  closeAiPanel()
}

const getAiFailureDescription = (res) => {
  if (res?.code === 404) return 'AI 接口不存在，后端可能还是旧版本，请更新后再试。'
  if (res?.code === 401) return '登录状态已失效，请重新登录后再试。'
  if (res?.code === 402) return 'Agnes 额度不足或当前模型不可计费，请先检查余额。'
  if (res?.code === 429) return res?.error || 'AI 请求过于频繁，请稍后再试。'
  if (res?.code === 502) return res?.error || 'Agnes 当前服务繁忙，请稍后再试。'
  if (res?.code === 422) return res?.error || '当前模式需要可公网访问的图片 URL。'
  if (res?.code === 503) return res?.error || '当前 Agnes 媒体模型不可用，请检查模型配置。'
  if (res?.code === 0) return 'AI 请求超时或网络不可达，请确认网络环境后重试。'
  if (/No available channel for model/i.test(res?.error || '')) return '当前 Agnes 账号未开通该模型，请确认模型权限。'
  return res?.error || '请稍后再试。'
}

const formatAiVideoTimestamp = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    hour12: false,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAiVideoModeLabel = (mode) => ({
  text_to_video: '文生视频',
  image_to_video: '图生视频',
  keyframes: '关键帧动画'
}[mode] || '视频任务')

const getAiImageModeLabel = (mode) => ({
  text_to_image: '文生图',
  image_to_image: '图生图',
  multi_image: '多图合成'
}[mode] || '图片任务')

const terminalAiStatuses = ['completed', 'succeeded', 'success', 'done', 'ready', 'failed', 'error', 'canceled', 'cancelled']

const mergeAiImageHistoryItem = (item) => {
  if (!item?.id) return
  const nextItem = {
    ...item,
    sourceImages: Array.isArray(item.sourceImages) ? item.sourceImages : [],
    items: Array.isArray(item.items) ? item.items : [],
    timeline: Array.isArray(item.timeline) ? item.timeline : []
  }
  const existingIndex = aiImageHistory.value.findIndex((entry) => entry.id === nextItem.id)
  if (existingIndex === -1) {
    aiImageHistory.value = [nextItem, ...aiImageHistory.value].slice(0, 12)
    return
  }
  const nextHistory = [...aiImageHistory.value]
  nextHistory.splice(existingIndex, 1)
  aiImageHistory.value = [nextItem, ...nextHistory].slice(0, 12)
}

const mergeAiVideoHistoryItem = (item) => {
  if (!item?.id) return
  const nextItem = {
    ...item,
    sourceImages: Array.isArray(item.sourceImages) ? item.sourceImages : [],
    timeline: Array.isArray(item.timeline) ? item.timeline : []
  }
  const existingIndex = aiVideoHistory.value.findIndex((entry) => entry.id === nextItem.id)
  if (existingIndex === -1) {
    aiVideoHistory.value = [nextItem, ...aiVideoHistory.value].slice(0, 12)
    return
  }
  const nextHistory = [...aiVideoHistory.value]
  nextHistory.splice(existingIndex, 1)
  aiVideoHistory.value = [nextItem, ...nextHistory].slice(0, 12)
}

const setAiVideoResolution = (value) => {
  const [nextWidth, nextHeight] = String(value || '').split('x').map((item) => Number(item))
  if (Number.isFinite(nextWidth) && Number.isFinite(nextHeight)) {
    aiVideoWidth.value = nextWidth
    aiVideoHeight.value = nextHeight
  }
}

const getAvailableAiVideoSources = () => aiVideoSources.value.filter((item) => isAgnesReachableHttpUrl(item.remoteUrl))

const handleAiImageFiles = async (event) => {
  const files = Array.from(event?.target?.files || [])
  if (!files.length) return
  try {
    const sources = []
    for (const file of files.slice(0, 6)) {
      const dataUrl = await readFileAsDataUrl(file)
      sources.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: normalizeMediaLabel(file.name),
        previewUrl: dataUrl,
        dataUrl
      })
    }
    aiImageSources.value = sources
    aiImageResult.value = null
  } catch (error) {
    showError('读取图片失败', { description: error.message || '请重新选择文件' })
  } finally {
    if (event?.target) event.target.value = ''
  }
}

const handleAiVideoUploadFiles = async (event) => {
  const files = Array.from(event?.target?.files || []).slice(0, 6)
  if (!files.length) return

  aiVideoSourceUploading.value = true
  aiVideoSourceUploadProgress.value = 0

  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      let res = null
      try {
        res = await uploadImage(file, (progress) => {
          aiVideoSourceUploadProgress.value = Math.max(
            aiVideoSourceUploadProgress.value,
            Math.floor(((index + progress / 100) / files.length) * 100)
          )
        })
      } catch (error) {
        showError('上传参考图失败', { description: error.message || '请稍后再试' })
        continue
      }

      if (!res?.success) {
        showError('上传参考图失败', { description: res?.error || '请稍后再试' })
        continue
      }

      const publicUrl = String(res.data?.publicUrl || '').trim()
      const absoluteUrl = String(res.data?.absoluteUrl || resolveMediaUrl(res.data?.url || '')).trim()
      const previewUrl = absoluteUrl || publicUrl
      const canUseForAgnes = isAgnesReachableHttpUrl(publicUrl)

      const nextSource = createRemoteMediaSource(
        canUseForAgnes ? publicUrl : '',
        file.name,
        {
          previewUrl,
          absoluteUrl,
          isPublic: canUseForAgnes
        }
      )

      aiVideoSources.value = [...aiVideoSources.value, nextSource].slice(0, 6)
      aiVideoResult.value = null

      if (!canUseForAgnes) {
        showInfo('图片已上传，但当前返回的不是公网 URL', {
          description: '如果要继续用于 Agnes 图生视频，请配置后端的 PUBLIC_MEDIA_BASE_URL，或直接手动填入公网图片地址。'
        })
      }
    }
  } finally {
    aiVideoSourceUploading.value = false
    aiVideoSourceUploadProgress.value = 0
    if (event?.target) event.target.value = ''
  }
}

const appendAiVideoSourceUrl = () => {
  const url = String(aiVideoSourceUrl.value || '').trim()
  if (!url) {
    showInfo('请输入参考图 URL')
    return
  }
  if (!isAgnesReachableHttpUrl(url)) {
    showInfo('请输入公网可访问的图片 URL', { description: '例如 https://example.com/demo.png' })
    return
  }
  if (aiVideoSources.value.some((item) => item.remoteUrl === url)) {
    showInfo('该参考图 URL 已存在')
    return
  }
  aiVideoSources.value = [
    ...aiVideoSources.value,
    createRemoteMediaSource(url, `参考图 ${aiVideoSources.value.length + 1}`, { isPublic: true })
  ].slice(0, 6)
  aiVideoResult.value = null
  aiVideoSourceUrl.value = ''
}

const removeAiImageSource = (id) => {
  aiImageSources.value = aiImageSources.value.filter((item) => item.id !== id)
}

const removeAiVideoSource = (id) => {
  aiVideoSources.value = aiVideoSources.value.filter((item) => item.id !== id)
}

const pollAiImageStatus = async () => {
  const taskId = aiImageResult.value?.taskId
  if (!taskId) return

  const res = await getPlanImageStatusAI({ taskId })
  if (!res.success) {
    showError('获取生图状态失败', { description: getAiFailureDescription(res) })
    clearAiImagePolling()
    return
  }

  aiImageResult.value = {
    ...(aiImageResult.value || {}),
    ...(res.data || {})
  }
  mergeAiImageHistoryItem(aiImageResult.value)

  const normalizedStatus = String(aiImageResult.value?.status || '').toLowerCase()
  if (['completed', 'succeeded', 'success', 'done', 'ready'].includes(normalizedStatus)) {
    clearAiImagePolling()
    showSuccess('AI 生图已完成')
  }
  if (['failed', 'error', 'canceled', 'cancelled'].includes(normalizedStatus)) {
    clearAiImagePolling()
    showError('AI 生图失败', { description: aiImageResult.value?.error || '任务执行失败' })
  }
}

const loadAiImageHistory = async ({ restoreActive = true } = {}) => {
  if (!planId.value) {
    aiImageHistory.value = []
    return
  }

  aiImageHistoryLoading.value = true
  try {
    const res = await listPlanImageHistoryAI({ planId: planId.value, limit: 12 })
    if (!res.success) {
      showError('加载生图历史失败', { description: getAiFailureDescription(res) })
      return
    }

    aiImageHistory.value = Array.isArray(res.data) ? res.data : []

    if (restoreActive && aiImageHistory.value.length) {
      const pendingTask = aiImageHistory.value.find((item) => !terminalAiStatuses.includes(String(item.status || '').toLowerCase()))
      restoreAiImageTask(pendingTask || aiImageHistory.value[0])
    }
  } finally {
    aiImageHistoryLoading.value = false
  }
}

const restoreAiImageTask = (task) => {
  if (!task) return
  clearAiImagePolling()
  aiImageResult.value = { ...task }
  mergeAiImageHistoryItem(task)
  if (task.model) aiImageModel.value = task.model
  if (task.mode) aiImageMode.value = task.mode
  aiImageSources.value = Array.isArray(task.sourceImages)
    ? task.sourceImages.slice(0, 6).map((item, index) => ({
        id: 'restored-image-' + index + '-' + Date.now(),
        name: '\u53c2\u8003\u56fe ' + (index + 1),
        previewUrl: item,
        dataUrl: item
      }))
    : []

  const normalizedStatus = String(task.status || '').toLowerCase()
  if (!terminalAiStatuses.includes(normalizedStatus) && task.taskId) {
    aiImagePollingTimer.value = window.setInterval(() => {
      pollAiImageStatus()
    }, 3500)
    pollAiImageStatus()
  }
}

const deleteAiImageHistory = async (task) => {
  const taskId = String(task?.taskId || '').trim()
  if (!taskId) return

  aiImageDeletingTaskId.value = taskId
  try {
    const res = await deletePlanImageHistoryAI(taskId)
    if (!res.success) {
      showError('删除生图历史失败', { description: getAiFailureDescription(res) })
      return
    }

    aiImageHistory.value = aiImageHistory.value.filter((item) => item.taskId !== taskId)
    if (aiImageResult.value?.taskId === taskId) {
      clearAiImagePolling()
      aiImageResult.value = null
    }
    showSuccess('生图历史已删除')
  } finally {
    aiImageDeletingTaskId.value = ''
  }
}

const loadAiVideoHistory = async ({ restoreActive = true } = {}) => {
  if (!planId.value) {
    aiVideoHistory.value = []
    return
  }

  aiVideoHistoryLoading.value = true
  try {
    const res = await listPlanVideoHistoryAI({ planId: planId.value, limit: 12 })
    if (!res.success) {
      showError('加载视频历史失败', { description: getAiFailureDescription(res) })
      return
    }

    aiVideoHistory.value = Array.isArray(res.data) ? res.data : []

    if (restoreActive && aiVideoHistory.value.length) {
      const pendingTask = aiVideoHistory.value.find((item) => !terminalAiStatuses.includes(String(item.status || '').toLowerCase()))
      restoreAiVideoTask(pendingTask || aiVideoHistory.value[0])
    }
  } finally {
    aiVideoHistoryLoading.value = false
  }
}

const restoreAiVideoTask = (task) => {
  if (!task) return
  clearAiVideoPolling()
  aiVideoResult.value = { ...task }
  mergeAiVideoHistoryItem(task)
  if (task.model) aiVideoModel.value = task.model
  if (task.mode) aiVideoMode.value = task.mode

  const sources = Array.isArray(task.sourceImages)
    ? task.sourceImages
      .filter((item) => isAgnesReachableHttpUrl(item))
      .map((item, index) => createRemoteMediaSource(item, `参考图 ${index + 1}`, { isPublic: true }))
    : []

  if (sources.length) {
    aiVideoSources.value = sources
  }

  const normalizedStatus = String(task.status || '').toLowerCase()
  if (!terminalAiStatuses.includes(normalizedStatus) && task.videoId) {
    aiVideoPollingTimer.value = window.setInterval(() => {
      pollAiVideoStatus()
    }, 5000)
    pollAiVideoStatus()
  }
}

const deleteAiVideoHistory = async (task) => {
  const taskId = String(task?.taskId || '').trim()
  if (!taskId) return

  aiVideoDeletingTaskId.value = taskId
  try {
    const res = await deletePlanVideoHistoryAI(taskId)
    if (!res.success) {
      showError('删除视频历史失败', { description: getAiFailureDescription(res) })
      return
    }

    aiVideoHistory.value = aiVideoHistory.value.filter((item) => item.taskId !== taskId)
    if (aiVideoResult.value?.taskId === taskId) {
      clearAiVideoPolling()
      aiVideoResult.value = null
    }
    showSuccess('视频历史已删除')
  } finally {
    aiVideoDeletingTaskId.value = ''
  }
}

const runAiImage = async () => {
  if (isAiCoolingDown('image')) {
    showInfo('AI 请求过于频繁', { description: '请在 ' + getAiCooldownRemaining('image') + ' 秒后再试。' })
    return
  }

  if (!aiImagePrompt.value.trim()) {
    showInfo('请输入图片提示词')
    return
  }

  if (aiImageMode.value !== 'text_to_image' && !aiImageSources.value.length) {
    showInfo('请先上传参考图片')
    return
  }

  clearAiImagePolling()
  aiImageLoading.value = true
  aiImageResult.value = null
  try {
    const res = await generatePlanImageAI({
      ...buildPlanAiPayload('image'),
      planId: planId.value,
      model: aiImageModel.value,
      mode: aiImageMode.value,
      prompt: aiImagePrompt.value.trim(),
      negativePrompt: aiImageNegativePrompt.value.trim(),
      size: aiImageSize.value,
      ratio: aiImageModel.value === 'agnes-image-2.1-flash' ? aiImageRatio.value : '',
      responseFormat: 'url',
      inputImages: aiImageMode.value === 'text_to_image'
        ? []
        : aiImageSources.value.map((item) => item.dataUrl)
    })

    if (!res.success) {
      maybeStartAiCooldown('image', res, 15)
      showError('AI 生图失败', { description: getAiFailureDescription(res) })
      return
    }

    aiImageResult.value = {
      ...(res.data || {}),
      mode: aiImageMode.value
    }
    mergeAiImageHistoryItem(aiImageResult.value)

    const normalizedStatus = String(aiImageResult.value?.status || '').toLowerCase()
    if (!terminalAiStatuses.includes(normalizedStatus) && aiImageResult.value?.taskId) {
      aiImagePollingTimer.value = window.setInterval(() => {
        pollAiImageStatus()
      }, 3500)
      await pollAiImageStatus()
    }
  } finally {
    aiImageLoading.value = false
  }
}

const pollAiVideoStatus = async () => {
  const videoId = aiVideoResult.value?.videoId
  if (!videoId) return

  const res = await getPlanVideoStatusAI({
    videoId,
    model: aiVideoResult.value?.model || aiVideoModel.value
  })

  if (!res.success) {
    showError('获取视频状态失败', { description: getAiFailureDescription(res) })
    clearAiVideoPolling()
    return
  }

  aiVideoResult.value = {
    ...(aiVideoResult.value || {}),
    ...(res.data || {})
  }
  mergeAiVideoHistoryItem(aiVideoResult.value)

  if (['completed', 'succeeded', 'success', 'done', 'ready'].includes(String(aiVideoResult.value?.status || '').toLowerCase())) {
    clearAiVideoPolling()
    showSuccess('AI 视频已生成完成')
  }

  if (['failed', 'error', 'canceled'].includes(String(aiVideoResult.value?.status || '').toLowerCase())) {
    clearAiVideoPolling()
    showError('AI 生成视频失败', { description: aiVideoResult.value?.error || '任务执行失败' })
  }
}

const runAiVideo = async () => {
  const availableSources = getAvailableAiVideoSources()

  if (isAiCoolingDown('video')) {
    showInfo('AI 请求过于频繁', { description: '请在 ' + getAiCooldownRemaining('video') + ' 秒后再试。' })
    return
  }

  if (!aiVideoPrompt.value.trim()) {
    showInfo('请输入视频提示词')
    return
  }

  if (aiVideoMode.value !== 'text_to_video' && !availableSources.length) {
    showInfo('请提供可公网访问的参考图', { description: '可以直接填写图片 URL，或先上传图片并确认后端返回了 publicUrl。' })
    return
  }

  if (aiVideoMode.value === 'keyframes' && availableSources.length < 2) {
    showInfo('关键帧动画至少需要 2 张参考图 URL')
    return
  }

  clearAiVideoPolling()
  aiVideoLoading.value = true
  aiVideoResult.value = null
  try {
    const res = await createPlanVideoAI({
      ...buildPlanAiPayload('video'),
      planId: planId.value,
      model: aiVideoModel.value,
      mode: aiVideoMode.value,
      prompt: aiVideoPrompt.value.trim(),
      negativePrompt: aiVideoNegativePrompt.value.trim(),
      width: aiVideoWidth.value,
      height: aiVideoHeight.value,
      numFrames: aiVideoFrames.value,
      frameRate: aiVideoFrameRate.value,
      inputImages: aiVideoMode.value === 'text_to_video'
        ? []
        : availableSources.map((item) => item.remoteUrl).filter(Boolean)
    })

    if (!res.success) {
      maybeStartAiCooldown('video', res, 15)
      showError('AI 生成视频失败', { description: getAiFailureDescription(res) })
      return
    }

    aiVideoResult.value = {
      ...(res.data || {}),
      mode: aiVideoMode.value
    }
    mergeAiVideoHistoryItem(aiVideoResult.value)

    if (aiVideoResult.value?.videoId) {
      clearAiVideoPolling()
      aiVideoPollingTimer.value = window.setInterval(() => {
        pollAiVideoStatus()
      }, 5000)
      await pollAiVideoStatus()
    }
  } finally {
    aiVideoLoading.value = false
  }
}

const runInlineAi = async () => {
  if (!inlineAi.value.show || !inlineAi.value.blockId) return

  const block = getBlockById(inlineAi.value.blockId)
  if (!block || !supportsInlineAi(block)) {
    showInfo('当前内容不支持块内 AI', { description: '目前支持文本、标题、待办、引用、标注以及部分可编辑块。' })
    return
  }

  if (isAiCoolingDown('inline')) {
    showInfo('AI 请求过于频繁', { description: '请在 ' + getAiCooldownRemaining('inline') + ' 秒后再试。' })
    return
  }

  const liveText = getInlineAiEditableText(block, inlineAi.value)
  const selectedText = inlineAi.value.hasSelection
    ? (liveText.slice(inlineAi.value.rangeStart, inlineAi.value.rangeEnd) || inlineAi.value.selectedText)
    : ''
  const targetText = selectedText || liveText

  if (inlineAi.value.action !== 'continue' && !targetText.trim()) {
    showInfo('当前内容为空', { description: '先写一点内容，或选中一段文本后再调用 AI。' })
    return
  }

  inlineAi.value.loading = true
  inlineAi.value.result = null

  try {
    if (inlineAi.value.action === 'outline') {
      const promptParts = [
        '请基于下面的内容，生成适合计划编辑器直接插入的结构化大纲。',
        inlineAi.value.prompt ? ('补充要求：' + inlineAi.value.prompt) : '',
        targetText || liveText
      ].filter(Boolean)

      const res = await generatePlanOutlineAI({
        ...buildPlanAiPayload(),
        prompt: promptParts.join('\n\n')
      })

      if (!res.success) {
        maybeStartAiCooldown('inline', res, 10)
        showError('AI 转大纲失败', { description: getAiFailureDescription(res) })
        return
      }

      inlineAi.value.result = {
        kind: 'outline',
        summary: res.data?.summary || '',
        blocks: Array.isArray(res.data?.blocks) ? res.data.blocks : [],
        source: res.data?.source || 'local'
      }
      return
    }

    const baseText = inlineAi.value.action === 'continue'
      ? (liveText.slice(0, Math.max(inlineAi.value.rangeEnd, inlineAi.value.rangeStart)) || liveText)
      : targetText

    const res = await polishPlanBlockAI({
      ...buildPlanAiPayload(),
      blockType: block.type,
      instruction: buildInlineAiInstruction(inlineAi.value.action, inlineAi.value.prompt, baseText),
      text: baseText
    })

    if (!res.success) {
      maybeStartAiCooldown('inline', res, 10)
      showError('AI 生成失败', { description: getAiFailureDescription(res) })
      return
    }

    const resultText = String(res.data?.text || '').trim()
    if (!resultText) {
      showInfo('AI 没有返回内容', { description: '这次没有拿到可写回的文本，请稍后再试。' })
      return
    }

    if (inlineAi.value.action === 'todo') {
      inlineAi.value.result = {
        kind: 'todo',
        items: normalizeTodoItems(resultText),
        source: res.data?.source || 'local'
      }
      return
    }

    inlineAi.value.result = {
      kind: 'text',
      text: resultText,
      source: res.data?.source || 'local'
    }
  } finally {
    inlineAi.value.loading = false
  }
}

const applyInlineAiTextResult = async (mode = 'replace-selection') => {
  const block = getBlockById(inlineAi.value.blockId)
  const resultText = String(inlineAi.value.result?.text || '').trim()
  if (!block || !resultText) return

  const currentText = getInlineAiEditableText(block, inlineAi.value)
  const selectionStart = inlineAi.value.rangeStart
  const selectionEnd = inlineAi.value.rangeEnd
  let nextText = currentText
  let focusStart = 0
  let focusEnd = 0

  if (mode === 'insert-cursor') {
    const cursor = inlineAi.value.hasSelection ? selectionEnd : selectionStart
    const joiner = currentText && cursor > 0 && !/\s$/.test(currentText.slice(0, cursor)) ? '\n' : ''
    nextText = currentText.slice(0, cursor) + joiner + resultText + currentText.slice(cursor)
    focusStart = cursor + joiner.length
    focusEnd = focusStart + resultText.length
  } else if (mode === 'append-end') {
    const joiner = currentText && !/\s$/.test(currentText) ? '\n' : ''
    nextText = currentText + joiner + resultText
    focusStart = currentText.length + joiner.length
    focusEnd = focusStart + resultText.length
  } else {
    const start = inlineAi.value.hasSelection ? selectionStart : 0
    const end = inlineAi.value.hasSelection ? selectionEnd : currentText.length
    nextText = currentText.slice(0, start) + resultText + currentText.slice(end)
    focusStart = start
    focusEnd = start + resultText.length
  }

  const applied = await setInlineAiEditableText(block, nextText, focusStart, focusEnd, inlineAi.value)
  if (!applied) return

  showSuccess('AI 已写回文本')
  closeInlineAi()
}

const applyInlineAiTodoBlocks = async () => {
  const blockIndex = getBlockIndexById(inlineAi.value.blockId)
  const items = inlineAi.value.result?.items || []
  if (blockIndex === -1 || !items.length) return

  await insertBlocksAfter(blockIndex, items.map((item) => ({
    type: 'todo',
    content: { text: item, done: false }
  })))

  showSuccess('待办已插入')
  closeInlineAi()
}

const applyInlineAiOutlineResult = async () => {
  const blockIndex = getBlockIndexById(inlineAi.value.blockId)
  const payloadBlocks = inlineAi.value.result?.blocks || []
  if (blockIndex === -1 || !payloadBlocks.length) return

  await insertBlocksAfter(blockIndex, payloadBlocks)
  showSuccess('大纲已插入')
  closeInlineAi()
}

const generateAiQuestions = async () => {
  if (isAiCoolingDown('questions')) {
    showInfo('AI 请求过于频繁', { description: '请在 ' + getAiCooldownRemaining('questions') + ' 秒后再试。' })
    return
  }

  aiQuestionsLoading.value = true
  try {
    const res = await generatePlanQuestionsAI(buildPlanAiPayload())
    if (!res.success) {
      maybeStartAiCooldown('questions', res, 12)
      showError('AI 提问失败', { description: getAiFailureDescription(res) })
      return
    }
    aiQuestionsResult.value = res.data || null
  } finally {
    aiQuestionsLoading.value = false
  }
}

const generateAiOutline = async () => {
  if (isAiCoolingDown('outline')) {
    showInfo('AI 请求过于频繁', { description: '请在 ' + getAiCooldownRemaining('outline') + ' 秒后再试。' })
    return
  }

  if (!aiOutlinePrompt.value.trim()) {
    showInfo('请输入计划生成需求')
    return
  }

  aiOutlineLoading.value = true
  try {
    const res = await generatePlanOutlineAI({
      ...buildPlanAiPayload(),
      prompt: aiOutlinePrompt.value.trim()
    })

    if (!res.success) {
      maybeStartAiCooldown('outline', res, 12)
      showError('AI 大纲生成失败', { description: getAiFailureDescription(res) })
      return
    }

    aiOutlineResult.value = res.data || null
  } finally {
    aiOutlineLoading.value = false
  }
}

const applyAiOutline = async () => {
  const result = aiOutlineResult.value
  if (!result?.blocks?.length) return

  if (!title.value.trim() && result.titleSuggestion) {
    title.value = result.titleSuggestion
    nextTick(() => resizeTitle())
  }

  const anchorIndex = activeBlock.value
    ? blocks.value.findIndex((block) => block.id === activeBlock.value.id)
    : blocks.value.length - 1

  await insertBlocksAfter(anchorIndex, result.blocks)
  showSuccess('AI 大纲已插入当前计划')
  closeAiPanel()
}

const focusBlockById = async (blockId) => {
  await nextTick()
  const row = document.querySelector(`.plan-row[data-block-id="${String(blockId)}"]`)
  const editor = row?.querySelector('textarea, input, [contenteditable="true"]')
  editor?.focus?.()
}

const resizeTitle = () => {
  if (!titleRef.value) return
  titleRef.value.style.height = 'auto'
  titleRef.value.style.height = `${titleRef.value.scrollHeight}px`
}

const handleTitleInput = () => {
  markDirty()
  nextTick(() => resizeTitle())
}

const clearActiveBlock = (blockId) => {
  window.setTimeout(() => {
    if (activeBlockId.value === blockId) activeBlockId.value = null
  }, 120)
}

const syncPlan = async () => {
  if (!planId.value) return true
  if (planType.value === 'custom' && !customTypeName.value.trim()) {
    saveStatus.value = 'error'
    return false
  }
  const res = await planStore.updatePlan(planId.value, {
    title: title.value.trim() || '无标题',
    status: status.value,
    priority: priority.value,
    type: planType.value,
    custom_type_name: planType.value === 'custom' ? customTypeName.value.trim() : null,
    due_date: dueDate.value || null
  })
  return !!res.success
}

const persistCurrentOrder = async () => {
  if (!planId.value || !blocks.value.length) return true
  const res = await planStore.reorder(planId.value, blocks.value.map((item) => item.id))
  return !!res.success
}

const loadPlan = async () => {
  isLoading.value = true
  try {
    clearAllBlockSaveTimers()
    finishBlockSelection()
    clearSelectedBlocks()
    clearAiImagePolling()
    clearAiVideoPolling()
    aiImageResult.value = null
    aiImageHistory.value = []
    aiVideoResult.value = null
    aiVideoHistory.value = []
    if (!planStore.plans.length) {
      await planStore.loadPlans()
    }

    const plan = planStore.plans.find((item) => String(item.id) === String(planId.value))

    if (!plan) {
      title.value = ''
      status.value = 'not_started'
      priority.value = 'medium'
      planType.value = 'project'
      customTypeName.value = ''
      dueDate.value = ''
      blocks.value = []
      pendingBlockIds.value = new Set()
      saveStatus.value = 'saved'
      aiImageSources.value = []
      aiVideoSources.value = []
      return
    }

    title.value = plan.title || ''
    status.value = plan.status || 'not_started'
    priority.value = plan.priority || 'medium'
    planType.value = plan.type || 'project'
    customTypeName.value = plan.custom_type_name || ''
    dueDate.value = plan.due_date || ''

    const res = await planStore.loadBlocks(planId.value)
    blocks.value = res.success
      ? (planStore.getBlocks(planId.value) || []).map((block, index) => ({
          ...block,
          order: block.order || index + 1,
          content: block.content || createBlockContent(block.type)
        }))
      : []

    pendingBlockIds.value = new Set()
    saveStatus.value = 'saved'
    await loadAiImageHistory({ restoreActive: true })
    await loadAiVideoHistory({ restoreActive: true })
    nextTick(() => resizeTitle())
  } finally {
    isLoading.value = false
  }
}

const savePendingBlocks = async () => {
  if (!planId.value || !pendingBlockIds.value.size) return true
  saveStatus.value = 'saving'
  const ids = [...pendingBlockIds.value]
  const results = await Promise.allSettled(ids.map(async (blockId) => {
    const block = blocks.value.find((item) => item.id === blockId)
    if (!block) return true
    clearBlockSaveTimer(block)
    const payload = block.__pendingPayload || { content: block.content }
    const res = await planStore.updateBlock(block.id, payload, planId.value)
    if (!res.success) throw new Error(res.error || '保存失败')
    block.__pendingPayload = null
    pendingBlockIds.value.delete(blockId)
    return true
  }))

  if (results.some((item) => item.status === 'rejected')) {
    saveStatus.value = 'error'
    return false
  }

  saveStatus.value = pendingBlockIds.value.size ? 'unsaved' : 'saved'
  return true
}

const saveEverything = async () => {
  saveStatus.value = 'saving'
  const blocksSaved = await savePendingBlocks()
  const planSaved = await syncPlan()
  const orderSaved = await persistCurrentOrder()
  saveStatus.value = blocksSaved && planSaved && orderSaved ? 'saved' : 'error'
  return blocksSaved && planSaved && orderSaved
}

const updateBlockContent = (block, value, extraPayload = {}) => {
  block.content = value || createBlockContent(block.type)
  block.__pendingPayload = {
    ...(block.__pendingPayload || {}),
    ...extraPayload,
    content: block.content
  }
  pendingBlockIds.value.add(block.id)
  saveStatus.value = 'unsaved'
  clearBlockSaveTimer(block)
  block.__saveTimer = window.setTimeout(async () => {
    if (!planId.value) return
    saveStatus.value = 'saving'
    try {
      const payload = block.__pendingPayload || { content: block.content }
      const res = await planStore.updateBlock(block.id, payload, planId.value)
      if (res.success) {
        block.__pendingPayload = null
        pendingBlockIds.value.delete(block.id)
        saveStatus.value = pendingBlockIds.value.size ? 'unsaved' : 'saved'
      } else {
        saveStatus.value = 'error'
      }
    } catch {
      saveStatus.value = 'error'
    }
  }, 350)
}

const addBlock = async (type, index = blocks.value.length, content = null, options = {}) => {
  const { focus = true, reorder = true } = options
  const nextContent = content ? cloneContent(content) : createBlockContent(type)
  const tempBlock = {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content: nextContent,
    order: index + 1
  }

  if (!planId.value) {
    blocks.value.splice(index, 0, tempBlock)
    markDirty()
    if (focus) await focusBlockById(tempBlock.id)
    return tempBlock
  }

  const res = await planStore.addBlock(planId.value, type, nextContent)
  if (!res.success) {
    blocks.value.splice(index, 0, tempBlock)
    markDirty()
    if (focus) await focusBlockById(tempBlock.id)
    return tempBlock
  }

  const serverBlock = {
    ...res.data,
    content: res.data.content || nextContent
  }
  blocks.value.splice(index, 0, serverBlock)
  if (reorder) await persistCurrentOrder()
  saveStatus.value = 'saved'
  if (focus) await focusBlockById(serverBlock.id)
  return serverBlock
}

const replaceAllBlocks = async (payload) => {
  clearAllBlockSaveTimers()
  const nextBlocks = (payload.blocks || []).map((block, index) => ({
    ...block,
    content: block.content || createBlockContent(block.type),
    order: index + 1
  }))

  title.value = payload.title || title.value || '无标题'
  if (payload.status) status.value = normalizeImportedStatus(payload.status)
  if (payload.priority) priority.value = normalizeImportedPriority(payload.priority)
  if (payload.planType) planType.value = normalizeImportedType(payload.planType)
  if (payload.customTypeName !== undefined) customTypeName.value = payload.customTypeName || ''
  if (payload.dueDate !== undefined) dueDate.value = payload.dueDate || ''

  if (!planId.value) {
    blocks.value = nextBlocks.map((block) => ({
      ...block,
      id: block.id || `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    }))
    pendingBlockIds.value = new Set(blocks.value.map((block) => block.id))
    markDirty()
    nextTick(() => resizeTitle())
    return
  }

  saveStatus.value = 'saving'
  await Promise.allSettled(blocks.value.filter((block) => !String(block.id).startsWith('temp-')).map((block) => planStore.deleteBlock(block.id, planId.value)))
  blocks.value = []
  pendingBlockIds.value = new Set()

  for (const block of nextBlocks) {
    await addBlock(block.type, blocks.value.length, block.content, { focus: false, reorder: false })
  }

  await persistCurrentOrder()
  await syncPlan()
  saveStatus.value = 'saved'
  nextTick(() => resizeTitle())
}

const appendTextBlock = async () => {
  activeBlockId.value = null
  await addBlock('text')
}

const createFirstBlock = async () => {
  if (blocks.value.length) return
  await addBlock('text', 0)
}

const insertTextAfter = async (index) => {
  await addBlock('text', index + 1)
}

const insertBlocksAfter = async (index, payloadBlocks = []) => {
  let insertionIndex = index + 1
  for (const item of payloadBlocks) {
    await addBlock(item.type, insertionIndex, item.content, { focus: false, reorder: false })
    insertionIndex += 1
  }
  if (planId.value) {
    const saved = await persistCurrentOrder()
    saveStatus.value = saved ? 'saved' : 'error'
  } else {
    markDirty()
  }
  const firstInserted = blocks.value[index + 1]
  if (firstInserted?.id) {
    await focusBlockById(firstInserted.id)
  }
}

const openCommandMenu = (event, index, mode = 'insert-after') => {
  closeRowMenu()
  const target = event?.currentTarget || event?.target
  if (!target?.getBoundingClientRect) return
  const rect = target.getBoundingClientRect()
  const panelWidth = 320
  const left = Math.min(
    Math.max(20, rect.left - 8),
    Math.max(20, window.innerWidth - panelWidth - 20)
  )
  commandMenu.value = {
    show: true,
    mode,
    index,
    top: rect.bottom + 8,
    left,
    query: '',
    selectedCategory: commandItems[0]?.category || 'all',
    highlight: 0
  }
  nextTick(() => commandInputRef.value?.focus())
}

const setCommandCategory = (categoryKey) => {
  commandMenu.value.selectedCategory = categoryKey
  commandMenu.value.highlight = 0
  nextTick(() => commandInputRef.value?.focus())
}

const goToCommandPage = (page) => {
  if (!visibleCommandItems.value.length) return
  const nextPage = Math.max(0, Math.min(page, totalCommandPages.value - 1))
  const nextIndex = nextPage * commandItemsPerPage
  commandMenu.value.highlight = Math.min(nextIndex, visibleCommandItems.value.length - 1)
}

const handleCommandKeydown = (event) => {
  if (event.key === 'Escape') {
    closeCommandMenu()
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!visibleCommandItems.value.length) return
    commandMenu.value.highlight = (commandMenu.value.highlight + 1) % visibleCommandItems.value.length
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!visibleCommandItems.value.length) return
    commandMenu.value.highlight = (commandMenu.value.highlight - 1 + visibleCommandItems.value.length) % visibleCommandItems.value.length
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const item = visibleCommandItems.value[commandMenu.value.highlight]
    if (item) selectCommandItem(item)
    return
  }
  if (event.key === 'PageDown' || ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight')) {
    event.preventDefault()
    goToCommandPage(currentCommandPage.value + 1)
    return
  }
  if (event.key === 'PageUp' || ((event.metaKey || event.ctrlKey) && event.key === 'ArrowLeft')) {
    event.preventDefault()
    goToCommandPage(currentCommandPage.value - 1)
  }
}

const selectCommandItem = async (item) => {
  const index = commandMenu.value.index
  const block = blocks.value[index]
  const mode = commandMenu.value.mode
  const content = item.createContent ? item.createContent() : createBlockContent(item.type)
  closeCommandMenu()

  if (mode === 'replace-current' && block) {
    changeBlockType(block, item.type, content)
    return
  }

  if (mode === 'insert-above') {
    await addBlock(item.type, index, content)
    return
  }

  if (mode === 'insert-below' || mode === 'insert-after') {
    await addBlock(item.type, index + 1, content)
    return
  }

  await addBlock(item.type, blocks.value.length, content)
}

const openRowMenu = (event, index, block) => {
  closeCommandMenu()
  const rect = event.currentTarget.getBoundingClientRect()
  rowMenu.value = {
    show: true,
    blockId: block.id,
    blockIndex: index,
    top: rect.bottom + 8,
    left: rect.left
  }
}

const changeBlockType = (block, type, preferredContent = null) => {
  if (!block) return
  if (block.type === type && preferredContent) {
    block.content = preferredContent
    updateBlockContent(block, preferredContent, { type })
    return
  }
  if (block.type === type) return
  const nextContent = preferredContent || migrateBlockContent(block, type)
  block.type = type
  block.content = nextContent
  updateBlockContent(block, nextContent, { type })
}

const toggleBlockComplete = (block) => {
  if (block.type !== 'todo') return
  updateBlockContent(block, { ...block.content })
}

const duplicateBlock = async (index) => {
  const source = blocks.value[index]
  if (!source) return
  await addBlock(source.type, index + 1, source.content)
}

const removeBlock = async (block) => {
  const index = blocks.value.findIndex((item) => item.id === block.id)
  if (index === -1) return
  clearBlockSaveTimer(block)
  if (selectedBlockIds.value.has(block.id)) {
    const nextSelected = new Set(selectedBlockIds.value)
    nextSelected.delete(block.id)
    selectedBlockIds.value = nextSelected
  }
  blocks.value.splice(index, 1)
  pendingBlockIds.value.delete(block.id)
  const fallbackFocusId = blocks.value[index]?.id || blocks.value[index - 1]?.id || null

  if (!planId.value || String(block.id).startsWith('temp-')) {
    markDirty()
    if (fallbackFocusId) focusBlockById(fallbackFocusId)
    return
  }

  const res = await planStore.deleteBlock(block.id, planId.value)
  if (res.success) {
    await persistCurrentOrder()
    saveStatus.value = 'saved'
    if (fallbackFocusId) focusBlockById(fallbackFocusId)
  } else {
    saveStatus.value = 'error'
  }
}

const moveBlock = async (fromIndex, toIndex) => {
  if (toIndex < 0 || toIndex >= blocks.value.length) return
  const nextBlocks = [...blocks.value]
  const [block] = nextBlocks.splice(fromIndex, 1)
  nextBlocks.splice(toIndex, 0, block)
  blocks.value = nextBlocks

  if (!planId.value) {
    markDirty()
    if (block?.id) focusBlockById(block.id)
    return
  }

  const saved = await persistCurrentOrder()
  saveStatus.value = saved ? 'saved' : 'error'
  if (saved && block?.id) focusBlockById(block.id)
}

const handleRowMenuAction = async (action) => {
  const index = rowMenu.value.blockIndex
  const block = blocks.value[index]
  if (!block) {
    closeRowMenu()
    return
  }

  const anchor = document.querySelector(`.plan-row[data-block-id="${String(block.id)}"] .plan-row-handle`)

  switch (action) {
    case 'add-above':
      openCommandMenu({ currentTarget: anchor }, index, 'insert-above')
      closeRowMenu()
      return
    case 'add-below':
      openCommandMenu({ currentTarget: anchor }, index, 'insert-below')
      closeRowMenu()
      return
    case 'duplicate':
      await duplicateBlock(index)
      break
    case 'change-type':
      openCommandMenu({ currentTarget: anchor }, index, 'replace-current')
      closeRowMenu()
      return
    case 'move-up':
      await moveBlock(index, index - 1)
      break
    case 'move-down':
      await moveBlock(index, index + 1)
      break
    case 'delete':
      await removeBlock(block)
      break
  }

  closeRowMenu()
}

const onHandleDragStart = (event, index, block) => {
  finishBlockSelection()
  const draggingIds = selectedBlockIds.value.has(block.id)
    ? blocks.value.filter((item) => selectedBlockIds.value.has(item.id)).map((item) => item.id)
    : [block.id]

  if (!selectedBlockIds.value.has(block.id)) {
    selectedBlockIds.value = new Set([block.id])
  }

  dragState.value = {
    draggingId: block.id,
    draggingIds,
    fromIndex: index,
    overIndex: index,
    position: 'after'
  }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', JSON.stringify(draggingIds))
}

const onRowDragOver = (event, index) => {
  if (!dragState.value.draggingId) return
  const rect = event.currentTarget.getBoundingClientRect()
  const position = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
  dragState.value = { ...dragState.value, overIndex: index, position }
}

const onRowDrop = async (index) => {
  if (!dragState.value.draggingId) return
  const { draggingIds, draggingId, position } = dragState.value
  const targetBlock = blocks.value[index]
  if (!targetBlock) {
    clearDragState()
    return
  }

  if (draggingIds.includes(targetBlock.id)) {
    clearDragState()
    return
  }

  const movingBlocks = blocks.value.filter((block) => draggingIds.includes(block.id))
  const nextBlocks = blocks.value.filter((block) => !draggingIds.includes(block.id))
  const targetIndex = nextBlocks.findIndex((block) => block.id === targetBlock.id)
  const insertionIndex = targetIndex === -1
    ? nextBlocks.length
    : (position === 'before' ? targetIndex : targetIndex + 1)

  nextBlocks.splice(insertionIndex, 0, ...movingBlocks)
  blocks.value = nextBlocks

  if (!planId.value) {
    markDirty()
  } else {
    const saved = await persistCurrentOrder()
    saveStatus.value = saved ? 'saved' : 'error'
  }

  activeBlockId.value = draggingId
  clearDragState()
}

const onHandleDragEnd = () => {
  clearDragState()
}

const toggleExportMenu = () => {
  showExportMenu.value = !showExportMenu.value
}

const buildWorkspaceBackup = async () => {
  if (!planStore.plans.length) {
    await planStore.loadPlans()
  }
  await Promise.all(planStore.plans.map(async (plan) => {
    if (!planStore.getBlocks(plan.id)?.length) {
      await planStore.loadBlocks(plan.id)
    }
  }))

  return {
    plans: planStore.plans.map((plan) => ({
      id: plan.id,
      title: plan.title,
      status: plan.status,
      priority: plan.priority,
      planType: plan.type,
      customTypeName: plan.custom_type_name || '',
      dueDate: plan.due_date,
      blocks: (planStore.getBlocks(plan.id) || []).map((block, index) => ({
        id: block.id,
        type: block.type,
        order: block.order || index + 1,
        content: block.content || createBlockContent(block.type)
      }))
    }))
  }
}

const handleExport = async (format) => {
  showExportMenu.value = false
  if (format === 'workspace') {
    const workspace = await buildWorkspaceBackup()
    await exportWorkspaceBackup(workspace, `${title.value || '计划'}-workspace-backup`)
    return
  }

  await exportPlan({
    title: title.value || '计划',
    dueDate: dueDate.value,
    status: status.value,
    priority: priority.value,
    planType: planType.value,
    customTypeName: customTypeName.value,
    blocks: blocks.value
  }, format)
}

const triggerImport = () => {
  fileInputRef.value?.click()
}

const handleImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (blocks.value.length && !window.confirm('导入会替换当前页面中的块内容，是否继续？')) {
    event.target.value = ''
    return
  }

  const res = await importPlan(file)
  if (res.success) {
    await replaceAllBlocks({
      title: res.title,
      dueDate: res.dueDate,
      status: res.status,
      priority: res.priority,
      planType: res.planType,
      customTypeName: res.customTypeName,
      blocks: res.blocks
    })
  } else {
    window.alert(res.error || '导入失败，请检查文件格式')
  }
  event.target.value = ''
}

const deleteCurrentPlan = async () => {
  if (!planId.value) return
  if (!window.confirm(`确认要删除计划“${title.value || '无标题'}”吗？`)) return
  const res = await planStore.deletePlan(planId.value)
  if (res.success) router.push('/plan')
}

const confirmLeaveIfNeeded = async () => {
  if (!hasUnsavedChanges.value) return true
  const saved = await saveEverything()
  if (saved) return true
  return window.confirm('自动保存失败，离开页面可能会丢失修改，仍然要离开吗？')
}

const handleBack = async () => {
  if (!(await confirmLeaveIfNeeded())) return
  router.push('/plan')
}

watch(() => route.params.id, loadPlan, { immediate: true })
watch(() => commandMenu.value.query, () => {
  commandMenu.value.highlight = 0
  if (!commandMenu.value.query.trim() && commandMenu.value.show) {
    commandMenu.value.selectedCategory = commandItems[0]?.category || 'all'
  }
})
watch(() => visibleCommandItems.value.length, (length) => {
  if (!length) {
    commandMenu.value.highlight = 0
    return
  }
  if (commandMenu.value.highlight > length - 1) {
    commandMenu.value.highlight = length - 1
  }
})
watch(
  () => [commandMenu.value.highlight, currentCommandPage.value, commandMenu.value.selectedCategory, commandMenu.value.show],
  async () => {
    if (!commandMenu.value.show) return
    await nextTick()
    const activeItem = commandListRef.value?.querySelector('.slash-item-active')
    activeItem?.scrollIntoView({ block: 'nearest' })
  }
)
watch(
  () => blocks.value.map((block) => String(block.id)).join(','),
  () => {
    if (inlineAi.value.blockId && !getBlockById(inlineAi.value.blockId)) {
      closeInlineAi()
    }
    if (inlineAiToolbar.value.blockId && !getBlockById(inlineAiToolbar.value.blockId)) {
      closeInlineAiToolbar()
    }
    if (inlineFormatToolbar.value.blockId && !getBlockById(inlineFormatToolbar.value.blockId)) {
      closeInlineFormatToolbar()
    }
  }
)
watch(
  aiTemplateStore,
  persistAiTemplateStore,
  { deep: true }
)

onBeforeRouteLeave(async () => {
  const canLeave = await confirmLeaveIfNeeded()
  if (!canLeave) return false
  clearAllBlockSaveTimers()
  clearAiImagePolling()
  clearAiVideoPolling()
  return true
})

onMounted(() => {
  aiCooldownTimer = window.setInterval(() => {
    aiCooldownTick.value = Date.now()
  }, 1000)

  const onKeydown = async (event) => {
    if (event.defaultPrevented) return

    if ((event.ctrlKey || event.metaKey) && !event.altKey) {
      const formatContext = buildInlineFormatContextFromElement(document.activeElement, { allowCollapsed: true })
      if (formatContext) {
        const key = event.key.toLowerCase()
        if (key === 'b') {
          event.preventDefault()
          await applyInlineFormat('bold')
          return
        }
        if (key === 'i') {
          event.preventDefault()
          await applyInlineFormat('italic')
          return
        }
        if (key === '`') {
          event.preventDefault()
          await applyInlineFormat('code')
          return
        }
        if (key === 'k') {
          event.preventDefault()
          await applyInlineFormat('link')
          return
        }
        if (event.shiftKey && key === 's') {
          event.preventDefault()
          await applyInlineFormat('strike')
          return
        }
        if (event.shiftKey && key === 'h') {
          event.preventDefault()
          await applyInlineFormat('highlight')
          return
        }
      }
    }

    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedBlockIds.value.size) {
      if (!isEditableElement(event.target)) {
        event.preventDefault()
        await deleteSelectedBlocks()
        return
      }
    }

    if (event.key === 'Escape') {
      if (selectedBlockIds.value.size) {
        clearSelectedBlocks()
      }
      finishBlockSelection()
      if (inlineAi.value.show) {
        closeInlineAi()
        return
      }
      if (aiPanel.value.show) {
        closeAiPanel()
        return
      }
      closeRowMenu()
      closeCommandMenu()
      closeInlineAiToolbar()
      closeInlineFormatToolbar()
      showExportMenu.value = false
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      if (aiPanel.value.show) {
        closeAiPanel()
        return
      }
      openAiPanel('outline')
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j') {
      const context = buildInlineAiContextFromElement(document.activeElement, { allowCollapsed: true })
      if (context) {
        event.preventDefault()
        openInlineAi(context, inlineAi.value.show ? inlineAi.value.action : 'continue')
      }
      return
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault()
      await saveEverything()
    }
  }

  const onWindowClick = (event) => {
    const target = event.target
    if (rowMenu.value.show && !target.closest('.plan-row-handle') && !target.closest('.row-menu-item')) {
      closeRowMenu()
    }
    if (commandMenu.value.show && !target.closest('.slash-panel')) {
      closeCommandMenu()
    }
    if (
      inlineAiToolbar.value.show &&
      !target.closest('.inline-ai-toolbar') &&
      !target.closest('.inline-format-toolbar') &&
      !target.closest('.plan-row') &&
      !target.closest('.inline-ai-card')
    ) {
      closeInlineAiToolbar()
      closeInlineFormatToolbar()
    }
    if (selectedBlockIds.value.size && !blockSelection.value.active && !target.closest('.plan-row-select')) {
      if (!target.closest('.plan-row-selected') && !target.closest('.plan-row-handle')) {
        clearSelectedBlocks()
      }
    }
  }

  const onSelectionChange = () => {
    refreshInlineAiToolbar()
    refreshInlineFormatToolbar()
  }

  const onEditorMouseup = () => {
    if (blockSelection.value.active) {
      finishBlockSelection()
    }
    refreshInlineAiToolbar()
    refreshInlineFormatToolbar()
  }

  const onEditorKeyup = () => {
    refreshInlineAiToolbar()
    refreshInlineFormatToolbar()
  }

  const onResize = () => {
    closeInlineAiToolbar()
    closeInlineFormatToolbar()
  }

  document.addEventListener('keydown', onKeydown)
  document.addEventListener('selectionchange', onSelectionChange)
  document.addEventListener('mouseup', onEditorMouseup)
  document.addEventListener('keyup', onEditorKeyup)
  window.addEventListener('resize', onResize)
  window.addEventListener('click', onWindowClick)
  removeKeydownListener = () => document.removeEventListener('keydown', onKeydown)
  removeSelectionChangeListener = () => document.removeEventListener('selectionchange', onSelectionChange)
  removeMouseupListener = () => document.removeEventListener('mouseup', onEditorMouseup)
  removeEditorKeyupListener = () => document.removeEventListener('keyup', onEditorKeyup)
  removeResizeListener = () => window.removeEventListener('resize', onResize)
  removeClickListener = () => window.removeEventListener('click', onWindowClick)
  nextTick(() => resizeTitle())
})

onBeforeUnmount(() => {
  clearAllBlockSaveTimers()
  clearAiImagePolling()
  clearAiVideoPolling()
  if (aiCooldownTimer) window.clearInterval(aiCooldownTimer)
  if (removeKeydownListener) removeKeydownListener()
  if (removeSelectionChangeListener) removeSelectionChangeListener()
  if (removeMouseupListener) removeMouseupListener()
  if (removeEditorKeyupListener) removeEditorKeyupListener()
  if (removeResizeListener) removeResizeListener()
  if (removeClickListener) removeClickListener()
})
</script>

<style scoped>
.plan-editor-shell {
  min-height: calc(100vh - 7rem);
}

.plan-editor-surface {
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.08);
  padding: 2rem 2rem 3rem;
}

.dark .plan-editor-surface {
  border-color: rgba(39, 39, 42, 0.9);
  background: rgba(9, 9, 11, 0.92);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}

.plan-title-input {
  width: 100%;
  resize: none;
  overflow: hidden;
  border: 0;
  background: transparent;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.05em;
  color: rgb(9 9 11);
  outline: none;
}

.plan-title-input::placeholder {
  color: rgb(161 161 170);
}

.dark .plan-title-input {
  color: white;
}

.plan-meta-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  border-radius: 18px;
  border: 1px solid rgba(228, 228, 231, 0.9);
  background: rgba(250, 250, 250, 0.85);
  padding: 0.85rem 0.95rem;
}

.dark .plan-meta-field {
  border-color: rgba(39, 39, 42, 0.9);
  background: rgba(24, 24, 27, 0.9);
}

.plan-meta-field span {
  font-size: 0.75rem;
  color: rgb(113 113 122);
}

.plan-meta-field select,
.plan-meta-field input {
  border: 0;
  background: transparent;
  color: rgb(24 24 27);
  font-size: 0.95rem;
  outline: none;
  padding: 0;
}

.dark .plan-meta-field select,
.dark .plan-meta-field input {
  color: white;
}

.plan-meta-type-row {
  display: flex;
  min-width: 0;
}

.plan-meta-type-row-custom {
  align-items: center;
  gap: 0.8rem;
}

.plan-meta-type-row-custom select {
  flex: 0 0 8.5rem;
}

.plan-meta-type-input {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 2.55rem;
  border: 1px solid rgba(228, 228, 231, 0.92) !important;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72) !important;
  padding: 0 0.9rem !important;
}

.plan-meta-type-input::placeholder {
  color: rgb(161 161 170);
}

.dark .plan-meta-type-input {
  border-color: rgba(63, 63, 70, 0.92) !important;
  background: rgba(9, 9, 11, 0.55) !important;
}

@media (max-width: 1023px) {
  .plan-meta-type-row-custom {
    flex-direction: column;
    align-items: stretch;
    gap: 0.55rem;
  }

  .plan-meta-type-row-custom select {
    flex-basis: auto;
  }
}

.plan-document {
  position: relative;
}

.plan-empty-state {
  border-radius: 28px;
  border: 1px dashed rgba(212, 212, 216, 0.9);
  padding: 5rem 1.5rem;
  text-align: center;
  cursor: text;
}

.dark .plan-empty-state {
  border-color: rgba(63, 63, 70, 0.9);
}

.plan-row {
  position: relative;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  align-items: start;
  gap: 0.5rem;
  padding: 0.15rem 0;
  border-radius: 16px;
}

.plan-row::before,
.plan-row::after {
  content: '';
  position: absolute;
  left: 54px;
  right: 0;
  height: 2px;
  background: rgb(24 24 27);
  opacity: 0;
  pointer-events: none;
}

.dark .plan-row::before,
.dark .plan-row::after {
  background: white;
}

.plan-row-drop-before::before {
  top: -2px;
  opacity: 1;
}

.plan-row-drop-after::after {
  bottom: -2px;
  opacity: 1;
}

.plan-row-active {
  background: rgba(244, 244, 245, 0.8);
}

.plan-row-selected {
  background: rgba(228, 228, 231, 0.78);
}

.plan-row-dragging {
  opacity: 0.45;
}

.dark .plan-row-active {
  background: rgba(24, 24, 27, 0.72);
}

.dark .plan-row-selected {
  background: rgba(39, 39, 42, 0.88);
}

.plan-row-gutter {
  display: grid;
  grid-template-columns: repeat(2, 24px);
  grid-template-rows: 28px;
  justify-content: center;
  align-items: start;
  gap: 0.2rem;
  padding-top: 0.35rem;
}

.plan-row-select,
.plan-row-handle,
.plan-row-plus,
.plan-row-ai {
  display: inline-flex;
  height: 24px;
  width: 24px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: rgba(244, 244, 245, 0.86);
  color: rgb(82 82 91);
  opacity: 1;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(14px);
  transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.plan-row-handle {
  height: 28px;
  width: 28px;
  border: 1px solid rgba(228, 228, 231, 0.9);
  background: rgba(255, 255, 255, 0.96);
  color: rgb(39 39 42);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(18px);
}

.plan-row-handle span {
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: -0.12em;
  transform: translateY(-1px);
}

.dark .plan-row-handle {
  border-color: rgba(63, 63, 70, 0.92);
  background: rgba(24, 24, 27, 0.98);
  color: white;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.34);
}

.plan-row-select span {
  height: 10px;
  width: 10px;
  border-radius: 9999px;
  border: 1.5px solid currentColor;
}

.plan-row-select-active {
  opacity: 1;
  background: rgba(24, 24, 27, 0.92);
  color: white;
}

.plan-row-select-active span {
  background: currentColor;
}

.dark .plan-row-select-active {
  background: rgba(255, 255, 255, 0.14);
  color: white;
}

.plan-row-select:hover,
.plan-row-handle:hover,
.plan-row-plus:hover,
.plan-row-ai:hover {
  background: rgba(228, 228, 231, 0.96);
  color: rgb(24 24 27);
}

.dark .plan-row-select:hover,
.dark .plan-row-handle:hover,
.dark .plan-row-plus:hover,
.dark .plan-row-ai:hover {
  background: rgba(39, 39, 42, 0.98);
  color: white;
}

.plan-row-ai {
  width: 34px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.plan-row-content {
  min-width: 0;
  padding-top: 0.05rem;
}

.plan-row-content :deep(textarea) {
  overflow-y: hidden;
}

.inline-ai-toolbar {
  position: fixed;
  z-index: 1250;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  max-width: min(720px, calc(100vw - 24px));
  overflow-x: auto;
  transform: translateX(-50%) translateY(calc(-100% - 2px));
  border: 1px solid rgba(228, 228, 231, 0.9);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(20px);
  padding: 0.35rem;
}

.inline-format-toolbar {
  z-index: 1246;
}

.dark .inline-ai-toolbar {
  border-color: rgba(63, 63, 70, 0.92);
  background: rgba(9, 9, 11, 0.82);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
}

.inline-ai-toolbar::-webkit-scrollbar {
  height: 4px;
}

.inline-ai-toolbar::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: rgba(161, 161, 170, 0.55);
}

.inline-ai-toolbar-btn,
.inline-ai-toolbar-primary,
.inline-ai-toolbar-link,
.inline-ai-chip,
.inline-ai-close,
.inline-ai-run-btn,
.inline-ai-apply-btn,
.inline-ai-ghost-btn {
  border: 0;
  border-radius: 9999px;
  font-size: 0.78rem;
  transition: background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
}

.inline-ai-toolbar-primary,
.inline-ai-toolbar-btn {
  min-height: 36px;
  border: 1px solid transparent;
  background: transparent;
  color: rgb(63 63 70);
  padding: 0.5rem 0.9rem;
  white-space: nowrap;
  font-weight: 600;
}

.inline-ai-toolbar-primary {
  background: rgba(24, 24, 27, 0.08);
  color: rgb(24 24 27);
  font-weight: 600;
}

.inline-ai-toolbar-btn-active {
  border-color: rgba(24, 24, 27, 0.08);
  background: rgba(24, 24, 27, 0.92);
  color: white;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
}

.inline-ai-toolbar-primary:hover,
.inline-ai-toolbar-btn:hover {
  background: rgba(228, 228, 231, 0.9);
  color: rgb(24 24 27);
}

.inline-ai-toolbar-link {
  background: transparent;
  color: rgb(113 113 122);
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
}

.inline-ai-toolbar-link:hover {
  background: rgba(244, 244, 245, 0.96);
  color: rgb(24 24 27);
}

.dark .inline-ai-toolbar-primary,
.dark .inline-ai-toolbar-btn {
  color: rgb(228 228 231);
}

.dark .inline-ai-toolbar-btn-active {
  border-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.96);
  color: rgb(9 9 11);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.32);
}

.dark .inline-ai-toolbar-primary {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.dark .inline-ai-toolbar-primary:hover,
.dark .inline-ai-toolbar-btn:hover {
  background: rgba(39, 39, 42, 0.96);
  color: white;
}

.dark .inline-ai-toolbar-link {
  color: rgb(161 161 170);
}

.dark .inline-ai-toolbar-link:hover {
  background: rgba(39, 39, 42, 0.96);
  color: white;
}

.inline-ai-card {
  margin-top: 0.9rem;
  border: 1px solid rgba(228, 228, 231, 0.92);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 20px 54px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(20px);
  padding: 1rem;
}

.dark .inline-ai-card {
  border-color: rgba(63, 63, 70, 0.92);
  background: rgba(9, 9, 11, 0.74);
  box-shadow: 0 20px 54px rgba(0, 0, 0, 0.28);
}

.inline-ai-header,
.inline-ai-runner,
.inline-ai-result-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.inline-ai-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.inline-ai-chip {
  background: rgba(244, 244, 245, 0.95);
  color: rgb(82 82 91);
  padding: 0.45rem 0.8rem;
}

.inline-ai-chip-active {
  background: rgb(24 24 27);
  color: white;
}

.dark .inline-ai-chip {
  background: rgba(39, 39, 42, 0.96);
  color: rgb(228 228 231);
}

.dark .inline-ai-chip-active {
  background: rgba(255, 255, 255, 0.14);
  color: white;
}

.inline-ai-close {
  background: rgba(244, 244, 245, 0.96);
  color: rgb(63 63 70);
  padding: 0.45rem 0.78rem;
}

.dark .inline-ai-close {
  background: rgba(39, 39, 42, 0.96);
  color: rgb(244 244 245);
}

.inline-ai-context {
  margin-top: 0.95rem;
  border-radius: 18px;
  background: rgba(244, 244, 245, 0.75);
  padding: 0.8rem 0.95rem;
}

.dark .inline-ai-context {
  background: rgba(24, 24, 27, 0.84);
}

.inline-ai-context-label {
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgb(113 113 122);
}

.inline-ai-context p {
  margin-top: 0.35rem;
  font-size: 0.86rem;
  line-height: 1.65;
  color: rgb(63 63 70);
}

.dark .inline-ai-context p {
  color: rgb(228 228 231);
}

.inline-ai-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.inline-ai-field span,
.inline-ai-shortcut {
  font-size: 0.76rem;
  color: rgb(113 113 122);
}

.inline-ai-textarea {
  width: 100%;
  resize: vertical;
  min-height: 88px;
  border: 1px solid rgba(228, 228, 231, 0.94);
  border-radius: 18px;
  background: rgba(250, 250, 250, 0.92);
  color: rgb(24 24 27);
  outline: none;
  padding: 0.9rem 1rem;
}

.dark .inline-ai-textarea {
  border-color: rgba(63, 63, 70, 0.92);
  background: rgba(24, 24, 27, 0.92);
  color: white;
}

.inline-ai-runner {
  margin-top: 0.95rem;
}

.inline-ai-run-btn,
.inline-ai-apply-btn {
  background: rgb(24 24 27);
  color: white;
  padding: 0.68rem 1rem;
}

.inline-ai-run-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.dark .inline-ai-run-btn,
.dark .inline-ai-apply-btn {
  background: white;
  color: rgb(24 24 27);
}

.inline-ai-result-card {
  margin-top: 1rem;
  border: 1px solid rgba(228, 228, 231, 0.92);
  border-radius: 22px;
  background: rgba(250, 250, 250, 0.88);
  padding: 1rem;
}

.dark .inline-ai-result-card {
  border-color: rgba(63, 63, 70, 0.92);
  background: rgba(24, 24, 27, 0.9);
}

.inline-ai-result-pre {
  white-space: pre-wrap;
  margin-top: 0.85rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  color: rgb(39 39 42);
  font-size: 0.9rem;
  line-height: 1.72;
  padding: 1rem;
}

.dark .inline-ai-result-pre {
  background: rgba(9, 9, 11, 0.94);
  color: rgb(244 244 245);
}

.inline-ai-result-actions {
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 0.9rem;
}

.inline-ai-ghost-btn {
  background: rgba(244, 244, 245, 0.95);
  color: rgb(63 63 70);
  padding: 0.68rem 0.95rem;
}

.dark .inline-ai-ghost-btn {
  background: rgba(39, 39, 42, 0.96);
  color: rgb(244 244 245);
}

.plan-new-line {
  display: inline-flex;
  align-items: center;
  border: 0;
  background: transparent;
  color: rgb(113 113 122);
  margin-top: 1rem;
  padding: 0.55rem 0;
  font-size: 0.95rem;
}

.plan-new-line:hover {
  color: rgb(24 24 27);
}

.dark .plan-new-line:hover {
  color: white;
}

.row-menu-item,
.export-menu-item {
  width: 100%;
  border: 0;
  background: transparent;
  border-radius: 12px;
  padding: 0.65rem 0.8rem;
  text-align: left;
  font-size: 0.9rem;
  color: rgb(39 39 42);
}

.row-menu-item:hover,
.export-menu-item:hover {
  background: rgba(244, 244, 245, 1);
}

.dark .row-menu-item,
.dark .export-menu-item {
  color: rgb(244 244 245);
}

.dark .row-menu-item:hover,
.dark .export-menu-item:hover {
  background: rgba(39, 39, 42, 1);
}

.slash-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1200;
}

.slash-panel {
  position: fixed;
  z-index: 1201;
  width: 320px;
  border-radius: 22px;
  border: 1px solid rgba(228, 228, 231, 0.95);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
  padding: 0.65rem;
}

.dark .slash-panel {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(9, 9, 11, 0.98);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.slash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.55rem 0.45rem;
  font-size: 0.75rem;
  color: rgb(113 113 122);
}

.slash-search {
  width: 100%;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 14px;
  background: transparent;
  padding: 0.7rem 0.85rem;
  font-size: 0.9rem;
  outline: none;
  color: rgb(24 24 27);
}

.dark .slash-search {
  border-color: rgba(39, 39, 42, 0.95);
  color: white;
}

.slash-category-tabs {
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  padding: 0 0.2rem 0.6rem;
  margin-bottom: 0.3rem;
  scrollbar-width: none;
}

.slash-category-tabs::-webkit-scrollbar {
  display: none;
}

.slash-category-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 9999px;
  background: rgba(250, 250, 250, 0.96);
  padding: 0.38rem 0.72rem;
  font-size: 0.74rem;
  color: rgb(82 82 91);
  transition: all 0.18s ease;
}

.slash-category-chip:hover,
.slash-category-chip-active {
  border-color: rgba(24, 24, 27, 0.12);
  background: rgb(24 24 27);
  color: white;
}

.dark .slash-category-chip {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(24, 24, 27, 0.96);
  color: rgb(212 212 216);
}

.dark .slash-category-chip:hover,
.dark .slash-category-chip-active {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(244, 244, 245, 0.12);
  color: white;
}

.slash-category-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgba(113, 113, 122, 0.14);
  padding: 0 0.35rem;
  font-size: 0.68rem;
}

.slash-list {
  max-height: 340px;
  overflow-y: auto;
  padding-right: 0.2rem;
}

.slash-list::-webkit-scrollbar {
  width: 8px;
}

.slash-list::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: rgba(161, 161, 170, 0.35);
}

.dark .slash-list::-webkit-scrollbar-thumb {
  background: rgba(113, 113, 122, 0.5);
}

.slash-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border: 0;
  background: transparent;
  border-radius: 16px;
  padding: 0.7rem 0.75rem;
  text-align: left;
}

.slash-item:hover,
.slash-item-active {
  background: rgba(244, 244, 245, 1);
}

.dark .slash-item:hover,
.dark .slash-item-active {
  background: rgba(39, 39, 42, 1);
}

.slash-item-icon {
  display: inline-flex;
  height: 34px;
  width: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(244, 244, 245, 1);
  font-size: 0.8rem;
  font-weight: 700;
  color: rgb(39 39 42);
}

.dark .slash-item-icon {
  background: rgba(39, 39, 42, 1);
  color: rgb(244 244 245);
}

.slash-item-text {
  display: flex;
  min-width: 0;
  flex-direction: column;
  flex: 1;
}

.slash-item-text span:first-child {
  font-size: 0.92rem;
  color: rgb(24 24 27);
}

.slash-item-text span:last-child {
  font-size: 0.74rem;
  color: rgb(113 113 122);
}

.dark .slash-item-text span:first-child {
  color: white;
}

.slash-item-badge {
  flex-shrink: 0;
  border-radius: 9999px;
  background: rgba(244, 244, 245, 1);
  padding: 0.25rem 0.55rem;
  font-size: 0.68rem;
  color: rgb(113 113 122);
}

.dark .slash-item-badge {
  background: rgba(39, 39, 42, 1);
  color: rgb(212 212 216);
}

.slash-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.4rem 0.1rem;
}

.slash-page-btn {
  border: 0;
  border-radius: 9999px;
  background: rgba(244, 244, 245, 1);
  padding: 0.45rem 0.8rem;
  font-size: 0.75rem;
  color: rgb(39 39 42);
}

.slash-page-btn:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.slash-page-indicator {
  font-size: 0.75rem;
  color: rgb(113 113 122);
}

.dark .slash-page-btn {
  background: rgba(39, 39, 42, 1);
  color: rgb(244 244 245);
}

.dark .slash-page-indicator {
  color: rgb(161 161 170);
}

.ai-panel {
  display: flex;
  flex-direction: column;
  max-height: min(88vh, 960px);
  overflow: hidden;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.2);
  padding: 1.25rem;
}

.dark .ai-panel {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(9, 9, 11, 0.98);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5);
}

.ai-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
}

.ai-panel-close {
  border: 0;
  border-radius: 9999px;
  background: rgba(244, 244, 245, 1);
  color: rgb(39 39 42);
  font-size: 0.82rem;
  padding: 0.55rem 0.9rem;
}

.dark .ai-panel-close {
  background: rgba(39, 39, 42, 1);
  color: rgb(244 244 245);
}

.ai-panel-tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  overflow-x: auto;
  flex-shrink: 0;
}

.ai-panel-tab {
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 9999px;
  background: rgba(250, 250, 250, 0.96);
  color: rgb(82 82 91);
  font-size: 0.78rem;
  padding: 0.5rem 0.85rem;
  white-space: nowrap;
}

.ai-panel-tab-active {
  background: rgb(24 24 27);
  border-color: rgba(24, 24, 27, 0.12);
  color: white;
}

.dark .ai-panel-tab {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(24, 24, 27, 0.96);
  color: rgb(212 212 216);
}

.dark .ai-panel-tab-active {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(244, 244, 245, 0.12);
  color: white;
}

.ai-panel-body {
  padding-top: 0.25rem;
  overflow-y: auto;
  padding-right: 0.2rem;
}

.ai-mode-chip {
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 9999px;
  background: rgba(250, 250, 250, 0.96);
  color: rgb(82 82 91);
  font-size: 0.8rem;
  padding: 0.55rem 0.9rem;
}

.ai-mode-chip-active {
  background: rgb(24 24 27);
  border-color: rgba(24, 24, 27, 0.14);
  color: white;
}

.dark .ai-mode-chip {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(24, 24, 27, 0.96);
  color: rgb(212 212 216);
}

.dark .ai-mode-chip-active {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.08);
  color: white;
}

.ai-panel-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-panel-field span {
  font-size: 0.8rem;
  color: rgb(113 113 122);
}

.ai-panel-input,
.ai-panel-textarea {
  width: 100%;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 18px;
  background: rgba(250, 250, 250, 0.9);
  color: rgb(24 24 27);
  font-size: 0.92rem;
  outline: none;
  padding: 0.9rem 1rem;
}

.dark .ai-panel-input,
.dark .ai-panel-textarea {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(24, 24, 27, 0.95);
  color: white;
}

.ai-panel-textarea {
  resize: vertical;
  min-height: 128px;
}

.ai-upload-field {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.ai-upload-field span {
  font-size: 0.8rem;
  color: rgb(113 113 122);
}

.ai-upload-field input[type="file"] {
  border: 1px dashed rgba(212, 212, 216, 0.95);
  border-radius: 18px;
  background: rgba(250, 250, 250, 0.92);
  color: rgb(63 63 70);
  padding: 0.85rem 1rem;
}

.dark .ai-upload-field input[type="file"] {
  border-color: rgba(63, 63, 70, 0.92);
  background: rgba(24, 24, 27, 0.96);
  color: rgb(228 228 231);
}

.ai-result-card {
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 24px;
  background: rgba(250, 250, 250, 0.92);
  padding: 1rem;
}

.dark .ai-result-card {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(24, 24, 27, 0.92);
}

.ai-result-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: rgb(24 24 27);
  color: white;
  padding: 0.28rem 0.6rem;
}

.dark .ai-result-badge {
  background: rgba(244, 244, 245, 0.12);
}

.ai-outline-item,
.ai-question-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.85rem 0.9rem;
}

.dark .ai-outline-item,
.dark .ai-question-item {
  background: rgba(9, 9, 11, 0.9);
}

.ai-outline-index,
.ai-question-index {
  display: inline-flex;
  height: 1.75rem;
  width: 1.75rem;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9999px;
  background: rgb(24 24 27);
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
}

.dark .ai-outline-index,
.dark .ai-question-index {
  background: white;
  color: rgb(24 24 27);
}

.ai-result-pre {
  white-space: pre-wrap;
  margin-top: 0.85rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.95);
  color: rgb(39 39 42);
  font-size: 0.92rem;
  line-height: 1.75;
  padding: 1rem;
}

.dark .ai-result-pre {
  background: rgba(9, 9, 11, 0.9);
  color: rgb(244 244 245);
}

.ai-source-grid,
.ai-generated-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.9rem;
}

.ai-source-card,
.ai-generated-card {
  overflow: hidden;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.94);
  padding: 0.75rem;
}

.dark .ai-source-card,
.dark .ai-generated-card {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(24, 24, 27, 0.94);
}

.ai-source-image,
.ai-generated-image {
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 16px;
  background: rgba(244, 244, 245, 0.9);
}

.ai-source-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.7rem;
  font-size: 0.78rem;
  color: rgb(82 82 91);
}

.dark .ai-source-footer {
  color: rgb(212 212 216);
}

.ai-source-remove {
  border: 0;
  border-radius: 9999px;
  background: rgba(244, 244, 245, 0.96);
  color: rgb(82 82 91);
  padding: 0.36rem 0.66rem;
}

.dark .ai-source-remove {
  background: rgba(39, 39, 42, 0.96);
  color: rgb(244 244 245);
}

.ai-generated-video {
  display: block;
  width: 100%;
  max-height: 420px;
  border-radius: 16px;
  background: black;
  object-fit: contain;
}

.ai-timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.ai-timeline-dot {
  width: 0.6rem;
  height: 0.6rem;
  margin-top: 0.45rem;
  border-radius: 9999px;
  background: rgb(24 24 27);
  flex-shrink: 0;
}

.dark .ai-timeline-dot {
  background: white;
}

.ai-history-card {
  width: 100%;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  padding: 0.9rem 1rem;
  text-align: left;
  transition: border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease;
}

.ai-history-card:hover,
.ai-history-card-active {
  border-color: rgba(24, 24, 27, 0.18);
  background: rgba(244, 244, 245, 0.96);
  transform: translateY(-1px);
}

.dark .ai-history-card {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(24, 24, 27, 0.94);
}

.dark .ai-history-card:hover,
.dark .ai-history-card-active {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(39, 39, 42, 0.98);
}

.ai-history-prompt {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ai-history-action,
.ai-history-delete {
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 9999px;
  background: rgba(250, 250, 250, 0.96);
  color: rgb(63 63 70);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.45rem 0.7rem;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, opacity 0.18s ease;
}

.ai-history-action:hover,
.ai-history-delete:hover {
  background: rgba(244, 244, 245, 1);
  border-color: rgba(161, 161, 170, 0.5);
  color: rgb(24 24 27);
}

.ai-history-delete {
  color: rgb(220 38 38);
}

.ai-history-delete:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.dark .ai-history-action,
.dark .ai-history-delete {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(24, 24, 27, 0.96);
  color: rgb(228 228 231);
}

.dark .ai-history-action:hover,
.dark .ai-history-delete:hover {
  background: rgba(39, 39, 42, 0.98);
  border-color: rgba(255, 255, 255, 0.14);
  color: white;
}

.dark .ai-history-delete {
  color: rgb(252 165 165);
}

@media (max-width: 768px) {
  .plan-editor-surface {
    padding: 1.25rem 1rem 2rem;
    border-radius: 24px;
  }

  .plan-row {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .plan-row::before,
  .plan-row::after {
    left: 50px;
  }

  .plan-row-gutter {
    grid-template-columns: repeat(2, 22px);
    grid-template-rows: 28px;
  }

  .slash-panel {
    width: min(320px, calc(100vw - 24px));
  }

  .ai-panel {
    margin-top: 0;
    border-radius: 24px;
    padding: 1rem;
  }

  .ai-panel-header {
    flex-direction: column;
  }
}
</style>
