<template>
  <aside v-if="aiPanel.show" class="ai-panel ai-workspace-inline" @click.stop @mousedown.stop>
    <div class="ai-panel-header">
            <div>
              <div class="text-lg font-semibold text-zinc-950 dark:text-white">Mentor-X 工作区</div>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">问答、图片和视频统一在这里处理，结果可以插入当前计划。</p>
            </div>
            <div class="flex items-center gap-2">
              <button v-if="aiPanel.tab === 'chat'" type="button" class="ai-panel-new-chat" @click="resetAiWorkspaceChat">新对话</button>
              <button type="button" class="ai-panel-close" @click="closeAiPanel">返回执行面</button>
            </div>
    </div>

    <div class="ai-conversation-toolbar">
      <label class="ai-conversation-select">
        <span>对话记录</span>
        <select
          :value="aiConversationId"
          :disabled="aiConversationLoading || aiConversationSaving"
          @change="selectAiConversation($event.target.value)"
        >
          <option value="">当前临时对话</option>
          <option v-for="conversation in aiConversations" :key="conversation.id" :value="conversation.id">
            {{ conversation.title || '新对话' }} · {{ conversation.messageCount || 0 }} 条
          </option>
        </select>
      </label>
      <div class="ai-conversation-actions">
        <button type="button" class="ai-conversation-action" :disabled="aiConversationSaving" @click="startNewAiConversation">
          {{ aiConversationSaving ? '保存中...' : '新对话' }}
        </button>
        <button
          v-if="aiConversationId"
          type="button"
          class="ai-conversation-delete"
          :disabled="aiConversationSaving"
          @click="deleteCurrentAiConversation"
        >
          删除
        </button>
      </div>
    </div>

    <div class="ai-panel-tabs">
            <button type="button" class="ai-panel-tab" :class="{ 'ai-panel-tab-active': aiPanel.tab === 'chat' }" @click="selectTab('chat')">AI 问答</button>
            <button type="button" class="ai-panel-tab" :class="{ 'ai-panel-tab-active': aiPanel.tab === 'image' }" @click="selectTab('image')">AI 生图</button>
            <button type="button" class="ai-panel-tab" :class="{ 'ai-panel-tab-active': aiPanel.tab === 'video' }" @click="selectTab('video')">AI 生视频</button>
    </div>

    <label class="ai-model-switch" title="当前模型">
      <span>模型</span>
      <select
        v-model="aiSelectedModel"
        @focus="ensureAiMediaModelsLoaded"
        @click="ensureAiMediaModelsLoaded"
      >
        <option value="" disabled>{{ aiMediaModelsLoading ? '正在加载模型...' : '请选择模型' }}</option>
        <option v-for="item in aiModelOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
      <small>{{ aiMediaModelHint }}</small>
    </label>

    <div v-if="aiPanel.tab === 'chat'" class="ai-chat-layout">
            <div class="ai-chat-context-bar">
              <div class="min-w-0">
                <span class="ai-chat-context-label">当前上下文</span>
                <strong>{{ aiConversationContext.planTitle }}</strong>
                <span>{{ aiConversationContext.blockCount }} 个计划块 · {{ aiConversationContext.model }}</span>
              </div>
              <button type="button" @click="aiConversationContextExpanded = !aiConversationContextExpanded">
                {{ aiConversationContextExpanded ? '收起' : '查看' }}
              </button>
            </div>
            <div v-if="aiConversationContextExpanded" class="ai-chat-context-detail">
              <div class="ai-chat-context-detail-head">
                <span>本次对话会使用这些计划内容</span>
                <span>{{ aiConversationContext.blocks.length }} 条摘要</span>
              </div>
              <div v-if="aiConversationContext.blocks.length" class="ai-chat-context-blocks">
                <div v-for="block in aiConversationContext.blocks" :key="`${block.id}-${block.order}`">
                  <span>{{ block.order }}</span>
                  <p>{{ block.summary || '空白块' }}</p>
                </div>
              </div>
              <div v-else class="ai-chat-context-empty">当前计划还没有可读取的正文块。</div>
            </div>
            <div class="ai-chat-messages">
              <div v-if="!aiChatMessages.length" class="ai-chat-welcome">
                <div class="ai-chat-avatar">AI</div>
                <h3>这份计划接下来怎么推进？</h3>
                <p>可以询问当前计划、拆解下一步、检查风险，或让 AI 帮你整理执行顺序。</p>
                <div class="ai-chat-suggestions">
                  <button type="button" @click="setChatPrompt('帮我找出当前计划最重要的下一步')">找出下一步</button>
                  <button type="button" @click="setChatPrompt('帮我检查当前计划的风险和遗漏')">检查风险</button>
                </div>
              </div>
              <div
                v-for="message in aiChatMessages"
                :key="message.id"
                class="ai-chat-message"
                :class="message.role === 'user' ? 'ai-chat-message-user' : 'ai-chat-message-assistant'"
              >
                <div class="ai-chat-message-role">{{ message.role === 'user' ? '你' : 'AI' }}</div>
                <div class="ai-chat-message-content">{{ message.content }}</div>
                <div v-if="message.createdAt || message.model" class="ai-chat-message-meta">
                  <span v-if="message.createdAt">{{ formatConversationTime(message.createdAt) }}</span>
                  <span v-if="message.model">{{ message.model }}</span>
                  <span v-if="message.source === 'provider'">供应商</span>
                </div>
              </div>
              <div v-if="aiChatLoading" class="ai-chat-message ai-chat-message-assistant">
                <div class="ai-chat-message-role">AI</div>
                <div class="ai-chat-typing">正在思考...</div>
              </div>
            </div>

            <form class="ai-chat-composer" @submit.prevent="runAiWorkspaceChat">
              <textarea
                v-model="aiChatDraft"
                rows="3"
                placeholder="询问当前计划，或告诉 AI 你想推进什么..."
                @keydown.meta.enter.prevent="runAiWorkspaceChat"
                @keydown.ctrl.enter.prevent="runAiWorkspaceChat"
              />
              <div class="ai-chat-composer-footer">
                <span>Ctrl / Command + Enter 发送</span>
                <button type="submit" :disabled="aiChatLoading || !aiChatDraft.trim()">↑</button>
              </div>
            </form>
    </div>

    <div v-else-if="aiPanel.tab === 'image'" class="ai-panel-body space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiImageMode === 'text_to_image' }" @click="aiImageMode = 'text_to_image'">文生图</button>
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiImageMode === 'image_to_image' }" @click="aiImageMode = 'image_to_image'">图生图</button>
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiImageMode === 'multi_image' }" @click="aiImageMode = 'multi_image'">多图合成</button>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label class="ai-panel-field">
                    <span>尺寸</span>
                    <select v-model="aiImageSize" class="ai-panel-input">
                      <option v-for="size in aiImageSizeOptions" :key="size" :value="size">{{ size }}</option>
                    </select>
                  </label>
                </div>

                <label class="ai-panel-field">
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
                  当前面板使用已配置供应商的媒体模型，支持文生图、图生图和多图合成，任务会保留状态、进度和历史记录。
                </div>

                <div v-if="aiImageResult" class="ai-result-card space-y-4">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span class="ai-result-badge">已配置供应商</span>
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
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiVideoMode === 'text_to_video' }" @click="aiVideoMode = 'text_to_video'">文生视频</button>
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiVideoMode === 'image_to_video' }" @click="aiVideoMode = 'image_to_video'">图生视频</button>
                  <button type="button" class="ai-mode-chip" :class="{ 'ai-mode-chip-active': aiVideoMode === 'keyframes' }" @click="aiVideoMode = 'keyframes'">关键帧动画</button>
                </div>

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
                    当前视频供应商通常需要公网可访问的图片 URL，不能直接使用本地路径或 data URL。
                  </p>
                </label>

                <label v-if="aiVideoMode !== 'text_to_video'" class="ai-upload-field">
                  <span>{{ aiVideoMode === 'keyframes' ? '上传并自动生成关键帧 URL' : '上传并自动生成参考图 URL' }}</span>
                  <input type="file" accept="image/*" :multiple="aiVideoMode === 'keyframes'" @change="handleAiVideoUploadFiles" />
                  <p class="text-xs leading-6 text-zinc-500 dark:text-zinc-400">
                    系统会先上传图片并尝试生成可公网访问的 `publicUrl`。如果当前环境只能返回本地地址，当前供应商可能无法直接读取。
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
                  当前面板使用已配置供应商的视频模型，支持文生视频、图生视频和关键帧动画，异步任务会自动轮询状态并保留历史记录。
                </div>

                <div v-if="aiVideoResult" class="ai-result-card space-y-4">
                  <div class="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span class="ai-result-badge">已配置供应商</span>
                    <span>{{ aiVideoResult.model }}</span>
                    <span>状态：{{ aiVideoResult.status || 'queued' }}</span>
                    <span v-if="aiVideoResult.progress">进度：{{ aiVideoResult.progress }}%</span>
                  </div>

                  <div class="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-950">
                    <video v-if="aiVideoResult.url" :src="aiVideoResult.url" class="ai-generated-video" controls playsinline />
                    <div v-else class="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      视频任务已提交，正在等待当前供应商返回结果...
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
  </aside>
