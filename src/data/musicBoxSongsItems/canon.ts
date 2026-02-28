import { n } from '../musicBoxNotes'
import type { Song } from '../musicBoxTypes'

const song: Song = {
  key: 'canon',
  name: 'Canon Loop',
  recommendedBpm: 76,
  notes: [
    n('D4', 1),
    n('A3', 1),
    n('B3', 1),
    n('F#3', 1),
    n('G3', 1),
    n('D3', 1),
    n('G3', 1),
    n('A3', 1)
  ]
}

export default song
