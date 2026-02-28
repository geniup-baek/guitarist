import type { NoteStep } from './musicBoxTypes'

export const NOTE_FREQUENCIES = {
  E2: 82.41,
  F2: 87.31,
  G2: 98.0,
  'G#2': 103.83,
  A2: 110.0,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  'F#3': 185.0,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46
} as const

export type NoteName = keyof typeof NOTE_FREQUENCIES

export const n = (note: NoteName, beats: number, chord?: string): NoteStep => ({
  note,
  frequency: NOTE_FREQUENCIES[note],
  beats,
  chord
})
