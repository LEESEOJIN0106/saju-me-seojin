import { useEffect, useState } from 'react'

const STEPS = [
  '생년월일을 확인하고 있어요',
  '성향의 흐름을 정리하고 있어요',
  '읽기 쉽게 결과를 다듬고 있어요',
]

/** 실제 단계가 아니라 대기 중 안내용 — 완료 체크는 시간 경과만 반영 */
export function AnalysisLoading() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStep(1), 900),
      window.setTimeout(() => setStep(2), 2200),
    ]
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [])

  return (
    <div className="analysis-loading" role="status" aria-live="polite">
      <p className="analysis-loading-title">사주를 풀어보고 있어요</p>
      <ul className="analysis-loading-steps">
        {STEPS.map((label, i) => {
          const done = i < step
          const current = i === step
          return (
            <li
              key={label}
              className={`analysis-loading-step${done ? ' is-done' : ''}${current ? ' is-current' : ''}`}
            >
              <span aria-hidden="true">{done ? '✓' : current ? '…' : '·'}</span>
              {label}
            </li>
          )
        })}
      </ul>
      <p className="analysis-loading-note">잠시만 기다려 주세요</p>
    </div>
  )
}
