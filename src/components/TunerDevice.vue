<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isListening: boolean
  note: string
  cents: number // -50 to +50
  frequency: number
}>()

defineEmits(['toggle'])

// Determine color based on cents out of tune
const colorTheme = computed(() => {
  if (!props.isListening || !props.note) return 'var(--text-muted)'
  const absCents = Math.abs(props.cents)
  if (absCents <= 5) return 'var(--accent-tune)'
  if (props.cents < 0) return 'var(--accent-flat)'
  return 'var(--accent-sharp)'
})

// Calculate needle rotation (-45deg to +45deg for -50 to +50 cents)
const needleRotation = computed(() => {
  if (!props.isListening || !props.note) return 0
  // Clamp between -50 and 50
  const clampedCents = Math.max(-50, Math.min(50, props.cents))
  return (clampedCents / 50) * 60 // Max rotation 60 degrees either side
})
</script>

<template>
  <div class="tuner-container glass-panel">
    <header class="tuner-header">
      <h1 class="text-gradient">Guitarist</h1>
      <div class="status-indicator">
        <span class="dot" :class="{ 'active': isListening }"></span>
        <span class="status-text">{{ isListening ? 'Listening...' : 'Ready' }}</span>
      </div>
    </header>

    <main class="tuner-display">
      <div class="dial-wrapper">
        <svg viewBox="0 0 200 120" class="dial-svg">
          <!-- Background Arc -->
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--surface-border)" stroke-width="8" stroke-linecap="round" />
          
          <!-- Center Tick -->
          <line x1="100" y1="15" x2="100" y2="25" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" />
          
          <!-- Needle -->
          <g class="needle-group" :style="{ transform: `rotate(${needleRotation}deg)`, transformOrigin: '100px 100px', transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)' }">
            <line x1="100" y1="100" x2="100" y2="20" :stroke="colorTheme" stroke-width="4" stroke-linecap="round" style="transition: stroke 0.3s ease" />
            <circle cx="100" cy="100" r="10" :fill="colorTheme" style="transition: fill 0.3s ease" />
            <circle cx="100" cy="100" r="4" fill="#0f172a" />
          </g>
        </svg>

        <div class="note-info">
          <div class="note-symbol" :style="{ color: colorTheme, textShadow: isListening ? `0 0 20px ${colorTheme}80` : 'none' }">
            {{ note || '--' }}
          </div>
          <div class="cents-bubble" v-if="isListening && Math.abs(cents) > 1" :style="{ backgroundColor: `${colorTheme}30`, color: colorTheme }">
            {{ cents > 0 ? '+' : '' }}{{ cents.toFixed(0) }}
          </div>
          <div class="cents-bubble perfect" v-else-if="isListening && Math.abs(cents) <= 1" :style="{ backgroundColor: `${colorTheme}30`, color: colorTheme }">
            PERFECT
          </div>
        </div>
      </div>

      <div class="frequency-display">
        <span class="freq-value">{{ frequency ? frequency.toFixed(1) : '---.-' }}</span>
        <span class="freq-unit">Hz</span>
      </div>
    </main>

    <footer class="tuner-controls">
      <button class="btn-primary" :class="{ 'btn-active': isListening }" @click="$emit('toggle')">
        <span class="btn-icon">🎙️</span>
        {{ isListening ? 'Stop Tuning' : 'Start Tuning' }}
      </button>
    </footer>
  </div>
</template>

<style scoped>
.tuner-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.tuner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: all 0.3s ease;
}

.dot.active {
  background: var(--accent-tune);
  box-shadow: 0 0 10px var(--accent-tune);
  animation: pulse 1.5s infinite;
}

.status-text {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

.tuner-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.dial-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 1.2;
}

.dial-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.note-info {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.note-symbol {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
  transition: all 0.2s ease;
  font-variant-numeric: tabular-nums;
}

.cents-bubble {
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.frequency-display {
  text-align: center;
  margin-top: 1rem;
}

.freq-value {
  font-size: 2rem;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.05em;
  color: var(--text-main);
}

.freq-unit {
  font-size: 1rem;
  color: var(--text-muted);
  margin-left: 0.25rem;
}

.tuner-controls {
  display: flex;
  justify-content: center;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-active {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  color: #10b981;
}

.btn-active:hover {
  background: rgba(16, 185, 129, 0.3);
}
</style>
