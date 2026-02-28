import type { Song } from './musicBoxTypes'

type SongModule = {
  default: Song
}

const modules = import.meta.glob<SongModule>('./musicBoxPresetItems/*.ts', { eager: true })

export const MUSIC_BOX_ARPEGGIO_PRESETS: Song[] = Object.entries(modules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([, module]) => module.default)
