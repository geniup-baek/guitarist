<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  isPlaying: boolean
  currentStep: number
  totalSteps: number
  selectedSong: string
  songs: Array<{ key: string; name: string; group: 'Songs' | 'Arpeggio' }>
  noteOptions: string[]
  songDataForm: {
    name: string
    recommendedBpm: number
    notes: Array<{ note: string; beats: number }>
  }
  presetDataForm: {
    name: string
    recommendedBpm: number
    progression: Array<{ name: string; root: string; third: string; fifth: string }>
  }
  isSelectedPreset: boolean
  dataEditStatus: string
}>()

const emit = defineEmits<{
  (e: 'update:selectedSong', value: string): void
  (e: 'createSong', name?: string): void
  (e: 'togglePlay'): void
  (e: 'applySongForm', payload: {
    name: string
    recommendedBpm: number
    notes: Array<{ note: string; beats: number }>
  }): void
  (e: 'applyPresetForm', payload: {
    name: string
    recommendedBpm: number
    progression: Array<{ name: string; root: string; third: string; fifth: string }>
  }): void
  (e: 'resetSongData'): void
}>()

const songItems = computed(() => props.songs.filter((item) => item.group === 'Songs'))
const presetItems = computed(() => props.songs.filter((item) => item.group === 'Arpeggio'))

const editorMode = ref<'song' | 'preset'>(props.isSelectedPreset ? 'preset' : 'song')
const isPainting = ref(false)
const hasPendingSongDraft = ref(false)
const isCreatingSong = ref(false)
const newSongName = ref('')

const editorForm = ref({
  name: props.songDataForm.name,
  recommendedBpm: props.songDataForm.recommendedBpm,
  notes: props.songDataForm.notes.map((row) => ({ ...row }))
})

const presetForm = ref({
  name: props.presetDataForm.name,
  recommendedBpm: props.presetDataForm.recommendedBpm,
  progression: props.presetDataForm.progression.map((row) => ({ ...row }))
})

watch(
  () => props.selectedSong,
  () => {
    editorMode.value = props.isSelectedPreset ? 'preset' : 'song'
    editorForm.value = {
      name: props.songDataForm.name,
      recommendedBpm: props.songDataForm.recommendedBpm,
      notes: props.songDataForm.notes.map((row) => ({ ...row }))
    }

    presetForm.value = {
      name: props.presetDataForm.name,
      recommendedBpm: props.presetDataForm.recommendedBpm,
      progression: props.presetDataForm.progression.map((row) => ({ ...row }))
    }
  }
)

const reloadCurrentSong = () => {
  editorForm.value = {
    name: props.songDataForm.name,
    recommendedBpm: props.songDataForm.recommendedBpm,
    notes: props.songDataForm.notes.map((row) => ({ ...row }))
  }
}

const reloadCurrentPreset = () => {
  presetForm.value = {
    name: props.presetDataForm.name,
    recommendedBpm: props.presetDataForm.recommendedBpm,
    progression: props.presetDataForm.progression.map((row) => ({ ...row }))
  }
}

const switchMode = (mode: 'song' | 'preset') => {
  editorMode.value = mode
  isCreatingSong.value = false
  newSongName.value = ''
  const targetList = mode === 'song' ? songItems.value : presetItems.value
  const firstTarget = targetList[0]
  if (firstTarget) {
    emit('update:selectedSong', firstTarget.key)
  }
}

const openCreateSongInput = () => {
  isCreatingSong.value = true
  newSongName.value = ''
}

const cancelCreateSong = () => {
  isCreatingSong.value = false
  newSongName.value = ''
}

const confirmCreateSong = () => {
  emit('createSong', newSongName.value)
  isCreatingSong.value = false
  newSongName.value = ''
}

const stopPainting = () => {
  isPainting.value = false

  if (hasPendingSongDraft.value && editorMode.value === 'song') {
    emit('applySongForm', editorForm.value)
    hasPendingSongDraft.value = false
  }
}

