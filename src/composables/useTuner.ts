import { ref, onUnmounted } from 'vue'
import Pitchfinder from 'pitchfinder'

// Standard guitar notes
const STANDARD_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function useTuner() {
    const isListening = ref(false)
    const currentNote = ref('')
    const currentCents = ref(0)
    const currentFrequency = ref(0)

    let audioContext: AudioContext | null = null
    let numSamples = 2048
    let analyser: AnalyserNode | null = null
    let mediaStreamSource: MediaStreamAudioSourceNode | null = null
    let stream: MediaStream | null = null
    let detectPitch: ReturnType<typeof Pitchfinder.YIN> | null = null
    let animationFrameId: number | null = null

    const getNoteAndCentsFromFrequency = (frequency: number) => {
        // A4 = 440 Hz
        // Use MIDI formula to find the note: 69 + 12 * Math.log2(frequency / 440)
        const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2))
        const expectedMidi = Math.round(noteNum) + 69

        const cents = Math.round((noteNum - Math.round(noteNum)) * 100)

        // Convert MIDI to note name
        const noteName = (STANDARD_NOTES[expectedMidi % 12] || '') + Math.floor(expectedMidi / 12 - 1)

        // For Guitar specifically we just show the note without octave for a cleaner UI, unless we want the octave.
        const noteSimple = STANDARD_NOTES[expectedMidi % 12] || ''

        return { noteSimple, cents, noteFull: noteName }
    }

    const startAnalyzing = () => {
        if (!analyser || !detectPitch) return

        const buffer = new Float32Array(analyser.fftSize)

        const tick = () => {
            if (!isListening.value) return

            analyser!.getFloatTimeDomainData(buffer)
            const pitch = detectPitch!(buffer)

            if (pitch && pitch > 50 && pitch < 2000) { // filter out background noise/too low/high
                const result = getNoteAndCentsFromFrequency(pitch)

                currentFrequency.value = pitch
                currentNote.value = result.noteSimple
                currentCents.value = result.cents
            }

            animationFrameId = requestAnimationFrame(tick)
        }
        tick()
    }

    const start = async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, autoGainControl: false, noiseSuppression: false } })
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

            analyser = audioContext.createAnalyser()
            analyser.fftSize = numSamples

            mediaStreamSource = audioContext.createMediaStreamSource(stream)
            mediaStreamSource.connect(analyser)

            detectPitch = Pitchfinder.YIN({ sampleRate: audioContext.sampleRate })

            isListening.value = true
            startAnalyzing()
        } catch (err) {
            console.error('Failed to access microphone', err)
            alert('Microphone access is required to use the tuner.')
            isListening.value = false
        }
    }

    const stop = () => {
        isListening.value = false
        currentNote.value = ''
        currentCents.value = 0
        currentFrequency.value = 0

        if (animationFrameId) cancelAnimationFrame(animationFrameId)

        if (mediaStreamSource) {
            mediaStreamSource.disconnect()
            mediaStreamSource = null
        }

        if (stream) {
            stream.getTracks().forEach(t => t.stop())
            stream = null
        }

        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close()
        }
        audioContext = null
    }

    const toggle = () => {
        if (isListening.value) stop()
        else start()
    }

    onUnmounted(() => {
        if (isListening.value) stop()
    })

    return {
        isListening,
        currentNote,
        currentCents,
        currentFrequency,
        toggle
    }
}
