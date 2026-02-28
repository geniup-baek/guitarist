export type NoteStep = {
  note: string
  frequency: number
  beats: number
  chord?: string
}

export type Song = {
  key: string
  name: string
  recommendedBpm: number
  notes: NoteStep[]
}
