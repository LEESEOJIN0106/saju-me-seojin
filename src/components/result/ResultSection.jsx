import { Mascot } from '../ui/Mascot'
import { GuestResultGate } from './GuestResultGate'
import { ResultPanel } from './ResultPanel'
import './ResultSection.css'

export function ResultSection({
  resultRef,
  user,
  interpretation,
  name,
  onStatus,
  authBusy,
  onGoogleSignIn,
  onReset,
}) {
  return (
    <div ref={resultRef}>
      <div className="result-ready" role="status">
        <Mascot size="sm" />
        <div className="result-ready-copy">
          <p className="result-ready-kicker">첨벙</p>
          <p className="result-ready-title">물개가 다 읽어 봤어요</p>
        </div>
      </div>
      {user ? (
        <ResultPanel
          interpretation={interpretation}
          name={name}
          onStatus={onStatus}
        />
      ) : (
        <GuestResultGate
          interpretation={interpretation}
          name={name}
          authBusy={authBusy}
          onGoogleSignIn={onGoogleSignIn}
          onReset={onReset}
        />
      )}
    </div>
  )
}
