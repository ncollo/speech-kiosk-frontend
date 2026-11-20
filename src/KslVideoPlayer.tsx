import { HandWaving, Play, Pause, X } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import type { KslPromptItem } from './api'

export default function KslVideoPlayer({
  prompt,
  lang = 'EN',
  onClose,
  compact = false,
}: {
  prompt: KslPromptItem
  lang?: 'EN' | 'SW'
  onClose?: () => void
  compact?: boolean
}) {
  const [playing, setPlaying] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const isUploadedVideo = Boolean(prompt.videoUrl && !prompt.videoUrl.startsWith('builtin://'))

  useEffect(() => {
    setElapsed(0)
    setPlaying(true)
  }, [prompt.id])

  useEffect(() => {
    if (isUploadedVideo || !playing) return
    const dur = Math.max(3, prompt.durationSec || 5)
    const id = setInterval(() => {
      setElapsed((e) => (e + 0.25 >= dur ? 0 : e + 0.25))
    }, 250)
    return () => clearInterval(id)
  }, [isUploadedVideo, playing, prompt.durationSec])

  const progress = Math.min(100, Math.round((elapsed / Math.max(3, prompt.durationSec || 5)) * 100))

  return (
    <div
      className={`rounded-[20px] border-2 border-brand/40 bg-navy text-canvas overflow-hidden shadow-xl ${
        compact ? 'w-full' : 'w-[340px]'
      }`}
    >
      <div className="px-4 py-2.5 bg-navy border-b border-canvas/15 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-full bg-brand text-canvas grid place-items-center shrink-0">
            <HandWaving size={14} weight="fill" />
          </span>
          <span className="text-[12px] font-bold uppercase tracking-wider text-mint truncate">
            KSL Prompt · {prompt.title}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close KSL video"
            className="w-7 h-7 rounded-full hover:bg-canvas/15 grid place-items-center text-canvas/80"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {isUploadedVideo ? (
        <video
          key={prompt.videoUrl}
          src={prompt.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          controls
          className="w-full aspect-video bg-black object-cover"
        />
      ) : (
        <div className="relative aspect-video bg-gradient-to-br from-[#0F2A2D] via-[#173C40] to-[#123336] flex flex-col items-center justify-center p-4 text-center">
          {/* Animated KSL Signer Visual */}
          <div className={`relative w-20 h-20 rounded-full bg-brand/20 border-2 border-mint/60 grid place-items-center ${playing ? 'animate-pulse' : ''}`}>
            <HandWaving size={42} weight="duotone" className="text-mint" />
            <span className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-amber text-navy text-[10px] font-extrabold tracking-wide">
              KSL
            </span>
          </div>
          <p className="mt-3 text-[11px] font-mono uppercase tracking-wider text-mint/90">
            {prompt.kslGloss || prompt.title}
          </p>
          <div className="mt-2.5 w-full max-w-[220px] h-1.5 rounded-full bg-canvas/15 overflow-hidden">
            <div className="h-full bg-mint transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="mt-2 h-7 px-3 rounded-full bg-canvas/10 hover:bg-canvas/20 text-[11px] font-semibold inline-flex items-center gap-1"
          >
            {playing ? <Pause size={12} weight="fill" /> : <Play size={12} weight="fill" />}
            {playing ? 'Pause KSL' : 'Play KSL'}
          </button>
        </div>
      )}

      <div className="px-4 py-2.5 bg-canvas/5 text-[13px] leading-snug">
        <p className="font-semibold text-canvas">{lang === 'SW' ? prompt.questionSw : prompt.questionEn}</p>
      </div>
    </div>
  )
}

