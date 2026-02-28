<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isPlaying: boolean
  bpm: number
  selectedSong: string
  songs: Array<{ key: string; name: string; group: 'Songs' | 'Arpeggio' }>
  recommendedBpm: number
  isLoop: boolean
  currentStep: number
  totalSteps: number
  currentNote: string
  currentChord: string
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'update:bpm', value: number): void
  (e: 'update:selectedSong', value: string): void
  (e: 'update:isLoop', value: boolean): void
}>()

const localBpm = computed({
  get: () => props.bpm,
  set: (value) => emit('update:bpm', value)
})

const progressPercent = computed(() => {
  if (!props.totalSteps) return 0
  return Math.min(100, Math.round((props.currentStep / props.totalSteps) * 100))
})

const groupedSongs = computed(() => {
  const songs = props.songs.filter((item) => item.group === 'Songs')
  const arpeggio = props.songs.filter((item) => item.group === 'Arpeggio')
  return [
    { label: 'Songs', items: songs },
    { label: 'Arpeggio', items: arpeggio }
  ].filter((group) => group.items.length > 0)
})

const incrementBpm = (amount: number) => {
  localBpm.value = Math.max(40, Math.min(220, localBpm.value + amount))
}
</script>

<template>
  <div class="musicbox-container glass-panel">
    <header class="musicbox-header">
      <h1 class="text-gradient">Music Box</h1>
      <span class="status-pill" :class="{ active: isPlaying }">
        {{ isPlaying ? 'Playing' : 'Stopped' }}
      </span>
    </header>

    <main class="musicbox-main">
      <div class="note-display">
        <span class="note-label">Now</span>
        <span class="note-value">{{ currentNote }}</span>
      </div>

      <div class="chord-display">
        <span class="chord-label">Chord</span>
        <span class="chord-value">{{ currentChord }}</span>
      </div>

      <div class="progress-wrap">
        <div class="progress-meta">
          <span>{{ currentStep }} / {{ totalSteps }}</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>
      </div>

      <div class="control-block">
        <label for="song-select">Song</label>
        <select
          id="song-select"
          class="glass-select"
          :value="selectedSong"
          @change="(e) => emit('update:selectedSong', (e.target as HTMLSelectElement).value)"
        >
          <optgroup v-for="group in groupedSongs" :key="group.label" :label="group.label">
            <option v-for="song in group.items" :key="song.key" :value="song.key">
              {{ song.group === 'Songs' ? '♪ ' : '⌁ ' }}{{ song.name }}
            </option>
          </optgroup>
        </select>
      </div>

      <div class="control-block">
        <div class="bpm-head">
          <label>BPM</label>
          <button
            type="button"
            class="recommended-badge"
            :class="{ highlight: bpm !== recommendedBpm }"
            @click="emit('update:bpm', recommendedBpm)"
          >
            추천 BPM {{ recommendedBpm }}
          </button>
        </div>
        <div class="tempo-row">
          <button class="btn-circle" @click="incrementBpm(-5)">-5</button>
          <input type="range" v-model.number="localBpm" min="40" max="220" class="bpm-slider" />
          <button class="btn-circle" @click="incrementBpm(5)">+5</button>
          <span class="bpm-value">{{ bpm }}</span>
        </div>
      </div>

      <label class="loop-row">
        <input
          type="checkbox"
          :checked="isLoop"
          @change="(e) => emit('update:isLoop', (e.target as HTMLInputElement).checked)"
        />
        <span>Loop playback</span>
      </label>
    </main>

    <footer>
      <button class="btn-primary" :class="{ 'btn-active': isPlaying }" @click="emit('toggle')">
        <span class="btn-icon">🎵</span>
        {{ isPlaying ? 'Stop' : 'Play' }}
      </button>
    </footer>
  </div>
</template>

<style scoped>
.musicbox-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.musicbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 1.5rem;
  margin: 0;
}

.status-pill {
  font-size: 0.875rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-muted);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.status-pill.active {
  color: var(--accent-tune);
  border-color: rgba(16, 185, 129, 0.45);
  background: rgba(16, 185, 129, 0.12);
}

.musicbox-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-display {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.note-label {
  color: var(--text-muted);
}

.note-value {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.chord-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
}

.chord-label {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.chord-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  transition: width 0.2s ease;
}

.control-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bpm-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recommended-badge {
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
}

.recommended-badge:hover {
  background: rgba(255, 255, 255, 0.12);
}

.recommended-badge.highlight {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.35);
}

label {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.glass-select {
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  outline: none;
  font-family: inherit;
  font-size: 0.95rem;
}

.tempo-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.bpm-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
}

.bpm-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent-tune);
}

.bpm-value {
  min-width: 40px;
  text-align: right;
  font-weight: 700;
}

.loop-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-main);
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
</style>