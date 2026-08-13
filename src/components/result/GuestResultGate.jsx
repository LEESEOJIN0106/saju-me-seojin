import { Mascot } from '../ui/Mascot'
import { SubmitButton } from '../ui/SubmitButton'
import './GuestResultGate.css'

export function GuestResultGate({ authBusy, onGoogleSignIn, onReset }) {
  return (
    <section className="result-gate" aria-label="결과 잠금">
      <div className="result-gate-card">
        <Mascot size="md" />
        <h2 className="result-gate-title">결과는 로그인하면 바로 열어 줄게요</h2>
        <p className="result-gate-copy">
          유형 카드와 물개 풀이가 준비됐어요. Google로 들어오면 이번 결과도
          기록에 남겨 둘게요.
        </p>
        <SubmitButton
          busy={authBusy}
          busyLabel="로그인하는 중…"
          disabled={authBusy}
          onClick={() => onGoogleSignIn('result_gate')}
        >
          <span className="submit-icon" aria-hidden="true">
            ✦
          </span>
          Google로 로그인하고 결과 보기
        </SubmitButton>
        <button type="button" className="guest-form-toggle" onClick={onReset}>
          정보를 다시 입력할게요
        </button>
      </div>
    </section>
  )
}