</template>
<script setup>
import { computed, isRef } from 'vue'

const props = defineProps({
  state: { type: Object, default: () => ({}) },
  actions: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['tab-change'])
const stateRef = (key, fallback = null) => computed({
  get() {
    const value = props.state?.[key]
    return isRef(value) ? value.value : (value ?? fallback)
  },
  set(nextValue) {
    const value = props.state?.[key]
    if (isRef(value)) {
      value.value = nextValue
    } else if (props.state) {
      props.state[key] = nextValue
    }
  }
})
const actionRef = (key) => (...args) => {
  const event = args[0]
  if (event?.preventDefault) event.preventDefault()
  if (event?.stopPropagation) event.stopPropagation()
  return props.actions?.[key]?.(...args)
}

const aiPanel = stateRef('aiPanel', { show: false, tab: 'outline' })
const aiChatMessages = stateRef('aiChatMessages', [])
const aiChatDraft = stateRef('aiChatDraft', '')
const aiChatLoading = stateRef('aiChatLoading', false)
const aiConversations = stateRef('aiConversations', [])
const aiConversationId = stateRef('aiConversationId', '')
const aiConversationLoading = stateRef('aiConversationLoading', false)
const aiConversationSaving = stateRef('aiConversationSaving', false)
const aiConversationContextExpanded = stateRef('aiConversationContextExpanded', false)
const aiConversationContext = stateRef('aiConversationContext', {
  planTitle: '未命名计划',
  blockCount: 0,
  model: '未选择模型',
  blocks: []
})
const aiSelectedModel = stateRef('aiSelectedModel', '')
const aiModelOptions = stateRef('aiModelOptions', [])
const aiMediaModelsLoading = stateRef('aiMediaModelsLoading', false)
const aiMediaModelError = stateRef('aiMediaModelError', '')
const aiImageMode = stateRef('aiImageMode', 'text_to_image')
const aiImageModel = stateRef('aiImageModel', '')
const aiImageModelOptions = stateRef('aiImageModelOptions', [])
const aiMediaModelHint = stateRef('aiMediaModelHint', '')
const aiImageSize = stateRef('aiImageSize', '1024x1024')
const aiImageSizeOptions = stateRef('aiImageSizeOptions', [])
const aiImageRatio = stateRef('aiImageRatio', '1:1')
const aiImageRatioOptions = stateRef('aiImageRatioOptions', [])
const aiImagePrompt = stateRef('aiImagePrompt', '')
const aiImageNegativePrompt = stateRef('aiImageNegativePrompt', '')
const aiImageSources = stateRef('aiImageSources', [])
const aiImageLoading = stateRef('aiImageLoading', false)
const aiImageResult = stateRef('aiImageResult', null)
const aiImageHistoryLoading = stateRef('aiImageHistoryLoading', false)
const aiImageHistory = stateRef('aiImageHistory', [])
const aiImageDeletingTaskId = stateRef('aiImageDeletingTaskId', '')
const aiVideoMode = stateRef('aiVideoMode', 'text_to_video')
const aiVideoModel = stateRef('aiVideoModel', '')
const aiVideoModelOptions = stateRef('aiVideoModelOptions', [])
const aiVideoPrompt = stateRef('aiVideoPrompt', '')
const aiVideoNegativePrompt = stateRef('aiVideoNegativePrompt', '')
const aiVideoWidth = stateRef('aiVideoWidth', 720)
const aiVideoHeight = stateRef('aiVideoHeight', 1280)
const aiVideoResolutionOptions = stateRef('aiVideoResolutionOptions', [])
const aiVideoFrames = stateRef('aiVideoFrames', 121)
const aiVideoFrameRate = stateRef('aiVideoFrameRate', 24)
const aiVideoSourceUrl = stateRef('aiVideoSourceUrl', '')
const aiVideoSources = stateRef('aiVideoSources', [])
const aiVideoSourceUploading = stateRef('aiVideoSourceUploading', false)
const aiVideoSourceUploadProgress = stateRef('aiVideoSourceUploadProgress', 0)
const aiVideoLoading = stateRef('aiVideoLoading', false)
const aiVideoResult = stateRef('aiVideoResult', null)
const aiVideoHistoryLoading = stateRef('aiVideoHistoryLoading', false)
const aiVideoHistory = stateRef('aiVideoHistory', [])
const aiVideoDeletingTaskId = stateRef('aiVideoDeletingTaskId', '')

const closeAiPanel = actionRef('closeAiPanel')
const openAiPanel = actionRef('openAiPanel')
const runAiWorkspaceChat = actionRef('runAiWorkspaceChat')
const resetAiWorkspaceChat = actionRef('resetAiWorkspaceChat')
const setChatPrompt = actionRef('setChatPrompt')
const loadAiConversations = actionRef('loadAiConversations')
const selectAiConversation = actionRef('selectAiConversation')
const startNewAiConversation = actionRef('startNewAiConversation')
const deleteCurrentAiConversation = actionRef('deleteCurrentAiConversation')
const ensureAiMediaModelsLoaded = actionRef('ensureAiMediaModelsLoaded')
const handleAiImageFiles = actionRef('handleAiImageFiles')
const removeAiImageSource = actionRef('removeAiImageSource')
const runAiImage = actionRef('runAiImage')
const pollAiImageStatus = actionRef('pollAiImageStatus')
const formatAiVideoTimestamp = actionRef('formatAiVideoTimestamp')
const insertGeneratedImageBlock = actionRef('insertGeneratedImageBlock')
const loadAiImageHistory = actionRef('loadAiImageHistory')
const restoreAiImageTask = actionRef('restoreAiImageTask')
const deleteAiImageHistory = actionRef('deleteAiImageHistory')
const getAiImageModeLabel = actionRef('getAiImageModeLabel')
const handleAiVideoUploadFiles = actionRef('handleAiVideoUploadFiles')
const appendAiVideoSourceUrl = actionRef('appendAiVideoSourceUrl')
const removeAiVideoSource = actionRef('removeAiVideoSource')
const setAiVideoResolution = actionRef('setAiVideoResolution')
const runAiVideo = actionRef('runAiVideo')
const pollAiVideoStatus = actionRef('pollAiVideoStatus')
const insertGeneratedVideoBlock = actionRef('insertGeneratedVideoBlock')
const loadAiVideoHistory = actionRef('loadAiVideoHistory')
const restoreAiVideoTask = actionRef('restoreAiVideoTask')
const deleteAiVideoHistory = actionRef('deleteAiVideoHistory')
const getAiVideoModeLabel = actionRef('getAiVideoModeLabel')
const isAiCoolingDown = actionRef('isAiCoolingDown')
const getAiActionButtonText = actionRef('getAiActionButtonText')

const selectTab = (tab) => {
  emit('tab-change', tab)
}

const formatConversationTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>
<style scoped>
.ai-panel {
  position: sticky;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  height: calc(100vh - 7.3rem);
  min-height: 38rem;
  max-height: calc(100vh - 7.3rem);
  top: 6.3rem;
  overflow: hidden;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 1.35rem;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.2);
  padding: 1.25rem;
  padding-bottom: 4rem;
}

