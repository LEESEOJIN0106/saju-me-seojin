import { useEffect, useId, useState } from 'react'
import {
  formatBirthDateLabel,
  formatBirthTimeLabel,
  formatCalendarLabel,
  formatGenderLabel,
  normalizeBirthForm,
} from '../lib/birth'
import {
  emptyProfileForm,
  isProfileComplete,
  profileMissingHint,
  rowToForm,
} from '../lib/profile'
import { BirthFields } from './BirthFields'
import { Mascot } from './Mascot'
import { SubmitButton } from './SubmitButton'

export function ProfileModal({
  mode = 'onboard',
  initial,
  busy = false,
  errorMessage = '',
  onSave,
  onClose,
}) {
  const titleId = useId()
  const [editing, setEditing] = useState(mode !== 'view')
  const [form, setForm] = useState(() =>
    initial ? rowToForm(initial) : { ...emptyProfileForm },
  )

  useEffect(() => {
    setForm(initial ? rowToForm(initial) : { ...emptyProfileForm })
    setEditing(mode !== 'view')
  }, [initial, mode])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const canSave = isProfileComplete(form) && !busy
  const hint = canSave ? '' : profileMissingHint(form)
  const isOnboard = mode === 'onboard'
  const showForm = isOnboard || editing

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSave) return
    onSave(normalizeBirthForm(form))
  }

  const rows = initial
    ? [
        { label: '이름', value: initial.name?.trim() || '이름 없음' },
        {
          label: '생년월일',
          value: `${formatCalendarLabel(initial.calendar_type)} ${formatBirthDateLabel(initial)}`.trim(),
        },
        { label: '태어난 시간', value: formatBirthTimeLabel(initial) },
        { label: '성별', value: formatGenderLabel(initial.gender) },
      ]
    : []

  return (
    <div
      className="profile-modal-backdrop"
      role="presentation"
      onClick={isOnboard ? undefined : onClose}
    >
      <div
        className={`profile-modal${isOnboard ? ' profile-modal--peek' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        {isOnboard ? (
          <div className="profile-modal-peek" aria-hidden="true">
            <Mascot size="lg" />
          </div>
        ) : null}
        <header className="profile-modal-head">
          <p className="profile-modal-kicker">
            {isOnboard ? '안녕하세요' : '내 프로필'}
          </p>
          <h2 id={titleId}>
            {isOnboard
              ? '물개에게 사주 정보를 알려 주세요'
              : showForm
                ? '출생 정보 수정'
                : '내 프로필'}
          </h2>
          <p className="profile-modal-sub">
            {isOnboard
              ? '한 번만 적어두면, 다음부터는 물개가 바로 읽어 줄게요'
              : showForm
                ? '바꾼 내용은 새로 읽는 사주부터 반영돼요. 지난 기록은 그대로 둘게요.'
                : '저장된 출생 정보예요. 필요할 때만 고쳐 주세요.'}
          </p>
        </header>

        {!showForm ? (
          <div className="profile-view">
            <dl className="profile-view-list">
              {rows.map((row) => (
                <div key={row.label} className="profile-view-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value || '—'}</dd>
                </div>
              ))}
            </dl>
            <div className="profile-modal-actions">
              <button type="button" className="auth-btn" onClick={onClose}>
                닫기
              </button>
              <button
                type="button"
                className="submit-btn profile-modal-submit"
                onClick={() => setEditing(true)}
              >
                정보 수정
              </button>
            </div>
          </div>
        ) : (
          <form className="profile-modal-form" onSubmit={handleSubmit}>
            <label className="field" htmlFor="profile-name">
              <span className="field-label">
                이름 <span className="field-optional">(선택)</span>
              </span>
              <input
                id="profile-name"
                type="text"
                placeholder="홍길동"
                autoComplete="name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>

            <BirthFields
              idPrefix="profile-"
              form={form}
              setForm={setForm}
              required
              showFormatHints
            />

            {hint ? (
              <p className="submit-hint" aria-live="polite">
                {hint}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="status status--error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <div className="profile-modal-actions">
              {!isOnboard ? (
                <button
                  type="button"
                  className="auth-btn"
                  onClick={() => {
                    if (mode === 'view') {
                      setForm(initial ? rowToForm(initial) : form)
                      setEditing(false)
                    } else {
                      onClose?.()
                    }
                  }}
                  disabled={busy}
                >
                  {mode === 'view' ? '뒤로' : '닫기'}
                </button>
              ) : null}
              <SubmitButton
                type="submit"
                className="profile-modal-submit"
                disabled={!canSave}
                busy={busy}
                busyLabel="저장 중…"
              >
                {isOnboard ? '저장하기' : '프로필 저장'}
              </SubmitButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
