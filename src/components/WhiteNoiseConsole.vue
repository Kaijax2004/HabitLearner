<template>
  <section :class="rootClass">
    <div class="flex w-full flex-col items-stretch gap-5">
      <div class="flex w-full flex-wrap items-center justify-between gap-3 text-left">
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium uppercase tracking-[0.24em]" :class="mode === 'focus' ? 'text-white/45' : 'text-zinc-500 dark:text-zinc-400'">
            {{ mode === 'focus' ? '白噪音预设' : '白噪音控制台' }}
          </p>
          <p class="mt-1 text-sm" :class="mode === 'focus' ? 'text-white/65' : 'text-zinc-500 dark:text-zinc-400'">
            {{ mode === 'focus'
              ? '全屏模式只保留已保存的预设，适合一键进入专注。'
              : '按分类浏览本地声场，收藏常用组合，并保存成你的专属混音预设。' }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="mode === 'workspace'"
            type="button"
            class="rounded-full border px-3 py-1.5 text-xs font-medium transition"
            :class="buttonGhostClass"
            :disabled="!activeTrackIds.length"
            @click="stopAll"
          >
            全部停止
          </button>
          <span
            class="rounded-full px-3 py-1.5 text-xs font-medium"
            :class="mode === 'focus' ? 'bg-white/10 text-white/75' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300'"
          >
            {{ ambientSoundCatalog.length }} 类 / {{ ambientSoundCount }} 声场
          </span>
        </div>
      </div>

      <div v-if="mode === 'workspace'" class="w-full space-y-4">
        <div class="rounded-[28px] border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-medium text-zinc-950 dark:text-white">总控面板</p>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">主音量、叠加数量和播放状态集中在这里。</p>
            </div>
            <div class="grid shrink-0 grid-cols-3 gap-2">
              <div class="rounded-[18px] border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
                <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">叠加</p>
                <p class="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">{{ activeTrackIds.length }}</p>
              </div>
              <div class="rounded-[18px] border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
                <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">收藏</p>
                <p class="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">{{ favoriteSounds.length }}</p>
              </div>
              <div class="rounded-[18px] border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
                <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">最近</p>
                <p class="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">{{ recentSounds.length }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-[22px] border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">主音量</p>
                <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">统一控制当前所有正在播放的声场。</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-zinc-900 dark:text-white">{{ masterVolume }}%</span>
                <button
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs font-medium transition"
                  :class="buttonGhostClass"
                  :disabled="!activeTrackIds.length"
                  @click="stopAll"
                >
                  全部停止
                </button>
              </div>
            </div>
            <input v-model.number="masterVolume" type="range" min="0" max="100" class="mt-3 w-full accent-zinc-900 dark:accent-white" @input="syncAllVolumes" />
          </div>
        </div>

        <div class="rounded-[28px] border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="min-w-0">
              <p class="text-sm font-medium text-zinc-950 dark:text-white">快速访问</p>
              <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">收藏、最近和分类切换都放在这里，操作更顺手。</p>
            </div>
            <div class="flex flex-wrap justify-end gap-2">
              <button
                v-for="item in browseModes"
                :key="item.id"
                type="button"
                class="rounded-full border px-3 py-1.5 text-xs font-medium transition"
                :class="browseMode === item.id ? selectedChipClass : chipClass"
                @click="browseMode = item.id"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <label class="mt-4 flex min-w-0 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            <span>搜索</span>
            <input v-model="searchQuery" type="text" class="w-full bg-transparent outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500" placeholder="声音名称" />
          </label>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="rounded-[20px] border border-zinc-200/80 bg-zinc-50/90 p-3 dark:border-zinc-800 dark:bg-zinc-900/70">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium text-zinc-950 dark:text-white">收藏常用声场</p>
                <button v-if="favoriteSounds.length" type="button" class="text-xs font-medium text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-300" @click="clearFavorites">
                  清空
                </button>
              </div>
              <div v-if="favoriteSounds.length" class="mt-3 flex flex-wrap gap-2">
                <button
                  v-for="sound in favoriteSounds"
                  :key="sound.id"
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs font-medium transition"
                  :class="isActive(sound.id) ? selectedChipClass : chipClass"
                  @click="toggleSound(sound.id)"
                >
                  {{ getSoundDisplayName(sound) }}
                </button>
              </div>
              <div v-else class="mt-3 rounded-[16px] border border-dashed border-zinc-200 bg-zinc-50 px-3 py-5 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
                收藏几个高频声场，后面切换会更快。
              </div>
            </div>

            <div class="rounded-[20px] border border-zinc-200/80 bg-zinc-50/90 p-3 dark:border-zinc-800 dark:bg-zinc-900/70">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-medium text-zinc-950 dark:text-white">最近使用</p>
                <button v-if="recentSounds.length" type="button" class="text-xs font-medium text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-300" @click="clearRecentSounds">
                  清空
                </button>
              </div>
              <div v-if="recentSounds.length" class="mt-3 flex flex-wrap gap-2">
                <button
                  v-for="sound in recentSounds"
                  :key="sound.id"
                  type="button"
                  class="rounded-full border px-3 py-1.5 text-xs font-medium transition"
                  :class="isActive(sound.id) ? selectedChipClass : chipClass"
                  @click="toggleSound(sound.id)"
                >
                  {{ getSoundDisplayName(sound) }}
                </button>
              </div>
              <div v-else class="mt-3 rounded-[16px] border border-dashed border-zinc-200 bg-zinc-50 px-3 py-5 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
                你刚刚播放过的声场会自动留在这里。
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-4 xl:grid-cols-2">
          <div class="space-y-4">
            <div class="rounded-[24px] border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
              <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p class="text-sm font-medium text-zinc-950 dark:text-white">声场浏览</p>
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ browseDescription }}</p>
                </div>
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">{{ browseTitle }}</p>
              </div>

              <div v-if="browseMode === 'category'" class="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-1">
                <button
                  v-for="category in ambientSoundCatalog"
                  :key="category.id"
                  type="button"
                  class="rounded-full border px-4 py-2 text-sm font-medium transition"
                  :class="selectedCategoryId === category.id ? selectedChipClass : chipClass"
                  @click="selectedCategoryId = category.id"
                >
                  {{ getCategoryMeta(category.id).titleZh }}
                  <span class="ml-1 opacity-70">{{ category.sounds.length }}</span>
                </button>
              </div>

              <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div
                  v-for="sound in visibleSounds"
                  :key="sound.id"
                  class="group relative flex min-h-[220px] flex-col overflow-hidden rounded-[28px] border p-4 text-left transition"
                  :class="isActive(sound.id) ? activeSoundClass : soundClass"
                  role="button"
                  tabindex="0"
                  @click="toggleSound(sound.id)"
                  @keydown.enter.prevent="toggleSound(sound.id)"
                  @keydown.space.prevent="toggleSound(sound.id)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <span
                      class="rounded-full px-2.5 py-1 text-[11px] font-medium transition"
                      :class="isActive(sound.id)
                        ? 'bg-zinc-950/88 text-white dark:bg-white/15 dark:text-white'
                        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'"
                    >
                      {{ isActive(sound.id) ? '已加入混音' : '点击加入' }}
                    </span>
                    <button
                      type="button"
                      class="rounded-full border px-2.5 py-1 text-[11px] font-medium transition"
                      :class="isFavoriteSound(sound.id) ? favoriteActiveClass : favoriteClass"
                      @click.stop="toggleFavoriteSound(sound.id)"
                    >
                      {{ isFavoriteSound(sound.id) ? '★' : '☆' }}
                    </button>
                  </div>

                  <div class="flex flex-1 flex-col items-center justify-center text-center">
                    <div
                      class="flex h-16 w-16 items-center justify-center rounded-[22px] border shadow-sm transition"
                      :class="isActive(sound.id) ? activeIconWrapClass : iconWrapClass"
                    >
                      <AmbientSoundIcon :sound-id="sound.id" :category-id="sound.categoryId" />
                    </div>
                    <p class="mt-4 line-clamp-2 text-base font-semibold leading-6">{{ getSoundDisplayName(sound) }}</p>
                  </div>

                  <div class="mt-4 space-y-3" @click.stop>
                    <div class="flex items-center justify-between gap-3 text-xs">
                      <span :class="isActive(sound.id) ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-400'">
                        {{ isActive(sound.id) ? '正在播放' : '独立音量' }}
                      </span>
                      <span class="text-zinc-500 dark:text-zinc-400">{{ trackVolumes[sound.id] }}%</span>
                    </div>
                    <input v-model.number="trackVolumes[sound.id]" type="range" min="0" max="100" class="w-full accent-zinc-900 dark:accent-white" @input="handleTrackVolume(sound.id, $event)" />
                  </div>
                </div>
              </div>

              <div v-if="!visibleSounds.length" class="mt-4 rounded-[24px] border border-dashed border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
                没有找到匹配的声场。
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="rounded-[24px] border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-zinc-950 dark:text-white">保存混音预设</p>
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">把当前组合保存成可复用的预设。</p>
                </div>
                <span class="text-xs text-zinc-500 dark:text-zinc-400">{{ presets.length }} 个</span>
              </div>

              <div class="mt-3 flex gap-2">
                <input
                  v-model="presetNameDraft"
                  type="text"
                  class="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                  placeholder="例如：深夜专注"
                />
                <button
                  type="button"
                  class="rounded-2xl px-4 py-3 text-sm font-medium text-white transition"
                  :class="saveButtonClass"
                  :disabled="!activeTrackIds.length"
                  @click="handleSavePreset"
                >
                  保存
                </button>
              </div>
            </div>

            <div class="rounded-[24px] border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-zinc-950 dark:text-white">当前混音</p>
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">点击声场卡片即可加入或移除。</p>
                </div>
                <button type="button" class="text-xs font-medium text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-300" :disabled="!activeTrackIds.length" @click="stopAll">
                  清空
                </button>
              </div>

              <div v-if="activeTracks.length" class="mt-4 space-y-3">
                <div v-for="sound in activeTracks" :key="sound.id" class="rounded-[20px] border border-zinc-200/80 bg-zinc-50/90 p-3 dark:border-zinc-800 dark:bg-zinc-900/70">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-zinc-950 dark:text-white">{{ getSoundDisplayName(sound) }}</p>
                      <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ getCategoryMeta(sound.categoryId).titleZh }}</p>
                    </div>
                    <button type="button" class="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition hover:border-red-200 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300" @click="stopSound(sound.id)">
                      移除
                    </button>
                  </div>
                  <div class="mt-3 flex items-center gap-3" @click.stop>
                    <input :value="trackVolumes[sound.id]" type="range" min="0" max="100" class="w-full accent-zinc-900 dark:accent-white" @input="handleTrackVolume(sound.id, $event)" />
                    <span class="w-11 text-right text-xs text-zinc-500 dark:text-zinc-400">{{ trackVolumes[sound.id] }}%</span>
                  </div>
                </div>
              </div>

              <div v-else class="mt-4 rounded-[20px] border border-dashed border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
                先选几个声场，混音区会在这里显示。
              </div>
            </div>

            <div class="rounded-[24px] border border-zinc-200/80 bg-white/85 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-zinc-950 dark:text-white">已保存预设</p>
                  <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">支持重命名、覆盖保存和复制。</p>
                </div>
                <button type="button" class="text-xs font-medium text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-300" @click="refreshPresetsFromStorage">
                  刷新
                </button>
              </div>

              <div v-if="presets.length" class="mt-4 space-y-3">
                <div
                  v-for="preset in presets"
                  :key="preset.id"
                  class="rounded-[22px] border p-4 transition"
                  :class="preset.id === activePresetId ? 'border-emerald-300/40 bg-emerald-50/70 dark:border-emerald-400/25 dark:bg-emerald-500/10' : 'border-zinc-200/80 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60'"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-zinc-950 dark:text-white">{{ preset.name }}</p>
                      <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ preset.tracks.length }} 条声场 · 主音量 {{ preset.masterVolume }}%</p>
                    </div>
                    <span class="rounded-full px-2.5 py-1 text-[11px] font-medium" :class="preset.id === activePresetId ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'">
                      {{ preset.id === activePresetId ? '当前' : '预设' }}
                    </span>
                  </div>

                  <div v-if="editingPresetId === preset.id" class="mt-3 flex gap-2">
                    <input
                      v-model="editingPresetName"
                      type="text"
                      class="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                    />
                    <button type="button" class="rounded-2xl bg-zinc-950 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950" @click="confirmPresetRename(preset.id)">
                      保存
                    </button>
                    <button type="button" class="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300" @click="cancelPresetRename">
                      取消
                    </button>
                  </div>

                  <div v-if="preset.tracks.length" class="mt-3 flex flex-wrap gap-2">
                    <span v-for="track in preset.tracks.slice(0, 4)" :key="track.id" class="rounded-full bg-white px-2.5 py-1 text-[11px] text-zinc-500 shadow-sm dark:bg-zinc-950 dark:text-zinc-300">
                      {{ getSoundDisplayName(getSoundById(track.id)) || track.id }}
                    </span>
                    <span v-if="preset.tracks.length > 4" class="rounded-full bg-white px-2.5 py-1 text-[11px] text-zinc-500 shadow-sm dark:bg-zinc-950 dark:text-zinc-300">
                      +{{ preset.tracks.length - 4 }}
                    </span>
                  </div>

                  <div class="mt-4 flex flex-wrap gap-2">
                    <button type="button" class="rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100" @click="handleApplyPreset(preset.id)">
                      应用
                    </button>
                    <button type="button" class="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300" @click="startPresetRename(preset)">
                      重命名
                    </button>
                    <button type="button" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-100" :disabled="!activeTrackIds.length" @click="handleOverwritePreset(preset.id)">
                      覆盖保存
                    </button>
                    <button type="button" class="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300" @click="handleDuplicatePreset(preset.id)">
                      复制预设
                    </button>
                    <button type="button" class="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-red-200 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300" @click="handleDeletePreset(preset.id)">
                      删除
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="mt-4 rounded-[20px] border border-dashed border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-400">
                先保存一个混音预设，之后全屏模式会直接读取这里。
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-white">当前混音</p>
              <p class="mt-1 text-xs text-white/55">专注模式下只保留已保存预设的快速切换。</p>
            </div>
            <span class="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/75">{{ activeTrackIds.length }} 轨</span>
          </div>

          <div class="mt-4 rounded-[20px] border border-white/10 bg-white/5 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.18em] text-white/45">总音量</p>
                <p class="mt-1 text-sm text-white/55">控制当前专注区所有声音的整体大小。</p>
              </div>
              <span class="text-sm font-medium text-white">{{ masterVolume }}%</span>
            </div>
            <input v-model.number="masterVolume" type="range" min="0" max="100" class="mt-3 w-full accent-white" @input="syncAllVolumes" />
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-full border border-white/14 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="!activeTrackIds.length"
              @click="togglePlayback"
            >
              {{ isPlaybackPaused ? '继续声音' : '暂停声音' }}
            </button>
            <button
              type="button"
              class="rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white/78 transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-45"
              :disabled="!activeTrackIds.length"
              @click="stopAll"
            >
              全部停止
            </button>
          </div>
        </div>

        <div class="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div v-if="presets.length" class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="preset in presets"
              :key="preset.id"
              type="button"
              class="rounded-[22px] border p-4 text-left transition"
              :class="preset.id === activePresetId ? 'border-emerald-300/35 bg-emerald-400/12 text-white' : 'border-white/10 bg-white/5 text-white/85 hover:bg-white/10'"
              @click="handleApplyPreset(preset.id)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">{{ preset.name }}</p>
                  <p class="mt-1 text-xs" :class="preset.id === activePresetId ? 'text-emerald-100/70' : 'text-white/45'">
                    {{ preset.tracks.length }} 条声场 · {{ preset.masterVolume }}%
                  </p>
                </div>
                <span class="rounded-full px-2.5 py-1 text-[11px]" :class="preset.id === activePresetId ? 'bg-emerald-300/20 text-emerald-100' : 'bg-white/10 text-white/60'">
                  {{ preset.id === activePresetId ? '已应用' : '可用' }}
                </span>
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                <span v-for="track in preset.tracks.slice(0, 3)" :key="track.id" class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">
                  {{ getSoundDisplayName(getSoundById(track.id)) || track.id }}
                </span>
                <span v-if="preset.tracks.length > 3" class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">
                  +{{ preset.tracks.length - 3 }}
                </span>
              </div>
            </button>
          </div>

          <div v-else class="rounded-[20px] border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/55">
            还没有保存预设。回到工作区先保存一个常用混音吧。
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import AmbientSoundIcon from './AmbientSoundIcon.vue'
import { ambientSoundCatalog, ambientSoundCount } from '@/data/ambientSounds.js'
import {
  getAmbientSoundCategoryDisplayMeta,
  getAmbientSoundDisplayMeta,
  getAmbientSoundDisplayName
} from '@/data/ambientSoundLabels.js'
import { useAmbientMixer } from '@/composables/useAmbientMixer.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'workspace',
    validator: (value) => ['workspace', 'focus'].includes(value)
  }
})