const paintSlot = (index: number, note: string) => {
  const slot = editorForm.value.notes[index]
  if (!slot) return
  if (slot.note === note) return
  slot.note = note
  hasPendingSongDraft.value = true
}

const startPainting = (index: number, note: string) => {
  isPainting.value = true
  paintSlot(index, note)
}

const paintWhileDragging = (index: number, note: string) => {
  if (!isPainting.value) return
  paintSlot(index, note)
}

const isActiveCell = (index: number, note: string) => {
  return editorForm.value.notes[index]?.note === note
}

const playingRowIndex = computed(() => {
  if (!props.isPlaying || props.totalSteps <= 0) return -1
  return Math.max(0, Math.min(props.totalSteps - 1, props.currentStep - 1))
})

const isPlayingRow = (index: number) => {
  return index === playingRowIndex.value
}

const addRow = () => {
  editorForm.value.notes.push({
    note: props.noteOptions[0] ?? 'C4',
    beats: 1
  })
  emit('applySongForm', editorForm.value)
}

const insertRowAt = (index: number) => {
  editorForm.value.notes.splice(index, 0, {
    note: props.noteOptions[0] ?? 'C4',
    beats: 1
  })
  emit('applySongForm', editorForm.value)
}

const removeRow = (index: number) => {
  if (editorForm.value.notes.length <= 1) return
  editorForm.value.notes.splice(index, 1)
  emit('applySongForm', editorForm.value)
}

const addProgressionRow = () => {
  const first = props.noteOptions[0] ?? 'C4'
  presetForm.value.progression.push({
    name: 'C',
    root: first,
    third: first,
    fifth: first
  })
}

const removeProgressionRow = (index: number) => {
  if (presetForm.value.progression.length <= 1) return
  presetForm.value.progression.splice(index, 1)
}

const handleTogglePlay = () => {
  if (!props.isPlaying) {
    if (editorMode.value === 'song') {
      emit('applySongForm', editorForm.value)
    } else {
      emit('applyPresetForm', presetForm.value)
    }
  }

  emit('togglePlay')
}

onMounted(() => {
  window.addEventListener('pointerup', stopPainting)
})

onUnmounted(() => {
  window.removeEventListener('pointerup', stopPainting)
})
</script>