.ai-workspace-inline {
  align-self: start;
  padding: 1.15rem;
}

.dark .ai-panel {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(9, 9, 11, 0.98);
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.5);
}

.ai-panel-new-chat {
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 9999px;
  background: transparent;
  color: rgb(82 82 91);
  font-size: 0.72rem;
  padding: 0.5rem 0.7rem;
}

.dark .ai-panel-new-chat {
  border-color: rgba(63, 63, 70, 0.95);
  color: rgb(212 212 216);
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

.ai-conversation-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.7rem;
  margin-top: 0.85rem;
}

.ai-conversation-select {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.32rem;
}

.ai-conversation-select span {
  color: rgb(113 113 122);
  font-size: 0.66rem;
  font-weight: 700;
}

.ai-conversation-select select {
  width: 100%;
  min-width: 0;
  border: 1px solid rgba(228 228 231, 0.95);
  border-radius: 0.75rem;
  background: rgba(250 250 250, 0.96);
  color: rgb(39 39 42);
  font-size: 0.76rem;
  outline: none;
  padding: 0.58rem 0.7rem;
}

.ai-conversation-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.4rem;
}

.ai-conversation-action,
.ai-conversation-delete {
  border: 1px solid rgba(228 228 231, 0.95);
  border-radius: 9999px;
  background: rgba(250 250 250, 0.96);
  color: rgb(63 63 70);
  font-size: 0.7rem;
  padding: 0.55rem 0.7rem;
}