const { success, error } = useToast()
const {
  activePresetId,
  activeTrackIds,
  activeTracks,
  applyPreset,
  clearFavoriteSounds,
  clearRecentSounds,
  deletePreset,
  duplicatePreset,
  getFavoriteTracks,
  getRecentTracks,
  getSoundById,
  isFavoriteSound,
  isPlaybackPaused,
  masterVolume,
  overwritePreset,
  presetNameDraft,
  presets,
  refreshPresetsFromStorage,
  renamePreset,
  saveCurrentAsPreset,
  setTrackVolume,
  stopAll,
  stopSound,
  syncAllVolumes,
  togglePlayback,
  toggleFavoriteSound,
  toggleSound,
  trackVolumes
} = useAmbientMixer()

const selectedCategoryId = ref(ambientSoundCatalog[0]?.id || 'noise')
const browseMode = ref('category')
const searchQuery = ref('')
const editingPresetId = ref('')
const editingPresetName = ref('')

const isFocusMode = computed(() => props.mode === 'focus')
const allSounds = computed(() => ambientSoundCatalog.flatMap((category) => category.sounds))
const favoriteSounds = computed(() => getFavoriteTracks())
const recentSounds = computed(() => getRecentTracks())
const currentCategory = computed(() => ambientSoundCatalog.find((category) => category.id === selectedCategoryId.value) || ambientSoundCatalog[0] || null)
const currentCategoryMeta = computed(() => getAmbientSoundCategoryDisplayMeta(currentCategory.value?.id))
const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())

