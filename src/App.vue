<script setup lang="ts">
import { ref } from 'vue'
import TunerDevice from './components/TunerDevice.vue'
import MetronomeDevice from './components/MetronomeDevice.vue'
import { useTuner } from './composables/useTuner'
import { useMetronome } from './composables/useMetronome'

const currentMode = ref<'tuner' | 'metronome'>('metronome') // Start with metronome based on recent request

// Tuner Logic
const { 
  isListening: isTunerListening, 
  currentNote, 
  currentCents, 
  currentFrequency, 
  toggle: toggleTuner 
} = useTuner()

// Metronome Logic
const {
  isPlaying: isMetronomePlaying,
  bpm,
  beatsPerMeasure,
  currentBeat,
  toggleMetronome
} = useMetronome()

const switchMode = (mode: 'tuner' | 'metronome') => {
  // Turn off active audio contexts when switching to avoid weird overlaps
  if (mode === 'metronome' && isTunerListening.value) {
    toggleTuner()
  } else if (mode === 'tuner' && isMetronomePlaying.value) {
    toggleMetronome()
  }
  currentMode.value = mode
}

</script>

<template>
  <div class="app-layout">
    <nav class="mode-switcher glass-panel">
      <button 
        class="nav-btn" 
        :class="{ active: currentMode === 'tuner' }"
        @click="switchMode('tuner')"
      >
        Tuner
      </button>
      <button 
        class="nav-btn" 
        :class="{ active: currentMode === 'metronome' }"
        @click="switchMode('metronome')"
      >
        Metronome
      </button>
    </nav>

    <div class="device-container">
      <Transition name="fade" mode="out-in">
        <TunerDevice
          v-if="currentMode === 'tuner'"
          :isListening="isTunerListening"
          :note="currentNote"
          :cents="currentCents"
          :frequency="currentFrequency"
          @toggle="toggleTuner"
        />
        
        <MetronomeDevice
          v-else
          :isPlaying="isMetronomePlaying"
          v-model:bpm="bpm"
          v-model:beatsPerMeasure="beatsPerMeasure"
          :currentBeat="currentBeat"
          @toggle="toggleMetronome"
        />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
  gap: 2rem;
  padding: 1rem;
}

.mode-switcher {
  display: flex;
  padding: 0.5rem;
  border-radius: 999px;
  width: fit-content;
}

.nav-btn {
  padding: 0.75rem 2rem;
  border-radius: 999px;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  color: var(--text-main);
}

.nav-btn.active {
  background: rgba(255, 255, 255, 0.15);
  color: var(--text-main);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.device-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Transition classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
