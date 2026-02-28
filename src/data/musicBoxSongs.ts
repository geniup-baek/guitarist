import type { Song } from './musicBoxTypes'

type SongModule = {
  default: Song
}

const modules = import.meta.glob<SongModule>('./musicBoxSongsItems/*.ts', { eager: true })

export const MUSIC_BOX_SONGS: Song[] = Object.entries(modules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([, module]) => module.default)