.ai-conversation-delete {
  color: rgb(185 28 28);
}

.ai-conversation-action:disabled,
.ai-conversation-delete:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dark .ai-conversation-select select,
.dark .ai-conversation-action,
.dark .ai-conversation-delete {
  border-color: rgba(63 63 70, 0.95);
  background: rgba(24 24 27, 0.96);
  color: rgb(228 228 231);
}

.dark .ai-conversation-delete {
  color: rgb(252 165 165);
}

.ai-model-switch {
  position: absolute;
  right: 1rem;
  bottom: 0.9rem;
  z-index: 5;
  display: inline-flex;
  max-width: min(72%, 15rem);
  gap: 0.4rem;
  align-items: center;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.96);
  padding: 0.3rem 0.35rem 0.3rem 0.65rem;
  box-shadow: 0 12px 30px rgba(24, 24, 27, 0.1);
  backdrop-filter: blur(12px);
}

.ai-model-switch span {
  color: rgb(113 113 122);
  font-size: 0.68rem;
  font-weight: 700;
}

.ai-model-switch select {
  min-width: 0;
  width: 10rem;
  border: 0;
  border-radius: 9999px;
  background: transparent;
  color: rgb(24 24 27);
  font-size: 0.74rem;
  outline: none;
  padding: 0.35rem 0.45rem;
}