const browseModes = [
  { id: 'category', label: '分类' },
  { id: 'favorites', label: '收藏' },
  { id: 'recent', label: '最近' },
  { id: 'all', label: '全部' }
]

const browseTitle = computed(() => {
  switch (browseMode.value) {
    case 'favorites': return '收藏常用声场'
    case 'recent': return '最近使用'
    case 'all': return '全部声场'
    default: return '分类浏览'
  }
})

const browseDescription = computed(() => {
  switch (browseMode.value) {
    case 'favorites': return '把常用声场收藏起来，随时一键回到熟悉的混音。'
    case 'recent': return '这里会保留你最近用过的声场，方便快速续用。'
    case 'all': return '一次看到所有本地声场。'
    default: return currentCategoryMeta.value?.description || '按分类查看声场。'
  }
})

const visibleSounds = computed(() => {
  const query = normalizedQuery.value
  const source = query
    ? allSounds.value
    : browseMode.value === 'favorites'
      ? favoriteSounds.value
      : browseMode.value === 'recent'
        ? recentSounds.value
        : browseMode.value === 'all'
          ? allSounds.value
          : currentCategory.value?.sounds || []

  if (!query) return source

  return source.filter((sound) => {
    const meta = getAmbientSoundDisplayMeta(sound)
    return [meta.name, meta.categoryTitleZh, meta.categoryTitleEn, sound.label, sound.slug, sound.id]
      .some((value) => String(value || '').toLowerCase().includes(query))
  })
})

