import {
  BatteryLow,
  Brain,
  ChatCircleDots,
  FirstAid,
  HandPalm,
  Heartbeat,
  SmileyNervous,
  Spiral,
  Thermometer,
  Wind,
  type Icon,
} from '@phosphor-icons/react'
import type { KslPromptItem, SymptomCardItem } from './api'

export const ICON_OPTIONS: { key: string; label: string; icon: Icon }[] = [
  { key: 'heartbeat', label: 'Chest / Heart', icon: Heartbeat },
  { key: 'wind', label: 'Breathing', icon: Wind },
  { key: 'smiley-nervous', label: 'Nausea', icon: SmileyNervous },
  { key: 'spiral', label: 'Dizziness', icon: Spiral },
  { key: 'brain', label: 'Headache', icon: Brain },
  { key: 'thermometer', label: 'Fever', icon: Thermometer },
  { key: 'first-aid', label: 'Abdominal / First Aid', icon: FirstAid },
  { key: 'hand-palm', label: 'Swelling', icon: HandPalm },
  { key: 'battery-low', label: 'Fatigue', icon: BatteryLow },
  { key: 'chat-circle-dots', label: 'Other Concern', icon: ChatCircleDots },
]

export function iconForKey(key: string): Icon {
  return ICON_OPTIONS.find((o) => o.key === key)?.icon ?? Heartbeat
}

/** Custom clinical triage & Kenyan healthcare vocabulary corrections for ASR output. */
const CLINICAL_REPLACEMENTS: [RegExp, string][] = [
  [/\b(dis\s*near|dis\s*mia|dyspnoea)\b/gi, 'dyspnea'],
  [/\b(sheaf|chief\s+card|nhif\s+card)\b/gi, 'SHIF card'],
  [/\b(hyper\s*tension)\b/gi, 'hypertension'],
  [/\b(para\s*cetamol|panadol)\b/gi, 'paracetamol'],
  [/\b(k\s*s\s*l)\b/gi, 'KSL'],
  [/\b(triage\s+bay|try\s+age)\b/gi, 'triage'],
  [/\b(kenyatta)\b/gi, 'Kenyatta'],
]

export function applyClinicalVocabulary(raw: string): string {
  let out = raw.trim()
  for (const [pattern, replacement] of CLINICAL_REPLACEMENTS) {
    out = out.replace(pattern, replacement)
  }
  return out
}

export function matchSymptomsAndKsl(
  text: string,
  cards: SymptomCardItem[],
  prompts: KslPromptItem[],
): { matchedCardIds: string[]; matchedKslPrompt: KslPromptItem | null } {
  const lowered = text.toLowerCase().trim()
  if (!lowered) return { matchedCardIds: [], matchedKslPrompt: null }

  const matchedCardIds = cards
    .filter((c) => c.isActive)
    .filter((c) => {
      if (lowered.includes(c.en.toLowerCase()) || lowered.includes(c.sw.toLowerCase())) return true
      return c.keywords.some((kw) => kw && lowered.includes(kw.toLowerCase()))
    })
    .map((c) => c.id)

  let bestPrompt: KslPromptItem | null = null
  let bestScore = 0
  for (const p of prompts) {
    if (!p.isActive) continue
    const score = p.triggerKeywords.reduce((acc, kw) => (kw && lowered.includes(kw.toLowerCase()) ? acc + 1 : acc), 0)
    if (score > bestScore) {
      bestScore = score
      bestPrompt = p
    }
  }

  return { matchedCardIds, matchedKslPrompt: bestPrompt }
}

export type SpeechCaptureController = {
  stop: () => void
  supported: boolean
}

type SpeechResultEvent = {
  resultIndex: number
  results: ArrayLike<{
    isFinal: boolean
    0: { transcript: string; confidence: number }
  }>
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((ev: SpeechResultEvent) => void) | null
  onerror: ((ev: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export function isSpeechRecognitionSupported(): boolean {
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition)
}

export async function startSpeechCapture(opts: {
  lang?: string
  onInterim: (text: string) => void
  onFinal: (text: string, confidence: number) => void
  onLevel: (level: number) => void
  onError: (message: string) => void
  onEnd: () => void
}): Promise<SpeechCaptureController> {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition

  let audioStream: MediaStream | null = null
  let audioCtx: AudioContext | null = null
  let rafId = 0
  let stopped = false

  // Start microphone audio level monitoring via getUserMedia + Web Audio AnalyserNode
  try {
    if (navigator.mediaDevices?.getUserMedia) {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(audioStream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      const buf = new Uint8Array(analyser.frequencyBinCount)
      const tickLevel = () => {
        if (stopped) return
        analyser.getByteFrequencyData(buf)
        let sum = 0
        for (let i = 0; i < buf.length; i += 1) sum += buf[i]
        const avg = sum / buf.length / 255
        opts.onLevel(Math.min(1, avg * 2.4))
        rafId = requestAnimationFrame(tickLevel)
      }
      tickLevel()
    }
  } catch (err) {
    opts.onError(err instanceof Error ? err.message : 'Microphone access denied')
  }

  let recognition: SpeechRecognitionLike | null = null
  if (Recognition) {
    recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = opts.lang || 'en-KE'
    recognition.onresult = (ev: SpeechResultEvent) => {
      let interim = ''
      for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
        const res = ev.results[i]
        const raw = res[0]?.transcript || ''
        if (res.isFinal) {
          const cleaned = applyClinicalVocabulary(raw)
          const conf = typeof res[0]?.confidence === 'number' && res[0].confidence > 0 ? res[0].confidence : 0.88
          if (cleaned) opts.onFinal(cleaned, Number(conf.toFixed(2)))
        } else {
          interim += raw
        }
      }
      if (interim.trim()) {
        opts.onInterim(applyClinicalVocabulary(interim))
      }
    }
    recognition.onerror = (ev) => {
      if (ev.error !== 'no-speech' && ev.error !== 'aborted') {
        opts.onError(`Speech recognition error: ${ev.error}`)
      }
    }
    recognition.onend = () => {
      if (!stopped) {
        try {
          recognition?.start()
        } catch {
          opts.onEnd()
        }
      }
    }
    try {
      recognition.start()
    } catch (err) {
      opts.onError(err instanceof Error ? err.message : 'Could not start speech recognition')
    }
  }

  return {
    supported: Boolean(Recognition),
    stop: () => {
      stopped = true
      if (rafId) cancelAnimationFrame(rafId)
      try {
        recognition?.stop()
      } catch {
        /* ignore */
      }
      audioStream?.getTracks().forEach((t) => t.stop())
      audioCtx?.close().catch(() => undefined)
      opts.onLevel(0)
      opts.onEnd()
    },
  }
}

