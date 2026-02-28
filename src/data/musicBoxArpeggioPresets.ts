import { NOTE_FREQUENCIES, type NoteName } from './musicBoxNotes'
import type { Song } from './musicBoxTypes'

type RawPreset = {
  key: string
  name: string
  recommendedBpm: number
  progression: Array<{
    name: string
    root: string
    third: string
    fifth: string
  }>
}

type RawPresetModule = {
  default: RawPreset
}

const modules = import.meta.glob<RawPresetModule>('./musicBoxPresetItems/*.json', { eager: true })

const toPresetSong = (raw: RawPreset): Song | null => {
  if (!raw?.key || !raw?.name || !Array.isArray(raw.progression) || raw.progression.length === 0) return null

  const notes: Song['notes'] = []

  for (const chord of raw.progression) {
    const pattern = [chord.root, chord.third, chord.fifth, chord.third, chord.root, chord.third, chord.fifth, chord.third]

    for (const note of pattern) {
      const noteName = note as NoteName
      const frequency = NOTE_FREQUENCIES[noteName]
      if (!frequency) return null

      notes.push({
        note: noteName,
        frequency,
        beats: 0.5,
        chord: chord.name
      })
    }
  }

  return {
    key: raw.key,
    name: raw.name,
    recommendedBpm: Math.max(30, Math.min(300, Number(raw.recommendedBpm) || 96)),
    notes
  }
}

export const MUSIC_BOX_ARPEGGIO_PRESETS: Song[] = Object.entries(modules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([, module]) => toPresetSong(module.default))
  .filter((song): song is Song => song !== null)