const rootClass = computed(() => {
  return isFocusMode.value
    ? 'rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.28)]'
    : 'rounded-[30px] border border-zinc-200/80 bg-white/90 p-5 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80'
})

const chipClass = 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600'
const selectedChipClass = 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950'
const buttonGhostClass = 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600'
const saveButtonClass = 'bg-zinc-950 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100'
const soundClass = 'border-zinc-200 bg-white/92 text-zinc-950 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/72 dark:text-white dark:hover:border-zinc-700'
const activeSoundClass = 'border-zinc-950 bg-zinc-950/96 text-white shadow-[0_18px_44px_rgba(24,24,27,0.16)] dark:border-white/16 dark:bg-white/[0.08] dark:text-white dark:shadow-[0_18px_44px_rgba(0,0,0,0.24)]'
const iconWrapClass = 'border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100'
const activeIconWrapClass = 'border-white/12 bg-white/8 text-white dark:border-white/14 dark:bg-white/10 dark:text-white'
const favoriteClass = 'border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
const favoriteActiveClass = 'border-zinc-300 bg-zinc-950 text-white dark:border-white/14 dark:bg-white/12 dark:text-white'
const getSoundDisplayName = (sound) => getAmbientSoundDisplayName(sound)
const getCategoryMeta = (categoryId) => getAmbientSoundCategoryDisplayMeta(categoryId)

