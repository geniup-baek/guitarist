<script setup lang="ts">
import { ref } from 'vue'
import TunerDevice from './components/TunerDevice.vue'
import MetronomeDevice from './components/MetronomeDevice.vue'
import MusicBoxDevice from './components/MusicBoxDevice.vue'
import MusicBoxEditorDevice from './components/MusicBoxEditorDevice.vue'
import { useTuner } from './composables/useTuner'
import { useMetronome } from './composables/useMetronome'
import { useMusicBox } from './composables/useMusicBox'

const currentMode = ref<'tuner' | 'metronome' | 'musicbox' | 'musicbox-editor'>('metronome')

// Tuner Logic
const { 
  isListening: isTunerListening, 
  currentNote: tunerCurrentNote, 
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

// MusicBox Logic
const {
  isPlaying: isMusicBoxPlaying,
  bpm: musicBoxBpm,
  selectedSong,
  songOptions,
  noteOptions,
  isSelectedPreset,
  recommendedBpm,
  activeSongEditorForm,
  activePresetEditorForm,
  dataEditStatus,
  isLoop,
  currentStep,
  totalSteps,
  currentNote: musicBoxCurrentNote,
  currentChord: musicBoxCurrentChord,
  applySongFormEdit,
  applyPresetFormEdit,
  resetSongData,
  toggleMusicBox,
  stopMusicBox,
  setSong
} = useMusicBox()

const switchMode = (mode: 'tuner' | 'metronome' | 'musicbox' | 'musicbox-editor') => {
  // Turn off active audio contexts when switching to avoid weird overlaps
  if (mode !== 'tuner' && isTunerListening.value) {
    toggleTuner()
  }

  if (mode !== 'metronome' && isMetronomePlaying.value) {
    toggleMetronome()
  }

  if (mode !== 'musicbox' && isMusicBoxPlaying.value) {
    void stopMusicBox()
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
      <button
        class="nav-btn"
        :class="{ active: currentMode === 'musicbox' }"
        @click="switchMode('musicbox')"
      >
        Music Box
      </button>
      <button
        class="nav-btn"
        :class="{ active: currentMode === 'musicbox-editor' }"
        @click="switchMode('musicbox-editor')"
      >
        Editor
      </button>
    </nav>

    <div class="device-container">
      <Transition name="fade" mode="out-in">
        <TunerDevice
          v-if="currentMode === 'tuner'"
          :isListening="isTunerListening"
          :note="tunerCurrentNote"
          :cents="currentCents"
          :frequency="currentFrequency"
          @toggle="toggleTuner"
        />

        <MetronomeDevice
          v-else-if="currentMode === 'metronome'"
          :isPlaying="isMetronomePlaying"
          v-model:bpm="bpm"
          v-model:beatsPerMeasure="beatsPerMeasure"
          :currentBeat="currentBeat"
          @toggle="toggleMetronome"
        />

        <MusicBoxDevice
          v-else-if="currentMode === 'musicbox'"
          :isPlaying="isMusicBoxPlaying"
          v-model:bpm="musicBoxBpm"
          :selectedSong="selectedSong"
          :songs="songOptions"
          :recommendedBpm="recommendedBpm"
          v-model:isLoop="isLoop"
          :currentStep="currentStep"
          :totalSteps="totalSteps"
          :currentNote="musicBoxCurrentNote"
          :currentChord="musicBoxCurrentChord"
          @update:selectedSong="setSong"
          @toggle="toggleMusicBox"
        />

        <MusicBoxEditorDevice
          v-else
          :selectedSong="selectedSong"
          :songs="songOptions"
          :noteOptions="noteOptions"
          :songDataForm="activeSongEditorForm"
          :presetDataForm="activePresetEditorForm"
          :isSelectedPreset="isSelectedPreset"
          :dataEditStatus="dataEditStatus"
          @update:selectedSong="setSong"
          @applySongForm="applySongFormEdit"
          @applyPresetForm="applyPresetFormEdit"
          @resetSongData="resetSongData"
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
