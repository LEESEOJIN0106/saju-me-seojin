import { parseInterpretation } from '../../lib/parseInterpretation'
import { parseShareMeta, stripShareHeader } from '../../lib/shareCard'
import { SubmitButton } from '../ui/SubmitButton'
import { TypeCard } from './TypeCard'
import './GuestResultGate.css'

function previewIntro(interpretation) {
  return (
    parseInterpretation(stripShareHeader(interpretation)).find(
      (block) => block.type === 'intro',
    )?.content ?? ''
  )
}

export function GuestResultGate({
  interpretation,
  name,
  authBusy,
  onGoogleSignIn,
  onReset,
}) {
  const meta = parseShareMeta(interpretation, name)
  const intro = previewIntro(interpretation)

  return (
    <section className="result-gate" aria-label="결과 맛보기">
      <TypeCard
        meta={meta}
        footer={
          <div className="share-card-foot">
            <span className="share-card-name">{meta.name}</span>
            <span className="result-gate-badge">맛보기</span>
          </div>
        }
      />

      {intro ? (
        <div className="result-gate-preview">
          <p className="result-gate-preview-kicker">물개가 한눈에 보면</p>
          <p>{intro}</p>
        </div>
      ) : null}

      <div className="result-gate-card">
        <h2 className="result-gate-title">나머지는 로그인하면 펼쳐 줄게요</h2>
        <p className="result-gate-copy">
          성격·관계·일·재물 풀이가 준비됐어요. Google로 들어오면 이번 결과도
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
          Google로 로그인하고 전체 보기
        </SubmitButton>
        <button type="button" className="guest-form-toggle" onClick={onReset}>
          정보를 다시 입력할게요
        </button>
      </div>
    </section>
  )
}
