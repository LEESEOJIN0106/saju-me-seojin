import { useRef, useState } from 'react'
import { BirthFields, GenderField } from '../ui/BirthFields'
import { SubmitButton } from '../ui/SubmitButton'
import { ProfileSummary } from './ProfileSummary'
import './FortuneForm.css'

export function FortuneForm({
  formCardRef,
  isRecalling,
  profileReady,
  guestFormOpen,
  profile,
  form,
  setForm,
  isLoading,
  canSubmit,
  missingHint,
  onOpenProfile,
  onInterpretProfile,
  onUseMyProfile,
  onOpenGuestForm,
  onSubmit,
}) {
  const showSummary = profileReady && !guestFormOpen && !isRecalling
  const patch = (next) => setForm((prev) => ({ ...prev, ...next }))
  const [triedSubmit, setTriedSubmit] = useState(false)
  const genderSectionRef = useRef(null)
  const genderMissing = triedSubmit && Boolean(missingHint) && !form.gender

  const handleFormSubmit = (e) => {
    setTriedSubmit(true)
    if (!canSubmit) {
      e.preventDefault()
      if (!form.gender) {
        genderSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
      return
    }
    onSubmit(e)
  }

  return (
    <div
      className={`form-card${isRecalling ? ' is-recalling' : ''}`}
      ref={formCardRef}
    >
      <div className="form-card-corner form-card-corner--tl" aria-hidden="true" />
      <div className="form-card-corner form-card-corner--tr" aria-hidden="true" />
      <div className="form-card-corner form-card-corner--bl" aria-hidden="true" />
      <div className="form-card-corner form-card-corner--br" aria-hidden="true" />

      {isRecalling ? (
        <div className="form-recall" role="status">
          <span>기록에서 꺼낸 내용이에요 · 다시 누르면 접혀요</span>
          <button type="button" onClick={onUseMyProfile}>
            내 사주로
          </button>
        </div>
      ) : null}

      {showSummary ? (
        <ProfileSummary
          profile={profile}
          isLoading={isLoading}
          onOpenProfile={onOpenProfile}
          onInterpret={onInterpretProfile}
          onOpenGuestForm={onOpenGuestForm}
        />
      ) : (
        <form className="form" onSubmit={handleFormSubmit}>
          {profileReady && guestFormOpen && !isRecalling ? (
            <div className="form-recall form-recall--profile" role="status">
              <span>다른 사람 정보를 적는 중이에요</span>
              <button type="button" onClick={onUseMyProfile}>
                내 정보로
              </button>
            </div>
          ) : null}

          <section className="field-group" aria-labelledby="section-basic">
            <h2 id="section-basic">
              <span className="section-num">壹</span> 기본
            </h2>
            <label className="field" htmlFor="name">
              <span className="field-label">이름</span>
              <input
                id="name"
                type="text"
                placeholder="홍길동"
                autoComplete="name"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </label>
          </section>

          <section className="field-group" aria-labelledby="section-birth">
            <h2 id="section-birth">
              <span className="section-num">貳</span> 출생
            </h2>
            <BirthFields
              idPrefix="birth-"
              form={form}
              setForm={setForm}
              includeGender={false}
            />
          </section>

          <section
            className="field-group"
            aria-labelledby="section-gender"
            ref={genderSectionRef}
          >
            <h2 id="section-gender">
              <span className="section-num">參</span> 성별
            </h2>
            <GenderField
              idPrefix="birth-"
              form={form}
              patch={patch}
              invalid={genderMissing}
            />
          </section>

          {missingHint ? (
            <p
              className={`submit-hint${triedSubmit ? ' submit-hint--warn' : ''}`}
              aria-live="polite"
            >
              {missingHint}
            </p>
          ) : null}

          <SubmitButton
            type="submit"
            busy={isLoading}
            busyLabel="물개가 읽는 중…"
            disabled={isLoading}
          >
            <span className="submit-icon" aria-hidden="true">
              ✦
            </span>
            {isRecalling ? '다시 읽어 달라고 하기' : '물개에게 읽어 달라고 하기'}
          </SubmitButton>
        </form>
      )}
    </div>
  )
}
