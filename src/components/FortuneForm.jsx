import {
  formatBirthDateLabel,
  formatBirthTimeLabel,
  formatCalendarLabel,
  formatGenderLabel,
} from '../lib/birth'
import { BirthFields, GenderField } from './BirthFields'
import { SubmitButton } from './SubmitButton'

function ProfileSummary({ profile, isLoading, onOpenProfile, onInterpret, onOpenGuestForm }) {
  return (
    <section className="profile-summary" aria-label="내 사주 정보">
      <div className="profile-summary-head">
        <h2>내 사주 정보</h2>
        <button type="button" className="readings-new-btn" onClick={onOpenProfile}>
          정보 수정
        </button>
      </div>
      <dl className="profile-view-list">
        <div className="profile-view-row">
          <dt>이름</dt>
          <dd>{profile.name?.trim() || '이름 없음'}</dd>
        </div>
        <div className="profile-view-row">
          <dt>생년월일</dt>
          <dd>
            {formatCalendarLabel(profile.calendar_type)}{' '}
            {formatBirthDateLabel(profile)}
          </dd>
        </div>
        <div className="profile-view-row">
          <dt>태어난 시간</dt>
          <dd>{formatBirthTimeLabel(profile)}</dd>
        </div>
        <div className="profile-view-row">
          <dt>성별</dt>
          <dd>{formatGenderLabel(profile.gender)}</dd>
        </div>
      </dl>
      <SubmitButton
        busy={isLoading}
        busyLabel="물개가 읽는 중…"
        disabled={isLoading}
        onClick={onInterpret}
      >
        <span className="submit-icon" aria-hidden="true">
          ✦
        </span>
        물개에게 읽어 달라고 하기
      </SubmitButton>
      <button type="button" className="guest-form-toggle" onClick={onOpenGuestForm}>
        다른 사람 사주 보기
      </button>
    </section>
  )
}

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
        <form className="form" onSubmit={onSubmit}>
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

          <section className="field-group" aria-labelledby="section-gender">
            <h2 id="section-gender">
              <span className="section-num">參</span> 성별
            </h2>
            <GenderField idPrefix="birth-" form={form} patch={patch} />
          </section>

          {missingHint ? (
            <p className="submit-hint" aria-live="polite">
              {missingHint}
            </p>
          ) : null}

          <SubmitButton
            type="submit"
            busy={isLoading}
            busyLabel="물개가 읽는 중…"
            disabled={!canSubmit}
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
