import type { NoteName } from './musicBoxNotes'
import { n } from './musicBoxNotes'
import type { Song } from './musicBoxTypes'

type ArpeggioChord = {
  name: string
  root: NoteName
  third: NoteName
  fifth: NoteName
}

export const createArpeggioPreset = (
  key: string,
  name: string,
  recommendedBpm: number,
  progression: ArpeggioChord[]
): Song => {
  const notes = [] as ReturnType<typeof n>[]

  progression.forEach((chord) => {
    const pattern: NoteName[] = [
      chord.root,
      chord.third,
      chord.fifth,
      chord.third,
      chord.root,
      chord.third,
      chord.fifth,
      chord.third
    ]

    pattern.forEach((note) => {
      notes.push(n(note, 0.5, chord.name))
    })
  })

  return { key, name, recommendedBpm, notes }
}
