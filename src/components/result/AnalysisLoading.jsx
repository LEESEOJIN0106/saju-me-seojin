import { useEffect, useState } from 'react'
import './AnalysisLoading.css'

/** 대기 화면 — 일러스트 + 진행률(가짜지만 체감용으로 천천히 상승) */
export function AnalysisLoading() {
  const [pct, setPct] = useState(6)

  useEffect(() => {
    const started = performance.now()
    let raf = 0
    const tick = (now) => {
      const t = (now - started) / 1000
      // 초반 빠르게, 후반 94% 근처에서 감속
      const next = Math.min(94, 6 + 88 * (1 - Math.exp(-t / 4.2)))
      setPct(Math.round(next))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="analysis-loading" aria-busy="true">
      <div className="analysis-loading-frame" aria-hidden="true">
        <img
          className="analysis-loading-art"
          src="/loading-mascot.png"
          alt=""
          width={720}
          height={900}
          decoding="async"
        />
      </div>
      <div
        className="analysis-loading-progress"
        role="progressbar"
        aria-label="사주 해석 진행"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="analysis-loading-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="analysis-loading-pct">{pct}%</p>
      </div>
      <p className="analysis-loading-label">물개가 사주 읽는 중…</p>
    </div>
  )
}
