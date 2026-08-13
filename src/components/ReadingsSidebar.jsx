import {
  formatBirthDateLabel,
  formatBirthTimeLabel,
  readingMetaParts,
} from '../lib/birth'
import { isProfileComplete } from '../lib/profile'
import { Mascot } from './Mascot'

function MetaChips({ row, dense = false }) {
  const parts = readingMetaParts(row)
  if (!parts.length) return null
  return (
    <ul className={`meta-chips${dense ? ' meta-chips--dense' : ''}`}>
      {parts.map((part) => (
        <li key={part}>{part}</li>
      ))}
    </ul>
  )
}

export function ReadingsSidebar({
  user,
  profile,
  authBusy,
  onGoogleSignIn,
  onSignOut,
  onOpenProfile,
  onUseMyProfile,
  onNewInput,
  readings,
  readingsLoading,
  activeReadingId,
  onSelectReading,
  onDeleteReading,
}) {
  const profileReady = isProfileComplete(profile)
  const displayName =
    profile?.name?.trim() ||
    user?.user_metadata?.full_name ||
    user?.email ||
    ''
  const monogram = [...displayName][0] || '命'

  return (
    <aside className="readings-side" aria-label="저장된 사주">
      <div className="side-account">
        {user ? (
          <>
            <div className="side-account-main">
              <span className="side-avatar" aria-hidden="true">
                {monogram}
              </span>
              <div className="side-account-copy">
                <p className="side-account-name" title={user.email}>
                  {displayName}
                </p>
                {profileReady ? (
                  <MetaChips row={profile} />
                ) : (
                  <p className="side-account-warn">출생 정보를 알려 주세요</p>
                )}
              </div>
            </div>
            <div className="side-account-actions">
              <button
                type="button"
                className="side-action-btn"
                disabled={authBusy}
                onClick={onOpenProfile}
              >
                프로필
              </button>
              <button
                type="button"
                className="side-action-btn side-action-btn--quiet"
                disabled={authBusy}
                onClick={onSignOut}
              >
                로그아웃
              </button>
            </div>
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

      <div className="side-history">
        <div className="side-history-head">
          <h2 className="side-history-title">기록</h2>
          <span className="side-history-count">
            {user && profileReady ? readings.length : 0}
          </span>
        </div>

        {profileReady ? (
          <div className="side-history-tools" role="group" aria-label="기록 도구">
            <button
              type="button"
              className="side-tool-btn side-tool-btn--primary"
              onClick={onUseMyProfile}
            >
              내 사주
            </button>
            <button type="button" className="side-tool-btn" onClick={onNewInput}>
              다른 사람
            </button>
          </div>
        ) : null}

        {readingsLoading ? (
          <p className="side-history-empty">불러오는 중…</p>
        ) : !user ? (
          <div className="side-history-empty-block">
            <Mascot size="sm" />
            <p className="side-history-empty">
              로그인하면 기록이 여기에 모일게요
            </p>
          </div>
        ) : !profileReady ? (
          <div className="side-history-empty-block">
            <Mascot size="sm" />
            <p className="side-history-empty">
              프로필을 먼저 저장하면 기록이 쌓여요
            </p>
          </div>
        ) : readings.length === 0 ? (
          <div className="side-history-empty-block">
            <Mascot size="sm" />
            <p className="side-history-empty">
              아직 비어 있어요. 첫 사주를 읽어볼까요?
            </p>
          </div>
        ) : (
          <ul className="side-history-list">
            {readings.map((reading) => {
              const active = activeReadingId === reading.id
              return (
                <li key={reading.id} className="side-history-row">
                  <button
                    type="button"
                    className={`side-history-item${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() => onSelectReading(reading)}
                  >
                    <span className="side-history-name">
                      {reading.name || '이름 없음'}
                    </span>
                    <MetaChips row={reading} dense />
                    <span className="side-history-date visually-hidden">
                      {formatBirthDateLabel(reading)} ·{' '}
                      {formatBirthTimeLabel(reading)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="side-history-delete"
                    aria-label={`${reading.name || '이름 없음'} 삭제`}
                    onClick={() => onDeleteReading(reading)}
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
