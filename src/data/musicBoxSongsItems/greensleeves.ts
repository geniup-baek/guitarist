import { n } from '../musicBoxNotes'
import type { Song } from '../musicBoxTypes'

const song: Song = {
  key: 'greensleeves',
  name: 'Greensleeves',
  recommendedBpm: 78,
  notes: [
    n('A4', 1),
    n('C5', 1),
    n('D5', 1),
    n('E5', 1),
    n('F5', 1),
    n('E5', 1),
    n('D5', 1),
    n('C5', 1),
    n('B4', 1),
    n('A4', 2)
  ]
}

export default song
