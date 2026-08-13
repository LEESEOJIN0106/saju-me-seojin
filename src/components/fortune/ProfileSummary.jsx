import {
  formatBirthDateLabel,
  formatBirthTimeLabel,
  formatCalendarLabel,
  formatGenderLabel,
} from '../../lib/birth'
import { SubmitButton } from '../ui/SubmitButton'

export function ProfileSummary({
  profile,
  isLoading,
  onOpenProfile,
  onInterpret,
  onOpenGuestForm,
}) {
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
