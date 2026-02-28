import { createArpeggioPreset } from '../musicBoxPresetHelper'
import type { Song } from '../musicBoxTypes'

const preset: Song = createArpeggioPreset('arp-ballad-gdemc', 'Arp • G-D-Em-C', 72, [
  { name: 'G', root: 'G2', third: 'B2', fifth: 'D3' },
  { name: 'D', root: 'D3', third: 'F#3', fifth: 'A3' },
  { name: 'Em', root: 'E2', third: 'G2', fifth: 'B2' },
  { name: 'C', root: 'C3', third: 'E3', fifth: 'G3' }
])

export default preset
