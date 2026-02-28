import { n } from '../musicBoxNotes'
import type { Song } from '../musicBoxTypes'

const song: Song = {
  key: 'twinkle',
  name: 'Twinkle',
  recommendedBpm: 84,
  notes: [
    n('C4', 1),
    n('C4', 1),
    n('G4', 1),
    n('G4', 1),
    n('A4', 1),
    n('A4', 1),
    n('G4', 2),
    n('F4', 1),
    n('F4', 1),
    n('E4', 1),
    n('E4', 1),
    n('D4', 1),
    n('D4', 1),
    n('C4', 2)
  ]
}

export default song
