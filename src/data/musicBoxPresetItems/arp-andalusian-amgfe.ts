import { createArpeggioPreset } from '../musicBoxPresetHelper'
import type { Song } from '../musicBoxTypes'

const preset: Song = createArpeggioPreset('arp-andalusian-amgfe', 'Arp • Am-G-F-E', 98, [
  { name: 'Am', root: 'A2', third: 'C3', fifth: 'E3' },
  { name: 'G', root: 'G2', third: 'B2', fifth: 'D3' },
  { name: 'F', root: 'F2', third: 'A2', fifth: 'C3' },
  { name: 'E', root: 'E2', third: 'G#2', fifth: 'B2' }
])

export default preset
