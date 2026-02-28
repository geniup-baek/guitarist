import { createArpeggioPreset } from '../musicBoxPresetHelper'
import type { Song } from '../musicBoxTypes'

const preset: Song = createArpeggioPreset('arp-jazz-251-c', 'Arp • Dm7-G7-Cmaj7', 110, [
  { name: 'Dm', root: 'D3', third: 'F3', fifth: 'A3' },
  { name: 'G', root: 'G2', third: 'B2', fifth: 'D3' },
  { name: 'C', root: 'C3', third: 'E3', fifth: 'G3' },
  { name: 'C', root: 'C3', third: 'E3', fifth: 'G3' }
])

export default preset