.ai-model-switch small {
  display: none;
}

.dark .ai-model-switch {
  border-color: rgba(39, 39, 42, 0.95);
  background: rgba(24, 24, 27, 0.94);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
}

.dark .ai-model-switch select {
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
  flex: 1;
  min-height: 0;
  padding-top: 0.25rem;
  padding-bottom: 3.6rem;
  overflow-y: auto;
  padding-right: 0.2rem;
}

.ai-chat-layout {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.8rem;
  padding-bottom: 0.35rem;
}

.ai-chat-context-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  border: 1px solid rgba(228 228 231, 0.9);
  border-radius: 0.85rem;
  background: rgba(250 250 250, 0.72);
  padding: 0.55rem 0.7rem;
}

.ai-chat-context-bar > div {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.ai-chat-context-bar strong {
  max-width: 12rem;
  overflow: hidden;
  color: rgb(39 39 42);
  font-size: 0.76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-chat-context-bar > div > span:last-child {
  color: rgb(113 113 122);
  font-size: 0.68rem;
}

.ai-chat-context-label {
  color: rgb(113 113 122);
  font-size: 0.66rem;
  font-weight: 700;
}

.ai-chat-context-bar button {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: rgb(82 82 91);
  font-size: 0.7rem;
}

.dark .ai-chat-context-bar {
  border-color: rgba(63 63 70, 0.9);
  background: rgba(24 24 27, 0.72);
}

.dark .ai-chat-context-bar strong,
.dark .ai-chat-context-bar button {
  color: rgb(244 244 245);
}

.ai-chat-context-detail {
  overflow: hidden;
  border: 1px solid rgba(228 228 231, 0.9);
  border-radius: 0.85rem;
  background: rgba(244 244 245, 0.62);
  padding: 0.65rem 0.7rem;
}

.ai-chat-context-detail-head {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  color: rgb(113 113 122);
  font-size: 0.66rem;
}

.ai-chat-context-blocks {
  display: grid;
  gap: 0.35rem;
  max-height: 9rem;
  margin-top: 0.55rem;
  overflow: auto;
}

.ai-chat-context-blocks > div {
  display: flex;
  gap: 0.45rem;
  color: rgb(63 63 70);
  font-size: 0.72rem;
  line-height: 1.45;
}

.ai-chat-context-blocks span {
  width: 1.2rem;
  flex: 0 0 auto;
  color: rgb(161 161 170);
  text-align: right;
}

.ai-chat-context-blocks p {
  min-width: 0;
  margin: 0;
}

.ai-chat-context-empty {
  margin-top: 0.55rem;
  color: rgb(113 113 122);
  font-size: 0.72rem;
}

.dark .ai-chat-context-detail {
  border-color: rgba(63 63 70, 0.9);
  background: rgba(39 39 42, 0.72);
}

.dark .ai-chat-context-blocks > div {
  color: rgb(228 228 231);
}

.ai-chat-messages {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 0.3rem 0.1rem 0.5rem;
}

.ai-chat-welcome {
  display: grid;
  align-content: end;
  min-height: 100%;
  padding: 1rem 0.4rem 1.5rem;
}

.ai-chat-avatar {
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border-radius: 0.75rem;
  background: rgb(24 24 27);
  color: white;
  font-size: 0.72rem;
  font-weight: 800;
}

.ai-chat-welcome h3 {
  margin-top: 0.9rem;
  color: rgb(24 24 27);
  font-size: 1.15rem;
  font-weight: 750;
  letter-spacing: -0.03em;
}

.dark .ai-chat-welcome h3 {
  color: white;
}

.ai-chat-welcome p {
  max-width: 20rem;
  margin-top: 0.45rem;
  color: rgb(113 113 122);
  font-size: 0.8rem;
  line-height: 1.65;
}

.ai-chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 1rem;
}

.ai-chat-suggestions button {
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 9999px;
  background: rgba(250, 250, 250, 0.92);
  color: rgb(82 82 91);
  font-size: 0.72rem;
  padding: 0.5rem 0.7rem;
}

.dark .ai-chat-suggestions button {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(24, 24, 27, 0.92);
  color: rgb(228 228 231);
}

.ai-chat-message {
  display: grid;
  gap: 0.32rem;
  max-width: 92%;
  margin: 0.8rem 0;
  border-radius: 1rem;
  padding: 0.7rem 0.8rem;
}

.ai-chat-message-user {
  margin-left: auto;
  background: rgb(24 24 27);
  color: white;
}

.ai-chat-message-assistant {
  margin-right: auto;
  border: 1px solid rgba(228, 228, 231, 0.9);
  background: rgba(250, 250, 250, 0.86);
  color: rgb(39 39 42);
}

.dark .ai-chat-message-assistant {
  border-color: rgba(63, 63, 70, 0.9);
  background: rgba(24, 24, 27, 0.86);
  color: rgb(244 244 245);
}

.ai-chat-message-role {
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  opacity: 0.62;
  text-transform: uppercase;
}

.ai-chat-message-content {
  white-space: pre-wrap;
  font-size: 0.82rem;
  line-height: 1.7;
}

.ai-chat-message-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: rgb(161 161 170);
  font-size: 0.62rem;
}