<template>
  <div class="editor-container glass-panel">
    <header class="editor-header">
      <h1 class="text-gradient">Music Box Editor</h1>
      <button class="play-btn" :class="{ active: isPlaying }" type="button" @click="handleTogglePlay">
        {{ isPlaying ? 'Stop' : 'Play' }}
      </button>
    </header>

    <main class="editor-main">
      <div class="mode-switch">
        <button
          class="mode-btn"
          :class="{ active: editorMode === 'song' }"
          type="button"
          @click="switchMode('song')"
        >
          곡 편집
        </button>
        <button
          class="mode-btn"
          :class="{ active: editorMode === 'preset' }"
          type="button"
          @click="switchMode('preset')"
        >
          프리셋 편집
        </button>
      </div>

      <div class="control-block">
        <label for="song-select">편집 대상</label>
        <select
          id="song-select"
          class="glass-select"
          :value="selectedSong"
          @change="(e) => emit('update:selectedSong', (e.target as HTMLSelectElement).value)"
        >
          <option
            v-for="song in (editorMode === 'song' ? songItems : presetItems)"
            :key="song.key"
            :value="song.key"
          >
            {{ editorMode === 'song' ? '♪ ' : '⌁ ' }}{{ song.name }}
          </option>
        </select>
      </div>

      <template v-if="editorMode === 'song'">
        <div class="editor-actions">
          <button v-if="!isCreatingSong" class="editor-btn" type="button" @click="openCreateSongInput">새 곡 추가</button>
          <button class="editor-btn" type="button" @click="reloadCurrentSong">현재 데이터 불러오기</button>
          <button class="editor-btn" type="button" @click="addRow">포지션 추가</button>
          <button class="editor-btn" type="button" @click="emit('applySongForm', editorForm)">적용</button>
          <button class="editor-btn" type="button" @click="emit('resetSongData')">초기화</button>
        </div>

        <div v-if="isCreatingSong" class="create-song-inline">
          <input
            v-model="newSongName"
            class="field-input"
            type="text"
            placeholder="새 곡 이름 (비우면 자동 이름)"
            @keydown.enter.prevent="confirmCreateSong"
          />
          <button class="editor-btn" type="button" @click="confirmCreateSong">생성</button>
          <button class="editor-btn" type="button" @click="cancelCreateSong">취소</button>
        </div>

        <p class="paint-help">모눈 셀을 클릭/드래그하면 해당 포지션에 음이 입력됩니다. 세로로 스크롤하며 연속 입력하세요.</p>

        <div class="form-grid">
          <label class="field">
            <span>곡 이름</span>
            <input v-model="editorForm.name" class="field-input" type="text" />
          </label>
          <label class="field">
            <span>추천 BPM</span>
            <input v-model.number="editorForm.recommendedBpm" class="field-input" type="number" min="30" max="300" />
          </label>
        </div>

        <div class="grid-paper-wrap">
          <div class="grid-paper">
            <div class="grid-head sticky-col">#</div>
            <div class="grid-head sticky-meta">Beats</div>
            <div class="grid-head sticky-action"></div>
            <div v-for="note in noteOptions" :key="`head-${note}`" class="grid-head note-head">{{ note }}</div>

            <template v-for="(row, index) in editorForm.notes" :key="index">
              <div class="grid-cell sticky-col row-index" :class="{ 'playing-row': isPlayingRow(index) }">
                <button class="insert-btn" type="button" :title="`${index + 1}번 앞에 삽입`" @click="insertRowAt(index)">+</button>
              </div>
              <div class="grid-cell sticky-meta" :class="{ 'playing-row': isPlayingRow(index) }">
                <input v-model.number="row.beats" class="row-input" type="number" min="0.25" step="0.25" />
              </div>
              <div class="grid-cell sticky-action" :class="{ 'playing-row': isPlayingRow(index) }">
                <button class="row-remove" type="button" @click="removeRow(index)">X</button>
              </div>

              <button
                v-for="note in noteOptions"
                :key="`${index}-${note}`"
                type="button"
                class="grid-cell note-cell"
                :class="{ active: isActiveCell(index, note), painting: isPainting, 'playing-row': isPlayingRow(index) }"
                @pointerdown.prevent="startPainting(index, note)"
                @pointerenter="paintWhileDragging(index, note)"
              >
                <span v-if="isActiveCell(index, note)">●</span>
              </button>
            </template>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="editor-actions">
          <button class="editor-btn" type="button" @click="reloadCurrentPreset">현재 데이터 불러오기</button>
          <button class="editor-btn" type="button" @click="addProgressionRow">코드 추가</button>
          <button class="editor-btn" type="button" @click="emit('applyPresetForm', presetForm)">적용</button>
          <button class="editor-btn" type="button" @click="emit('resetSongData')">초기화</button>
        </div>

        <div class="form-grid">
          <label class="field">
            <span>프리셋 이름</span>
            <input v-model="presetForm.name" class="field-input" type="text" />
          </label>
          <label class="field">
            <span>추천 BPM</span>
            <input v-model.number="presetForm.recommendedBpm" class="field-input" type="number" min="30" max="300" />
          </label>
        </div>

        <div class="rows-wrap">
          <div class="row-head preset">
            <span>Chord</span>
            <span>Root</span>
            <span>Third</span>
            <span>Fifth</span>
            <span></span>
          </div>

          <div v-for="(row, index) in presetForm.progression" :key="index" class="note-row preset">
            <input v-model="row.name" class="row-input" type="text" placeholder="예: Am" />
            <select v-model="row.root" class="row-input">
              <option v-for="note in noteOptions" :key="note" :value="note">{{ note }}</option>
            </select>
            <select v-model="row.third" class="row-input">
              <option v-for="note in noteOptions" :key="note" :value="note">{{ note }}</option>
            </select>
            <select v-model="row.fifth" class="row-input">
              <option v-for="note in noteOptions" :key="note" :value="note">{{ note }}</option>
            </select>
            <button class="row-remove" type="button" @click="removeProgressionRow(index)">X</button>
          </div>
        </div>
      </template>

      <p class="editor-status" :class="{ error: dataEditStatus.includes('실패') }">{{ dataEditStatus }}</p>
    </main>
  </div>
