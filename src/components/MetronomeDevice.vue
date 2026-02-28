<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isPlaying: boolean
  bpm: number
  beatsPerMeasure: number
  currentBeat: number
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'update:bpm', val: number): void
  (e: 'update:beatsPerMeasure', val: number): void
}>()

const localBpm = computed({
  get: () => props.bpm,
  set: (val) => emit('update:bpm', val)
})

const incrementBpm = (amount: number) => {
  localBpm.value = Math.max(30, Math.min(300, localBpm.value + amount))
}

const tempoText = computed(() => {
  const b = props.bpm
  if (b < 60) return 'Largo'
  if (b < 76) return 'Adagio'
  if (b < 108) return 'Andante'
  if (b < 120) return 'Moderato'
  if (b < 156) return 'Allegro'
  if (b < 176) return 'Vivace'
  return 'Presto'
})
</script>

<template>
  <div class="metronome-container glass-panel">
    <header class="metronome-header">
      <h1 class="text-gradient">Metronome</h1>
      <div class="status-indicator">
        <span class="dot" :class="{ 'active': isPlaying }"></span>
      </div>
    </header>

    <main class="metronome-display">
      <!-- Tempo Display -->
      <div class="tempo-hero">
        <div class="tempo-value">{{ bpm }}</div>
        <div class="tempo-label">BPM</div>
      </div>
      <div class="tempo-name">{{ tempoText }}</div>

      <!-- Controls -->
      <div class="controls-row">
        <button class="btn-circle" @click="incrementBpm(-5)">-5</button>
        <button class="btn-circle" @click="incrementBpm(-1)">-1</button>
        
        <input 
          type="range" 
          v-model.number="localBpm" 
          min="30" max="300"
          class="bpm-slider" 
        />
        
        <button class="btn-circle" @click="incrementBpm(1)">+1</button>
        <button class="btn-circle" @click="incrementBpm(5)">+5</button>
      </div>

      <!-- Beat Visualizer -->
      <div class="beat-visualizer">
        <div 
          v-for="i in beatsPerMeasure" 
          :key="i"
          class="beat-dot"
          :class="{ 'active': isPlaying && currentBeat === i, 'accent': i === 1 }"
        ></div>
      </div>
    </main>

    <footer class="metronome-footer">
      <div class="time-signture">
        <span>Beats/Measure:</span>
        <select 
          :value="beatsPerMeasure" 
          @change="(e) => emit('update:beatsPerMeasure', Number((e.target as HTMLSelectElement).value))"
          class="glass-select"
        >
          <option v-for="n in [2,3,4,5,6,7,8,9,12]" :key="n" :value="n">{{ n }} / 4</option>
        </select>
      </div>
      
      <button class="btn-primary flex-grow" :class="{ 'btn-active': isPlaying }" @click="emit('toggle')">
        <span class="btn-icon">⏱️</span>
        {{ isPlaying ? 'Stop' : 'Start' }}
      </button>
    </footer>
  </div>
</template>

<style scoped>
.metronome-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.metronome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
}

.status-indicator .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-muted);
  display: inline-block;
  transition: background 0.1s linear;
}

.status-indicator .dot.active {
  background: var(--accent-tune);
  box-shadow: 0 0 15px var(--accent-tune);
}

.metronome-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.tempo-hero {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.tempo-value {
  font-size: 5rem;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.05em;
}

.tempo-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-muted);
}

.tempo-name {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--accent-tune);
  font-weight: 700;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.btn-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-circle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.btn-circle:active {
  transform: translateY(0);
}

.bpm-slider {
  flex-grow: 1;
  -webkit-appearance: none;
  background: transparent;
  height: 4px;
  border-radius: 2px;
  outline: none;
  background: rgba(255, 255, 255, 0.2);
}

.bpm-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent-tune);
  cursor: pointer;
  transition: transform 0.1s;
}

.bpm-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.beat-visualizer {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  height: 20px;
  align-items: center;
}

.beat-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.05s ease;
}

.beat-dot.active {
  transform: scale(1.3);
  background: var(--text-main);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.beat-dot.active.accent {
  background: var(--accent-tune);
  box-shadow: 0 0 15px var(--accent-tune);
}

.metronome-footer {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.time-signture {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-muted);
  font-weight: 500;
}

.glass-select {
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
}

.glass-select option {
  background: #1e293b;
  color: white;
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
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

.btn-active {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  color: #10b981;
}

.btn-active:hover {
  background: rgba(16, 185, 129, 0.3);
}

.flex-grow {
  width: 100%;
}
</style>
