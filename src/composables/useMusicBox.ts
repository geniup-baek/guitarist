import { computed, onUnmounted, ref } from 'vue'
import { MUSIC_BOX_ARPEGGIO_PRESETS } from '../data/musicBoxArpeggioPresets'
import { NOTE_FREQUENCIES, type NoteName } from '../data/musicBoxNotes'
import { MUSIC_BOX_SONGS } from '../data/musicBoxSongs'
import type { NoteStep, Song } from '../data/musicBoxTypes'

const SONGS: Song[] = [...MUSIC_BOX_SONGS, ...MUSIC_BOX_ARPEGGIO_PRESETS]

const FALLBACK_SONG: Song = {
  key: 'fallback',
  name: 'Fallback',
  recommendedBpm: 96,
  notes: [{ note: 'A4', frequency: 440, beats: 1 }]
}

export function useMusicBox() {
  const isPlaying = ref(false)
  const editableSongs = ref<Record<string, Song>>({})
  const initialSong = SONGS[0] ?? FALLBACK_SONG
  const bpm = ref(initialSong.recommendedBpm)
  const selectedSong = ref(initialSong.key)
  const isLoop = ref(true)
  const currentStep = ref(0)
  const currentNote = ref('--')
  const currentChord = ref('--')
  const dataEditStatus = ref('')

  let audioContext: AudioContext | null = null
  let timerId: number | null = null

  const findBaseSong = (songKey: string) => {
    return SONGS.find((song) => song.key === songKey) ?? SONGS[0] ?? FALLBACK_SONG
  }

  const getSongByKey = (songKey: string) => {
    return editableSongs.value[songKey] ?? findBaseSong(songKey)
  }

  const songOptions = computed(() => [
    ...MUSIC_BOX_SONGS.map(({ key, name }) => ({
      key,
      name: editableSongs.value[key]?.name ?? name,
      group: 'Songs' as const
    })),
    ...MUSIC_BOX_ARPEGGIO_PRESETS.map(({ key, name }) => ({
      key,
      name: editableSongs.value[key]?.name ?? name,
      group: 'Arpeggio' as const
    }))
  ])

  const activeSong = computed<Song>(() => {
    return getSongByKey(selectedSong.value)
  })

  const noteOptions = Object.keys(NOTE_FREQUENCIES) as NoteName[]

  const activeSongEditorForm = computed(() => {
    const song = activeSong.value
    return {
      name: song.name,
      recommendedBpm: song.recommendedBpm,
      notes: song.notes.map((step) => ({
        note: step.note,
        beats: step.beats,
        chord: step.chord ?? ''
      }))
    }
  })

  const applySongFormEdit = (form: {
    name: string
    recommendedBpm: number
    notes: Array<{ note: string; beats: number; chord?: string }>
  }) => {
    if (typeof form.name !== 'string' || !form.name.trim()) {
      dataEditStatus.value = '적용 실패: 이름을 입력해 주세요.'
      return
    }

    if (typeof form.recommendedBpm !== 'number' || !Number.isFinite(form.recommendedBpm)) {
      dataEditStatus.value = '적용 실패: 추천 BPM은 숫자여야 합니다.'
      return
    }

    if (!Array.isArray(form.notes) || form.notes.length === 0) {
      dataEditStatus.value = '적용 실패: 노트는 최소 1개 이상이어야 합니다.'
      return
    }

    const nextNotes: NoteStep[] = []

    for (const noteRow of form.notes) {
      const noteName = noteRow.note as NoteName
      const frequency = NOTE_FREQUENCIES[noteName]

      if (!frequency) {
        dataEditStatus.value = `적용 실패: 유효하지 않은 노트(${noteRow.note})입니다.`
        return
      }

      if (typeof noteRow.beats !== 'number' || !Number.isFinite(noteRow.beats) || noteRow.beats <= 0) {
        dataEditStatus.value = '적용 실패: 박자는 0보다 큰 숫자여야 합니다.'
        return
      }

      nextNotes.push({
        note: noteName,
        frequency,
        beats: noteRow.beats,
        chord: noteRow.chord?.trim() || undefined
      })
    }

    const baseSong = findBaseSong(selectedSong.value)
    const nextSong: Song = {
      key: baseSong.key,
      name: form.name.trim(),
      recommendedBpm: Math.max(30, Math.min(300, form.recommendedBpm)),
      notes: nextNotes
    }

    editableSongs.value[nextSong.key] = nextSong
    bpm.value = nextSong.recommendedBpm
    currentStep.value = 0
    currentChord.value = '--'
    dataEditStatus.value = `적용 완료: ${nextSong.name}`
  }

  const resetSongData = () => {
    const key = selectedSong.value
    if (editableSongs.value[key]) {
      delete editableSongs.value[key]
    }

    const baseSong = findBaseSong(key)
    bpm.value = baseSong.recommendedBpm
    currentStep.value = 0
    currentChord.value = '--'
    dataEditStatus.value = `초기화 완료: ${baseSong.name}`
  }

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
    const nextSong = getSongByKey(songKey)

    selectedSong.value = nextSong.key
    bpm.value = nextSong.recommendedBpm
    dataEditStatus.value = ''

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
    noteOptions,
    recommendedBpm: computed(() => activeSong.value.recommendedBpm),
    activeSongEditorForm,
    dataEditStatus,
    isLoop,
    currentStep,
    totalSteps: computed(() => activeSong.value.notes.length),
    currentNote,
    currentChord,
    applySongFormEdit,
    resetSongData,
    toggleMusicBox,
    stopMusicBox,
    setSong
  }
}