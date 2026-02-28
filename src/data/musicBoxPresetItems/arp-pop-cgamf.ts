import { createArpeggioPreset } from '../musicBoxPresetHelper'
import type { Song } from '../musicBoxTypes'

const preset: Song = createArpeggioPreset('arp-pop-cgamf', 'Arp • C-G-Am-F', 96, [
  { name: 'C', root: 'C3', third: 'E3', fifth: 'G3' },
  { name: 'G', root: 'G2', third: 'B2', fifth: 'D3' },
  { name: 'Am', root: 'A2', third: 'C3', fifth: 'E3' },
  { name: 'F', root: 'F2', third: 'A2', fifth: 'C3' }
])

export default preset
