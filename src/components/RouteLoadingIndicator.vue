<template>
  <Teleport to="body">
    <Transition name="route-progress">
      <div v-if="isRouteLoading" class="route-loading-layer" aria-live="polite">
        <div class="route-loading-line">
          <span></span>
        </div>
        <div class="route-loading-pill">
          <span class="route-loading-dot"></span>
          <span>{{ routeLoadingText }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useRouteLoading } from '@/composables/useRouteLoading'

const { isRouteLoading, routeLoadingText } = useRouteLoading()
</script>

<style scoped>
.route-loading-layer {
  pointer-events: none;
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 9998;
}

.route-loading-line {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  overflow: hidden;
  background: color-mix(in srgb, var(--workbench-border, #e4e4e7) 60%, transparent);
}

.route-loading-line span {
  display: block;
  height: 100%;
  width: 42%;
  border-radius: 999px;
  background: var(--workbench-accent, #18181b);
  animation: route-line 1.1s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.route-loading-pill {
  position: fixed;
  left: 50%;
  top: max(0.8rem, env(safe-area-inset-top));
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transform: translateX(-50%);
  border: 1px solid color-mix(in srgb, var(--workbench-border, #e4e4e7) 88%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--workbench-surface, #ffffff) 86%, transparent);
  box-shadow: 0 18px 50px rgba(24, 24, 27, 0.12);
  color: var(--workbench-text, #18181b);
  padding: 0.5rem 0.78rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  backdrop-filter: blur(16px);
}

.route-loading-dot {
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 999px;
  background: var(--workbench-accent, #18181b);
  animation: route-dot 0.9s ease-in-out infinite;
}

.route-progress-enter-active,
.route-progress-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.route-progress-enter-from,
.route-progress-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes route-line {
  0% { transform: translateX(-120%); }
  58% { transform: translateX(78%); }
  100% { transform: translateX(245%); }
}

@keyframes route-dot {
  0%, 100% { opacity: 0.42; transform: scale(0.86); }
  50% { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .route-loading-line span,
  .route-loading-dot {
    animation: none;
  }
}
</style>
