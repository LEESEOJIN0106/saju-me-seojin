import { useRef } from 'react'
import {
  clampDay,
  completePartialBirthTime,
  digitsOnly,
  formatBirthTimeInput,
  isValidBirthDate,
  isValidBirthTime,
  pad2,
} from '../../lib/birth'
import './BirthFields.css'

export function BirthFields({
  idPrefix,
  form,
  setForm,
  required = false,
  includeGender = true,
  showFormatHints = false,
}) {
  const monthRef = useRef(null)
  const dayRef = useRef(null)
  const timeRef = useRef(null)

  const patch = (next) => setForm((prev) => ({ ...prev, ...next }))
  const requiredMark = required ? (
    <span className="field-required">필수</span>
  ) : null

  return (
    <>
      <fieldset className="field">
        <legend className="field-label">달력 {requiredMark}</legend>
        <div className="segmented" role="group" aria-label="양력 또는 음력">
          <label className={form.calendarType === 'solar' ? 'is-active' : ''}>
            <input
              type="radio"
              name={`${idPrefix}calendar`}
              value="solar"
              checked={form.calendarType === 'solar'}
              onChange={() => patch({ calendarType: 'solar' })}
            />
            <span className="segment-icon" aria-hidden="true">
              ☀
            </span>
            양력
          </label>
          <label className={form.calendarType === 'lunar' ? 'is-active' : ''}>
            <input
              type="radio"
              name={`${idPrefix}calendar`}
              value="lunar"
              checked={form.calendarType === 'lunar'}
              onChange={() => patch({ calendarType: 'lunar' })}
            />
            <span className="segment-icon" aria-hidden="true">
              ☽
            </span>
            음력
          </label>
        </div>
      </fieldset>

      <fieldset className="field">
        <legend className="field-label">생년월일 {requiredMark}</legend>
        <div className="date-inputs" role="group" aria-label="생년월일">
          <label className="date-input" htmlFor={`${idPrefix}year`}>
            <input
              id={`${idPrefix}year`}
              type="text"
              inputMode="numeric"
              autoComplete="bday-year"
              placeholder={required ? 'YYYY' : '1990'}
              maxLength={4}
              value={form.birthYear}
              onChange={(e) => {
                const nextYear = digitsOnly(e.target.value, 4)
                setForm((prev) => ({
                  ...prev,
                  birthYear: nextYear,
                  birthDay: clampDay(nextYear, prev.birthMonth, prev.birthDay),
                }))
                if (nextYear.length === 4) monthRef.current?.focus()
              }}
            />
            <span className="date-input-unit">년</span>
          </label>
          <label className="date-input" htmlFor={`${idPrefix}month`}>
            <input
              id={`${idPrefix}month`}
              ref={monthRef}
              type="text"
              inputMode="numeric"
              autoComplete="bday-month"
              placeholder={required ? 'MM' : '01'}
              maxLength={2}
              value={form.birthMonth}
              onChange={(e) => {
                const nextMonth = digitsOnly(e.target.value, 2)
                setForm((prev) => ({
                  ...prev,
                  birthMonth: nextMonth,
                  birthDay: clampDay(prev.birthYear, nextMonth, prev.birthDay),
                }))
                if (nextMonth.length === 2) dayRef.current?.focus()
              }}
              onBlur={() => {
                if (form.birthMonth) patch({ birthMonth: pad2(form.birthMonth) })
              }}
            />
            <span className="date-input-unit">월</span>
          </label>
          <label className="date-input" htmlFor={`${idPrefix}day`}>
            <input
              id={`${idPrefix}day`}
              ref={dayRef}
              type="text"
              inputMode="numeric"
              autoComplete="bday-day"
              placeholder={required ? 'DD' : '15'}
              maxLength={2}
              value={form.birthDay}
              onChange={(e) => {
                const nextDay = digitsOnly(e.target.value, 2)
                patch({ birthDay: nextDay })
                if (nextDay.length === 2 && !form.timeUnknown) {
                  timeRef.current?.focus()
                }
              }}
              onBlur={() => {
                if (form.birthDay) patch({ birthDay: pad2(form.birthDay) })
              }}
            />
            <span className="date-input-unit">일</span>
          </label>
        </div>
      </fieldset>

      <div className="field-row">
        <label className="field" htmlFor={`${idPrefix}time`}>
          <span className="field-label">태어난 시간 {requiredMark}</span>
          <input
            id={`${idPrefix}time`}
            ref={timeRef}
            type="text"
            inputMode="numeric"
            placeholder="14:30"
            maxLength={5}
            value={form.birthTime}
            disabled={form.timeUnknown}
            onChange={(e) => {
              patch({
                birthTime: formatBirthTimeInput(digitsOnly(e.target.value, 4)),
              })
            }}
            onBlur={() => {
              const nextTime = completePartialBirthTime(form.birthTime)
              if (nextTime !== form.birthTime) patch({ birthTime: nextTime })
            }}
          />
          <span className="field-hint">24시간 · 예) 0930 → 09:30</span>
        </label>
        <label className="check-field" htmlFor={`${idPrefix}time-unknown`}>
          <input
            id={`${idPrefix}time-unknown`}
            type="checkbox"
            checked={form.timeUnknown}
            onChange={(e) => {
              const checked = e.target.checked
              patch({
                timeUnknown: checked,
                birthTime: checked ? '' : form.birthTime,
              })
            }}
          />
          <span>출생시간을 모르겠어요</span>
        </label>
      </div>

      {showFormatHints &&
      !form.timeUnknown &&
      form.birthTime &&
      !isValidBirthTime(form.birthTime) ? (
        <p className="submit-hint">시간 형식을 확인해 주세요 (HH:MM)</p>
      ) : null}
      {showFormatHints &&
      !isValidBirthDate(form.birthYear, form.birthMonth, form.birthDay) &&
      form.birthYear.length === 4 ? (
        <p className="submit-hint">올바른 생년월일을 입력해 주세요</p>
      ) : null}

      {includeGender ? (
        <GenderField
          idPrefix={idPrefix}
          form={form}
          patch={patch}
          required={required}
        />
      ) : null}
    </>
  )
}

export function GenderField({
  idPrefix,
  form,
  patch,
  required = false,
  invalid = false,
}) {
  return (
    <fieldset className="field">
      <legend className={`field-label${required ? '' : ' visually-hidden'}`}>
        {required ? (
          <>
            성별 <span className="field-required">필수</span>
          </>
        ) : (
          '성별 선택'
        )}
      </legend>
      <div
        className={`segmented${invalid ? ' is-incomplete' : ''}`}
        role="group"
        aria-label="성별"
      >
        <label className={form.gender === 'male' ? 'is-active' : ''}>
          <input
            type="radio"
            name={`${idPrefix}gender`}
            value="male"
            checked={form.gender === 'male'}
            onChange={() => patch({ gender: 'male' })}
          />
          남성
        </label>
        <label className={form.gender === 'female' ? 'is-active' : ''}>
          <input
            type="radio"
            name={`${idPrefix}gender`}
            value="female"
            checked={form.gender === 'female'}
            onChange={() => patch({ gender: 'female' })}
          />
          여성
        </label>
      </div>
    </fieldset>
  )
}