.ai-chat-typing {
  color: rgb(113 113 122);
  font-size: 0.8rem;
}

.ai-chat-composer {
  flex-shrink: 0;
  margin-bottom: 3.2rem;
  border: 1px solid rgba(228, 228, 231, 0.95);
  border-radius: 1rem;
  background: rgba(250, 250, 250, 0.9);
  padding: 0.65rem;
}

.dark .ai-chat-composer {
  border-color: rgba(63, 63, 70, 0.95);
  background: rgba(24, 24, 27, 0.92);
}

.ai-chat-composer textarea {
  display: block;
  width: 100%;
  resize: none;
  border: 0;
  background: transparent;
  color: rgb(24 24 27);
  font-size: 0.82rem;
  line-height: 1.6;
  outline: none;
}

.dark .ai-chat-composer textarea {
  color: white;
}

.ai-chat-composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: 0.45rem;
}

.ai-chat-composer-footer span {
  color: rgb(161 161 170);
  font-size: 0.65rem;
}

.ai-chat-composer-footer button {
  display: grid;
  width: 1.9rem;
  height: 1.9rem;
  place-items: center;
  border: 0;
  border-radius: 0.6rem;
  background: rgb(24 24 27);
  color: white;
  font-size: 1rem;
  font-weight: 800;
}