</template>

<style scoped>
.editor-container {
  width: 100%;
  max-width: 760px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.editor-header h1 {
  font-size: 1.35rem;
  margin: 0;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.play-btn {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.45rem 0.9rem;
}

.play-btn.active {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.18);
}

.editor-main {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.mode-switch {
  display: flex;
  gap: 0.45rem;
}

.mode-btn {
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
  font-size: 0.82rem;
}

.mode-btn.active {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.45);
  background: rgba(56, 189, 248, 0.12);
}

.control-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.glass-select {
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.55rem 0.8rem;
  border-radius: 10px;
  outline: none;
  font-family: inherit;
  font-size: 0.92rem;
}

.editor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.create-song-inline {
  display: flex;
  gap: 0.45rem;
  align-items: center;
}

.create-song-inline .field-input {
  min-width: 260px;
}

.paint-tools {
  display: flex;
  align-items: flex-end;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.field.compact {
  min-width: 180px;
}

.paint-help {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.editor-btn {
  padding: 0.4rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
  font-size: 0.8rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.field-input {
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.28);
  color: var(--text-main);
  padding: 0.45rem 0.55rem;
}

.rows-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.insert-btn {
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
  font-size: 0.72rem;
  padding: 0.2rem 0;
}

.grid-paper-wrap {
  overflow: auto;
  max-height: 460px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
}

.grid-paper {
  display: grid;
  grid-template-columns: 52px 74px 44px repeat(25, 40px);
  min-width: max-content;
}

.grid-head,
.grid-cell {
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.22);
}

.grid-head {
  position: sticky;
  top: 0;
  z-index: 6;
  font-size: 0.72rem;
  color: var(--text-muted);
  background: rgba(20, 28, 44, 0.98);
}

.note-head {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  padding: 4px 0;
}

.sticky-col {
  position: sticky;
  left: 0;
  z-index: 5;
  background: rgba(20, 28, 44, 0.98);
}

.sticky-meta {
  position: sticky;
  left: 52px;
  z-index: 5;
  background: rgba(20, 28, 44, 0.98);
}

.sticky-action {
  position: sticky;
  left: 126px;
  z-index: 5;
  background: rgba(20, 28, 44, 0.98);
}

.row-index {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.note-cell {
  cursor: pointer;
  color: rgba(125, 211, 252, 0.95);
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.18);
}

.note-cell.active {
  background: rgba(56, 189, 248, 0.22);
}

.note-cell.painting:hover {
  background: rgba(16, 185, 129, 0.24);
}

.grid-cell.playing-row {
  box-shadow: inset 0 0 0 1px rgba(56, 189, 248, 0.55);
  background: rgba(56, 189, 248, 0.1);
}

.slot-index {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.row-head,
.note-row {
  display: grid;
  grid-template-columns: 1.2fr 0.7fr 1fr auto;
  gap: 0.45rem;
  align-items: center;
}

.row-head {
  color: var(--text-muted);
  font-size: 0.75rem;
}

.row-head.preset,
.note-row.preset {
  grid-template-columns: 0.9fr 1fr 1fr 1fr auto;
}

.row-input {
  width: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.28);
  color: var(--text-main);
  padding: 0.4rem 0.5rem;
}

.row-remove {
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  padding: 0.3rem 0;
  font-size: 0.75rem;
}

.editor-status {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--accent-tune);
}

.editor-status.error {
  color: var(--accent-flat);
}
</style>
