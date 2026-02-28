import { computed, onUnmounted, ref } from 'vue'
import { MUSIC_BOX_ARPEGGIO_PRESETS } from '../data/musicBoxArpeggioPresets'
import { MUSIC_BOX_SONGS } from '../data/musicBoxSongs'
import type { Song } from '../data/musicBoxTypes'

const SONGS: Song[] = [...MUSIC_BOX_SONGS, ...MUSIC_BOX_ARPEGGIO_PRESETS]

const FALLBACK_SONG: Song = {
  key: 'fallback',
  name: 'Fallback',
  recommendedBpm: 96,
  notes: [{ note: 'A4', frequency: 440, beats: 1 }]
}

export function useMusicBox() {
  const isPlaying = ref(false)
  const initialSong = SONGS[0] ?? FALLBACK_SONG
  const bpm = ref(initialSong.recommendedBpm)
  const selectedSong = ref(initialSong.key)
  const isLoop = ref(true)
  const currentStep = ref(0)
  const currentNote = ref('--')
  const currentChord = ref('--')

  let audioContext: AudioContext | null = null
  let timerId: number | null = null

  const songOptions = [
    ...MUSIC_BOX_SONGS.map(({ key, name }) => ({ key, name, group: 'Songs' as const })),
    ...MUSIC_BOX_ARPEGGIO_PRESETS.map(({ key, name }) => ({ key, name, group: 'Arpeggio' as const }))
  ]

  const activeSong = computed<Song>(() => {
    return SONGS.find((song) => song.key === selectedSong.value) ?? SONGS[0] ?? FALLBACK_SONG
  })

  const clearTimer = () => {
    if (timerId !== null) {
      window.clearTimeout(timerId)
      timerId = null
    }
  }

  const playTone = (frequency: number, seconds: number) => {
    if (!audioContext) return

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    const now = audioContext.currentTime
    gainNode.gain.setValueAtTime(0.0001, now)
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.03, seconds * 0.9))

    oscillator.start(now)
    oscillator.stop(now + seconds)
  }

  const stopMusicBox = async () => {
    isPlaying.value = false
    currentStep.value = 0
    currentNote.value = '--'
    currentChord.value = '--'
    clearTimer()

    if (audioContext && audioContext.state !== 'closed') {
      await audioContext.close()
    }
    audioContext = null
  }

  const scheduleNext = () => {
    if (!isPlaying.value || !audioContext) return

    const notes = activeSong.value.notes
    if (notes.length === 0) {
      void stopMusicBox()
      return
    }

    if (currentStep.value >= notes.length) {
      if (isLoop.value) {
        currentStep.value = 0
      } else {
        void stopMusicBox()
        return
      }
    }

    const step = notes[currentStep.value]
    if (!step) {
      void stopMusicBox()
      return
    }
    const beatSeconds = 60 / bpm.value
    const durationSeconds = step.beats * beatSeconds

    currentNote.value = step.note
    currentChord.value = step.chord ?? '--'
    playTone(step.frequency, durationSeconds)

    currentStep.value += 1
    timerId = window.setTimeout(scheduleNext, durationSeconds * 1000)
  }

  const startMusicBox = async () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    isPlaying.value = true
    currentStep.value = 0
    currentChord.value = '--'
    scheduleNext()
  }

  const toggleMusicBox = () => {
    if (isPlaying.value) {
      void stopMusicBox()
    } else {
      void startMusicBox()
    }
  }

  const setSong = (songKey: string) => {
    const song = SONGS.find((item) => item.key === songKey)
    const nextSong = song ?? SONGS[0] ?? FALLBACK_SONG

    selectedSong.value = nextSong.key
    bpm.value = nextSong.recommendedBpm

    if (isPlaying.value) {
      currentStep.value = 0
    }
  }

  onUnmounted(() => {
    if (isPlaying.value) {
      void stopMusicBox()
    }
  })

  return {
    isPlaying,
    bpm,
    selectedSong,
    songOptions,
    recommendedBpm: computed(() => activeSong.value.recommendedBpm),
    isLoop,
    currentStep,
    totalSteps: computed(() => activeSong.value.notes.length),
    currentNote,
    currentChord,
    toggleMusicBox,
    stopMusicBox,
    setSong
  }
}