.ai-chat-composer-footer button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.dark .ai-chat-composer-footer button {
  background: white;
  color: rgb(24 24 27);
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
  .ai-panel {
    position: fixed;
    right: 0.65rem;
    bottom: calc(5.65rem + env(safe-area-inset-bottom, 0px));
    left: 0.65rem;
    z-index: 58;
    width: auto;
    height: min(76dvh, 44rem);
    min-height: 26rem;
    max-height: calc(100dvh - 7.4rem);
    border-radius: 1.35rem;
    padding: 0.95rem;
    padding-bottom: 0.95rem;
    box-shadow: 0 22px 60px rgba(24, 24, 27, 0.22);
  }

  .ai-panel-header {
    align-items: flex-start;
    gap: 0.8rem;
  }

  .ai-panel-header > div:first-child p {
    font-size: 0.75rem;
    line-height: 1.55;
  }

  .ai-conversation-toolbar {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.55rem;
    margin-top: 0.7rem;
  }

  .ai-conversation-actions {
    justify-content: flex-start;
  }

  .ai-panel-tabs {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .ai-panel-tab,
  .ai-mode-chip {
    min-height: 2.25rem;
    padding-inline: 0.75rem;
  }

  .ai-model-switch {
    right: 0.85rem;
    bottom: 0.75rem;
    max-width: calc(100% - 1.7rem);
  }

  .ai-model-switch select {
    width: min(48vw, 10rem);
  }

  .ai-panel-body {
    padding-bottom: 3.4rem;
  }

  .ai-chat-context-bar {
    align-items: flex-start;
  }

  .ai-chat-context-bar > div {
    display: grid;
    gap: 0.26rem;
  }

  .ai-chat-context-bar strong {
    max-width: 58vw;
  }

  .ai-chat-welcome {
    min-height: 16rem;
    padding: 0.7rem 0.25rem 1rem;
  }

  .ai-chat-message {
    max-width: 96%;
  }

  .ai-chat-composer {
    margin-bottom: 3rem;
    border-radius: 1rem;
  }

  .ai-chat-composer-footer span {
    display: none;
  }

  .ai-panel-input,
  .ai-panel-textarea {
    border-radius: 1rem;
    font-size: 0.86rem;
    padding: 0.78rem 0.85rem;
  }

  .ai-result-card {
    border-radius: 1.1rem;
    padding: 0.85rem;
  }

  .ai-source-grid,
  .ai-generated-grid {
    grid-template-columns: 1fr;
  }

}


</style>
