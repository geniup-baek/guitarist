<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  selectedSong: string
  songs: Array<{ key: string; name: string; group: 'Songs' | 'Arpeggio' }>
  noteOptions: string[]
  songDataForm: {
    name: string
    recommendedBpm: number
    notes: Array<{ note: string; beats: number; chord: string }>
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
  (e: 'applySongForm', payload: {
    name: string
    recommendedBpm: number
    notes: Array<{ note: string; beats: number; chord: string }>
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
const paintNote = ref(props.noteOptions[0] ?? 'C4')

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
  const targetList = mode === 'song' ? songItems.value : presetItems.value
  const firstTarget = targetList[0]
  if (firstTarget) {
    emit('update:selectedSong', firstTarget.key)
  }
}

const stopPainting = () => {
  isPainting.value = false
}

const paintSlot = (index: number) => {
  const slot = editorForm.value.notes[index]
  if (!slot) return
  slot.note = paintNote.value
}

const startPainting = (index: number) => {
  isPainting.value = true
  paintSlot(index)
}

const paintWhileDragging = (index: number) => {
  if (!isPainting.value) return
  paintSlot(index)
}

const addRow = () => {
  editorForm.value.notes.push({
    note: props.noteOptions[0] ?? 'C4',
    beats: 1,
    chord: ''
  })
}

const insertRowAt = (index: number) => {
  editorForm.value.notes.splice(index, 0, {
    note: props.noteOptions[0] ?? 'C4',
    beats: 1,
    chord: ''
  })
}

const removeRow = (index: number) => {
  if (editorForm.value.notes.length <= 1) return
  editorForm.value.notes.splice(index, 1)
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
          <button class="editor-btn" type="button" @click="reloadCurrentSong">현재 데이터 불러오기</button>
          <button class="editor-btn" type="button" @click="addRow">포지션 추가</button>
          <button class="editor-btn" type="button" @click="emit('applySongForm', editorForm)">적용</button>
          <button class="editor-btn" type="button" @click="emit('resetSongData')">초기화</button>
        </div>

        <div class="paint-tools">
          <label class="field compact">
            <span>드래그 입력 노트</span>
            <select v-model="paintNote" class="row-input">
              <option v-for="note in noteOptions" :key="note" :value="note">{{ note }}</option>
            </select>
          </label>
          <span class="paint-help">슬롯 상단 버튼을 클릭 후 드래그하면 연속 입력됩니다.</span>
        </div>

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

        <div class="tape-wrap">
          <div v-for="(row, index) in editorForm.notes" :key="index" class="tape-slot">
            <button type="button" class="insert-btn" @click="insertRowAt(index)">앞에 +</button>
            <div class="slot-index">{{ index + 1 }}</div>
            <button
              type="button"
              class="tape-hole"
              :class="{ painting: isPainting }"
              @pointerdown.prevent="startPainting(index)"
              @pointerenter="paintWhileDragging(index)"
            >
              {{ row.note }}
            </button>
            <select v-model="row.note" class="row-input">
              <option v-for="note in noteOptions" :key="note" :value="note">{{ note }}</option>
            </select>
            <input v-model.number="row.beats" class="row-input" type="number" min="0.25" step="0.25" />
            <button class="row-remove" type="button" @click="removeRow(index)">삭제</button>
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
            <button class="row-remove" type="button" @click="removeProgressionRow(index)">삭제</button>
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

.tape-wrap {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.3rem 0;
}

.tape-slot {
  min-width: 130px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0.45rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  background: rgba(0, 0, 0, 0.18);
}

.insert-btn {
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-main);
  font-size: 0.72rem;
  padding: 0.25rem 0.4rem;
}

.tape-hole {
  border-radius: 8px;
  border: 1px solid rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.12);
  color: #7dd3fc;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 0.35rem 0.45rem;
}

.tape-hole.painting {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  color: #6ee7b7;
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
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.28);
  color: var(--text-main);
  padding: 0.4rem 0.5rem;
}

.row-remove {
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  padding: 0.35rem 0.55rem;
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
