import { n } from '../musicBoxNotes'
import type { Song } from '../musicBoxTypes'

const song: Song = {
  key: 'ode',
  name: 'Ode to Joy',
  recommendedBpm: 96,
  notes: [
    n('E4', 1),
    n('E4', 1),
    n('F4', 1),
    n('G4', 1),
    n('G4', 1),
    n('F4', 1),
    n('E4', 1),
    n('D4', 1),
    n('C4', 1),
    n('C4', 1),
    n('D4', 1),
    n('E4', 1),
    n('E4', 1.5),
    n('D4', 0.5),
    n('D4', 2)
  ]
}

export default song
