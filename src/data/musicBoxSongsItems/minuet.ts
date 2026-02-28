import { n } from '../musicBoxNotes'
import type { Song } from '../musicBoxTypes'

const song: Song = {
  key: 'minuet',
  name: 'Minuet Theme',
  recommendedBpm: 88,
  notes: [
    n('G4', 1),
    n('A4', 1),
    n('B4', 1),
    n('C5', 1),
    n('D5', 1),
    n('B4', 1),
    n('C5', 1),
    n('A4', 1),
    n('G4', 2)
  ]
}

export default song
