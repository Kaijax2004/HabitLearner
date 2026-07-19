<template>
  <div class="brand-elements">
    <!-- 品牌渐变装饰 -->
    <div class="brand-gradient-decoration"></div>
    
    <!-- 浮动粒子效果 -->
    <div class="floating-particles">
      <div 
        v-for="i in 6" 
        :key="i" 
        class="particle"
        :style="{
          '--delay': `${i * 0.5}s`,
          '--duration': `${3 + i * 0.5}s`,
          '--size': `${4 + i * 2}px`,
          '--opacity': `${0.1 + i * 0.05}`
        }"
      ></div>
    </div>
    
    <!-- 品牌光效 -->
    <div class="brand-glow"></div>
  </div>
</template>

<script setup>
// 品牌特色视觉元素组件
</script>

<style scoped>
.brand-elements {
  position: relative;
  pointer-events: none;
}

/* 品牌渐变装饰 */
.brand-gradient-decoration {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.1) 0%, 
    rgba(147, 51, 234, 0.1) 50%, 
    rgba(236, 72, 153, 0.1) 100%);
  border-radius: 50%;
  filter: blur(40px);
  animation: float 6s ease-in-out infinite;
}

/* 浮动粒子效果 */
.floating-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  opacity: var(--opacity);
  animation: floatParticle var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
}

.particle:nth-child(1) { top: 20%; left: 10%; }
.particle:nth-child(2) { top: 60%; left: 80%; }
.particle:nth-child(3) { top: 30%; left: 70%; }
.particle:nth-child(4) { top: 80%; left: 20%; }
.particle:nth-child(5) { top: 10%; left: 50%; }
.particle:nth-child(6) { top: 70%; left: 40%; }

/* 品牌光效 */
.brand-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, 
    rgba(59, 130, 246, 0.05) 0%, 
    rgba(59, 130, 246, 0.02) 50%, 
    transparent 100%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: pulseGlow 4s ease-in-out infinite;
}

/* 动画定义 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes floatParticle {
  0%, 100% {
    transform: translateY(0px) translateX(0px) scale(1);
    opacity: var(--opacity);
  }
  25% {
    transform: translateY(-10px) translateX(5px) scale(1.1);
    opacity: calc(var(--opacity) * 1.5);
  }
  50% {
    transform: translateY(-20px) translateX(-5px) scale(0.9);
    opacity: var(--opacity);
  }
  75% {
    transform: translateY(-10px) translateX(10px) scale(1.05);
    opacity: calc(var(--opacity) * 1.2);
  }
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .brand-gradient-decoration {
    width: 150px;
    height: 150px;
    top: -30px;
    right: -30px;
  }
  
  .brand-glow {
    width: 200px;
    height: 200px;
  }
  
  .particle {
    --size: calc(var(--size) * 0.8);
  }
}

/* 减少动画（用户偏好） */
@media (prefers-reduced-motion: reduce) {
  .brand-gradient-decoration,
  .particle,
  .brand-glow {
    animation: none;
  }
}
</style>
