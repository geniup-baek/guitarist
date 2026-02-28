import { NOTE_FREQUENCIES, type NoteName } from './musicBoxNotes'
import type { Song } from './musicBoxTypes'

type RawSong = {
  key: string
  name: string
  recommendedBpm: number
  notes: Array<{
    note: string
    beats: number
    chord?: string
  }>
}

type RawSongModule = {
  default: RawSong
}

const modules = import.meta.glob<RawSongModule>('./musicBoxSongsItems/*.json', { eager: true })

const toSong = (raw: RawSong): Song | null => {
  if (!raw?.key || !raw?.name || !Array.isArray(raw.notes)) return null

  const notes = raw.notes
    .map((step) => {
      const noteName = step.note as NoteName
      const frequency = NOTE_FREQUENCIES[noteName]
      if (!frequency || !Number.isFinite(step.beats) || step.beats <= 0) return null

      return {
        note: noteName,
        frequency,
        beats: step.beats,
        chord: step.chord
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (notes.length === 0) return null

  return {
    key: raw.key,
    name: raw.name,
    recommendedBpm: Math.max(30, Math.min(300, Number(raw.recommendedBpm) || 96)),
    notes
  }
}

export const MUSIC_BOX_SONGS: Song[] = Object.entries(modules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([, module]) => toSong(module.default))
  .filter((song): song is Song => song !== null)
