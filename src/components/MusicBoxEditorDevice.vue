<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  selectedSong: string
  songs: Array<{ key: string; name: string; group: 'Songs' | 'Arpeggio' }>
  noteOptions: string[]
  songDataForm: {
    name: string
    recommendedBpm: number
    notes: Array<{ note: string; beats: number; chord: string }>
  }
  dataEditStatus: string
}>()

const emit = defineEmits<{
  (e: 'update:selectedSong', value: string): void
  (e: 'applySongForm', payload: {
    name: string
    recommendedBpm: number
    notes: Array<{ note: string; beats: number; chord: string }>
  }): void
  (e: 'resetSongData'): void
}>()

const groupedSongs = computed(() => {
  const songs = props.songs.filter((item) => item.group === 'Songs')
  const arpeggio = props.songs.filter((item) => item.group === 'Arpeggio')
  return [
    { label: 'Songs', items: songs },
    { label: 'Arpeggio', items: arpeggio }
  ].filter((group) => group.items.length > 0)
})

const editorForm = ref({
  name: props.songDataForm.name,
  recommendedBpm: props.songDataForm.recommendedBpm,
  notes: props.songDataForm.notes.map((row) => ({ ...row }))
})

watch(
  () => props.selectedSong,
  () => {
    editorForm.value = {
      name: props.songDataForm.name,
      recommendedBpm: props.songDataForm.recommendedBpm,
      notes: props.songDataForm.notes.map((row) => ({ ...row }))
    }
  }
)

const reloadCurrent = () => {
  editorForm.value = {
    name: props.songDataForm.name,
    recommendedBpm: props.songDataForm.recommendedBpm,
    notes: props.songDataForm.notes.map((row) => ({ ...row }))
  }
}

const addRow = () => {
  editorForm.value.notes.push({
    note: props.noteOptions[0] ?? 'C4',
    beats: 1,
    chord: ''
  })
}

const removeRow = (index: number) => {
  if (editorForm.value.notes.length <= 1) return
  editorForm.value.notes.splice(index, 1)
}
</script>

<template>
  <div class="editor-container glass-panel">
    <header class="editor-header">
      <h1 class="text-gradient">Music Box Editor</h1>
    </header>

    <main class="editor-main">
      <div class="control-block">
        <label for="song-select">편집 대상</label>
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

      <div class="editor-actions">
        <button class="editor-btn" type="button" @click="reloadCurrent">현재 데이터 불러오기</button>
        <button class="editor-btn" type="button" @click="addRow">행 추가</button>
        <button class="editor-btn" type="button" @click="emit('applySongForm', editorForm)">적용</button>
        <button class="editor-btn" type="button" @click="emit('resetSongData')">초기화</button>
      </div>

      <div class="form-grid">
        <label class="field">
          <span>이름</span>
          <input v-model="editorForm.name" class="field-input" type="text" />
        </label>
        <label class="field">
          <span>추천 BPM</span>
          <input v-model.number="editorForm.recommendedBpm" class="field-input" type="number" min="30" max="300" />
        </label>
      </div>

      <div class="rows-wrap">
        <div class="row-head">
          <span>Note</span>
          <span>Beats</span>
          <span>Chord</span>
          <span></span>
        </div>

        <div v-for="(row, index) in editorForm.notes" :key="index" class="note-row">
          <select v-model="row.note" class="row-input">
            <option v-for="note in noteOptions" :key="note" :value="note">{{ note }}</option>
          </select>
          <input v-model.number="row.beats" class="row-input" type="number" min="0.25" step="0.25" />
          <input v-model="row.chord" class="row-input" type="text" placeholder="예: C, Am" />
          <button class="row-remove" type="button" @click="removeRow(index)">삭제</button>
        </div>
      </div>

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
