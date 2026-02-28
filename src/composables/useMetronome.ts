import { ref, onUnmounted } from 'vue'

export function useMetronome() {
    const isPlaying = ref(false)
    const bpm = ref(120)
    const beatsPerMeasure = ref(4)
    const currentBeat = ref(1)

    let audioContext: AudioContext | null = null
    let nextNoteTime = 0.0
    let current16thNote = 0
    let lookahead = 25.0 // ms
    let scheduleAheadTime = 0.1 // s
    let timerId: number | null = null

    // Create the "click" sound using a precise Web Audio API oscillator
    const scheduleNote = (beatNumber: number, time: number) => {
        if (!audioContext) return

        // Since we're tracking 16th notes recursively, we only play on the quarter notes
        if (beatNumber % 4 === 0) {
            // beat represents the quarter note measure count (0 to beatsPerMeasure - 1)
            const beat = (beatNumber / 4) % beatsPerMeasure.value

            // Update UI state asynchronously to not block the audio thread
            requestAnimationFrame(() => {
                currentBeat.value = beat + 1
            })

            const osc = audioContext.createOscillator()
            const envelope = audioContext.createGain()

            osc.connect(envelope)
            envelope.connect(audioContext.destination)

            // Emphasize the first beat
            const isFirstBeat = (beat === 0)
            osc.frequency.value = isFirstBeat ? 1200.0 : 800.0

            // Envelope to make a sharp click
            envelope.gain.value = 1
            envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1)

            osc.start(time)
            osc.stop(time + 0.1)
        }
    }

    const nextNote = () => {
        // 60 seconds / BPM = seconds per beat
        // 0.25 is because we're counting 16th notes
        const secondsPerBeat = 60.0 / bpm.value
        nextNoteTime += 0.25 * secondsPerBeat
        current16thNote++
        // Reset counter based on the actual beats per measure (beatsPerMeasure * 4 sixteenth notes per quarter note)
        const sixteenthNotesPerMeasure = beatsPerMeasure.value * 4
        if (current16thNote >= sixteenthNotesPerMeasure) {
            current16thNote = 0
        }
    }

    const scheduler = () => {
        if (!audioContext) return
        // while there are notes that will need to play before the next interval, schedule them
        while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
            scheduleNote(current16thNote, nextNoteTime)
            nextNote()
        }
        timerId = window.setTimeout(scheduler, lookahead)
    }

    const toggleMetronome = () => {
        if (isPlaying.value) {
            // Stop
            isPlaying.value = false
            if (timerId !== null) {
                window.clearTimeout(timerId)
                timerId = null
            }
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close()
            }
            audioContext = null
        } else {
            // Start
            if (!audioContext) {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            }
            if (audioContext.state === 'suspended') {
                audioContext.resume()
            }
            isPlaying.value = true
            current16thNote = 0
            nextNoteTime = audioContext.currentTime + 0.05
            scheduler()
        }
    }

    onUnmounted(() => {
        if (isPlaying.value) {
            toggleMetronome()
        }
    })

    return {
        isPlaying,
        bpm,
        beatsPerMeasure,
        currentBeat,
        toggleMetronome
    }
}
