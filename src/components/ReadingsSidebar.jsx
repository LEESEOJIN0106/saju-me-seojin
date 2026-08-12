import { readingSubtitle } from '../lib/birth'

export function ReadingsSidebar({
  user,
  authBusy,
  onGoogleSignIn,
  onSignOut,
  onNewInput,
  readings,
  readingsLoading,
  activeReadingId,
  onSelectReading,
  onDeleteReading,
}) {
  return (
    <aside className="readings-side" aria-label="저장된 사주">
      <div className="auth-bar">
        {user ? (
          <>
            <span className="auth-bar-email" title={user.email}>
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              type="button"
              className="auth-btn"
              disabled={authBusy}
              onClick={onSignOut}
            >
              로그아웃
            </button>
          </>
        ) : (
          <button
            type="button"
            className="auth-btn auth-btn--google"
            disabled={authBusy}
            onClick={onGoogleSignIn}
          >
            Google로 로그인
          </button>
        )}
      </div>

      <div className="readings-side-head">
        <h2 className="readings-side-title">기록</h2>
        <button type="button" className="readings-new-btn" onClick={onNewInput}>
          새 입력
        </button>
      </div>

      {readingsLoading ? (
        <p className="readings-side-empty">불러오는 중…</p>
      ) : readings.length === 0 ? (
        <p className="readings-side-empty">해석하면 여기에 이름이 쌓입니다</p>
      ) : (
        <ul className="readings-side-list">
          {readings.map((reading) => (
            <li key={reading.id} className="readings-side-row">
              <button
                type="button"
                className={`readings-side-item${activeReadingId === reading.id ? ' is-active' : ''}`}
                aria-pressed={activeReadingId === reading.id}
                onClick={() => onSelectReading(reading)}
              >
                <span className="readings-side-name">
                  {reading.name || '이름 없음'}
                </span>
                <span className="readings-side-meta">
                  {readingSubtitle(reading)}
                </span>
              </button>
              <button
                type="button"
                className="readings-delete-btn"
                aria-label={`${reading.name || '이름 없음'} 삭제`}
                onClick={() => onDeleteReading(reading)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