function handleTrackVolume(soundId, event) {
  const value = Number(event?.target?.value ?? 0)
  setTrackVolume(soundId, value)
}

async function handleApplyPreset(presetId) {
  const preset = presets.value.find((item) => item.id === presetId)
  if (!preset) return

  const ok = await applyPreset(presetId)
  if (ok) {
    success(`已应用预设「${preset.name}」`)
  }
}

function handleDeletePreset(presetId) {
  const preset = presets.value.find((item) => item.id === presetId)
  deletePreset(presetId)
  if (preset) {
    success(`已删除预设「${preset.name}」`)
  }
}

function handleSavePreset() {
  const preset = saveCurrentAsPreset(presetNameDraft.value)
  if (!preset) {
    error('还没有可保存的混音', { description: '先选择几个声场，再保存预设。' })
    return
  }

  presetNameDraft.value = preset.name
  success(`已保存预设「${preset.name}」`)
}

function handleOverwritePreset(presetId) {
  const preset = overwritePreset(presetId)
  if (!preset) {
    error('无法覆盖保存', { description: '先播放几个声场，再覆盖到当前预设。' })
    return
  }

  success(`已覆盖预设「${preset.name}」`)
}

function handleDuplicatePreset(presetId) {
  const preset = presets.value.find((item) => item.id === presetId)
  if (!preset) return

  const copy = duplicatePreset(presetId)
  if (copy) {
    success(`已复制预设「${preset.name}」`)
  }
}

function startPresetRename(preset) {
  editingPresetId.value = preset.id
  editingPresetName.value = preset.name
}

function cancelPresetRename() {
  editingPresetId.value = ''
  editingPresetName.value = ''
}

function confirmPresetRename(presetId) {
  const preset = renamePreset(presetId, editingPresetName.value)
  if (!preset) {
    error('名称未更新', { description: '请输入一个有效的预设名称。' })
    return
  }

  success(`已重命名为「${preset.name}」`)
  cancelPresetRename()
}

function clearFavorites() {
  clearFavoriteSounds()
}

function isActive(soundId) {
  return activeTrackIds.value.includes(soundId)
}
</script>

