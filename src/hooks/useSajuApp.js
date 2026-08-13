import { useEffect, useRef, useState } from 'react'
import { isValidBirthDate, isValidBirthTime, normalizeBirthForm } from '../lib/birth'
import { interpretBasicChart } from '../lib/gemini'
import {
  clearPending,
  readPending,
  writePending,
} from '../lib/pendingReading'
import {
  emptyProfileForm,
  isProfileComplete,
  profileMissingHint,
  rowToForm,
} from '../lib/profile'
import {
  deleteReading,
  fetchProfile,
  fetchReadings,
  saveReading,
  upsertProfile,
} from '../lib/sajuApi'
import { parseCardSearch } from '../lib/shareCard'
import { supabase } from '../lib/supabase'
import { friendlyError } from '../lib/uxCopy'
import { useStatusToast } from './useStatusToast'

// ponytail: module lock so Strict Mode double-boot doesn't insert the same guest reading twice
let pendingApplyStarted = false

function inboundFromWindow() {
  if (typeof window === 'undefined') return null
  return parseCardSearch(window.location.search)
}

export function useSajuApp() {
  const [form, setForm] = useState(() => readPending()?.form ?? emptyProfileForm)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, showStatus] = useStatusToast()
  const [interpretation, setInterpretation] = useState(
    () => readPending()?.interpretation ?? '',
  )
  const [readings, setReadings] = useState([])
  const [readingsLoading, setReadingsLoading] = useState(true)
  const [activeReadingId, setActiveReadingId] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [guestFormOpen, setGuestFormOpen] = useState(false)
  const [authBusy, setAuthBusy] = useState(false)
  const [applyingPending, setApplyingPending] = useState(() =>
    typeof window === 'undefined' ? false : Boolean(readPending()),
  )
  const [inboundCard, setInboundCard] = useState(inboundFromWindow)

  const formCardRef = useRef(null)
  const resultRef = useRef(null)

  const birthDateValid = isValidBirthDate(
    form.birthYear,
    form.birthMonth,
    form.birthDay,
  )
  const birthTimeValid = form.timeUnknown || isValidBirthTime(form.birthTime)
  const profileReady = isProfileComplete(profile)
  const needsOnboarding =
    Boolean(user) && !profileLoading && !profileReady && !applyingPending
  const isRecalling = Boolean(activeReadingId)
  const canSubmit =
    birthDateValid &&
    birthTimeValid &&
    Boolean(form.gender) &&
    !isLoading &&
    (user ? profileReady || guestFormOpen || isRecalling : true)

  let missingHint = ''
  if (!canSubmit && !isLoading) {
    if (user && !profileReady && !guestFormOpen && !isRecalling) {
      missingHint = '프로필에 출생 정보를 저장하면 바로 풀어볼 수 있어요'
    } else {
      missingHint = profileMissingHint(form)
    }
  }

  const loadReadings = async (userId) => {
    if (!userId) {
      setReadings([])
      setActiveReadingId(null)
      setInterpretation('')
      setReadingsLoading(false)
      return
    }

    setReadingsLoading(true)
    try {
      setReadings(await fetchReadings(userId))
    } catch (error) {
      console.error(error)
      setErrorMessage(friendlyError(error))
    } finally {
      setReadingsLoading(false)
    }
  }

  const loadProfile = async (userId, { fillForm = true } = {}) => {
    if (!userId) {
      setProfile(null)
      setProfileLoading(false)
      return null
    }

    setProfileLoading(true)
    try {
      const loadedProfile = await fetchProfile(userId)
      setProfile(loadedProfile)
      if (fillForm && isProfileComplete(loadedProfile)) {
        setForm(rowToForm(loadedProfile))
      }
      return loadedProfile
    } catch (error) {
      console.error(error)
      setProfile(null)
      setErrorMessage(friendlyError(error))
      return null
    } finally {
      setProfileLoading(false)
    }
  }

  const saveProfile = async (nextForm, userId = user?.id) => {
    if (!userId) throw new Error('로그인이 필요합니다.')
    const savedProfile = await upsertProfile(userId, nextForm)
    setProfile(savedProfile)
    setForm(rowToForm(savedProfile))
    return savedProfile
  }

  const persistReading = async (
    userId,
    sourceForm,
    interpretationText,
    readingId = null,
  ) => {
    const savedReading = await saveReading(
      userId,
      sourceForm,
      interpretationText,
      readingId,
    )
    setActiveReadingId(savedReading.id)
    setReadings((prev) => [
      savedReading,
      ...prev.filter((reading) => reading.id !== savedReading.id),
    ])
    return savedReading
  }

  const restoreGuestWorkspace = () => {
    const pending = readPending()
    if (pending) {
      setForm(pending.form)
      setInterpretation(pending.interpretation)
      return pending
    }
    setForm(emptyProfileForm)
    setInterpretation('')
    return null
  }

  useEffect(() => {
    const boot = async (sessionUser) => {
      setUser(sessionUser)
      if (!sessionUser) {
        setReadings([])
        setActiveReadingId(null)
        setProfile(null)
        setEditProfileOpen(false)
        setGuestFormOpen(false)
        setProfileError('')
        restoreGuestWorkspace()
        setErrorMessage('')
        setReadingsLoading(false)
        setApplyingPending(Boolean(readPending()))
        return
      }

      const pending = readPending()
      const takePending = Boolean(pending) && !pendingApplyStarted
      if (takePending) pendingApplyStarted = true
      setApplyingPending(takePending)

      if (pending) {
        setForm(pending.form)
        setInterpretation(pending.interpretation)
      }

      const loadedProfile = await loadProfile(sessionUser.id, {
        fillForm: !pending,
      })
      await loadReadings(sessionUser.id)

      if (!takePending) {
        if (!pendingApplyStarted) setApplyingPending(false)
        return
      }

      try {
        if (
          !isProfileComplete(loadedProfile) &&
          isProfileComplete(pending.form)
        ) {
          await saveProfile(pending.form, sessionUser.id)
        }
        await persistReading(
          sessionUser.id,
          pending.form,
          pending.interpretation,
        )
        clearPending()
        showStatus('기록을 쏙 넣어 두었어요')
      } catch (error) {
        pendingApplyStarted = false
        setErrorMessage(friendlyError(error))
      } finally {
        setApplyingPending(false)
      }
    }

    supabase.auth.getSession().then(({ data: sessionData }) => {
      boot(sessionData.session?.user ?? null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      boot(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [showStatus])

  useEffect(() => {
    if (!interpretation || isLoading) return
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [interpretation, isLoading])

  const handleGoogleSignIn = async () => {
    if (!user && interpretation) writePending({ form, interpretation })
    setAuthBusy(true)
    setErrorMessage('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    if (error) {
      setErrorMessage(friendlyError(error))
      setAuthBusy(false)
    }
  }

  const handleSignOut = async () => {
    setAuthBusy(true)
    const { error } = await supabase.auth.signOut()
    if (error) setErrorMessage(friendlyError(error))
    else showStatus('로그아웃했어요')
    setAuthBusy(false)
  }

  const resetForm = ({ useProfile = false } = {}) => {
    setForm(
      useProfile && isProfileComplete(profile)
        ? rowToForm(profile)
        : emptyProfileForm,
    )
    setActiveReadingId(null)
    setInterpretation('')
    setErrorMessage('')
    setInboundCard(inboundFromWindow())
  }

  const handleNewInput = () => {
    resetForm()
    setGuestFormOpen(true)
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    showStatus('다른 사람 사주도 물개가 읽어 줄게요')
  }

  const handleUseMyProfile = () => {
    if (!isProfileComplete(profile)) {
      setEditProfileOpen(true)
      return
    }
    resetForm({ useProfile: true })
    setGuestFormOpen(false)
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    showStatus('내 사주로 돌아올게요')
  }

  const handleOpenProfile = () => {
    setProfileError('')
    setEditProfileOpen(true)
  }

  const handleSaveProfile = async (nextForm) => {
    const wasOnboard = needsOnboarding
    setProfileBusy(true)
    setProfileError('')
    try {
      await saveProfile(nextForm)
      setEditProfileOpen(false)
      setGuestFormOpen(false)
      showStatus(
        wasOnboard
          ? '프로필 저장 완료! 이제 물개가 읽어 줄게요'
          : '프로필을 고쳐 두었어요',
      )
    } catch (error) {
      setProfileError(friendlyError(error))
    } finally {
      setProfileBusy(false)
    }
  }

  const runInterpretation = async (sourceForm, { readingId = null } = {}) => {
    if (user?.id && !profileReady && !readingId && !guestFormOpen) {
      throw new Error('프로필을 먼저 저장해 주면 읽어 줄게요.')
    }

    const normalized = normalizeBirthForm(sourceForm)
    const interpretationText = await interpretBasicChart(normalized)
    setInterpretation(interpretationText)
    setForm(normalized)

    if (!user?.id) {
      writePending({ form: normalized, interpretation: interpretationText })
      setActiveReadingId(null)
      return null
    }

    return persistReading(user.id, normalized, interpretationText, readingId)
  }

  const handleInterpretProfile = async () => {
    if (!profileReady || isLoading) return
    setIsLoading(true)
    setErrorMessage('')
    setInterpretation('')
    setGuestFormOpen(false)
    try {
      await runInterpretation(rowToForm(profile))
      showStatus('기록을 쏙 넣어 두었어요')
    } catch (error) {
      setErrorMessage(friendlyError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsLoading(true)
    setErrorMessage('')
    setInterpretation('')

    try {
      const wasUpdate = Boolean(activeReadingId)
      await runInterpretation(form, {
        readingId: user ? activeReadingId : null,
      })
      if (user) {
        showStatus(
          wasUpdate ? '기록을 고쳐 두었어요' : '기록을 쏙 넣어 두었어요',
        )
      }
    } catch (error) {
      setErrorMessage(friendlyError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReading = async (reading) => {
    if (!confirm(`${reading.name || '이름 없음'} 기록을 지울까요?`)) return

    try {
      await deleteReading(reading.id)
    } catch (error) {
      setErrorMessage(friendlyError(error))
      return
    }

    setReadings((prev) => prev.filter((row) => row.id !== reading.id))
    if (activeReadingId === reading.id) resetForm({ useProfile: true })
    showStatus('기록을 치워 두었어요')
  }

  const handleSelectReading = (reading) => {
    if (activeReadingId === reading.id) {
      setActiveReadingId(null)
      setInterpretation('')
      showStatus('결과를 접어 두었어요')
      return
    }

    setActiveReadingId(reading.id)
    setForm(rowToForm(reading))
    setInterpretation(reading.interpretation)
    setErrorMessage('')
    showStatus(`${reading.name || '이름 없음'} 기록을 꺼내 왔어요`)
  }

  const handleRetry = () => {
    setErrorMessage('')
    if (profileReady && !guestFormOpen && !isRecalling) {
      handleInterpretProfile()
      return
    }
    formCardRef.current?.querySelector('form')?.requestSubmit()
  }

  const handleGuestReset = () => {
    setInterpretation('')
    clearPending()
  }

  const handleOpenGuestForm = () => {
    resetForm()
    setGuestFormOpen(true)
  }

  return {
    form,
    setForm,
    isLoading,
    errorMessage,
    statusMessage,
    showStatus,
    interpretation,
    readings,
    readingsLoading,
    activeReadingId,
    user,
    profile,
    profileBusy,
    profileError,
    editProfileOpen,
    setEditProfileOpen,
    guestFormOpen,
    authBusy,
    inboundCard,
    formCardRef,
    resultRef,
    profileReady,
    needsOnboarding,
    isRecalling,
    canSubmit,
    missingHint,
    handleGoogleSignIn,
    handleSignOut,
    handleNewInput,
    handleUseMyProfile,
    handleOpenProfile,
    handleSaveProfile,
    handleInterpretProfile,
    handleSubmit,
    handleDeleteReading,
    handleSelectReading,
    handleRetry,
    handleGuestReset,
    handleOpenGuestForm,
    setProfileError,
  }
}
