import { memo, useEffect, useMemo, useState } from 'react'
import { trackEvent } from '../../lib/ga'
import { listSectionTitles } from '../../lib/listSectionTitles'
import {
  downloadShareImage,
  parseShareMeta,
  shareReading,
  syncCardUrl,
} from '../../lib/shareCard'
import { buildResultUrl, createSharedResult } from '../../lib/sharedResult'
import { matchTopic, RESULT_TOPICS } from '../../lib/uxCopy'
import { InterpretationBody } from './Interpretation'
import { TypeCard } from './TypeCard'
import './ResultPanel.css'

function statusFromError(error, fallback) {
  return error instanceof Error ? error.message : fallback
}

export const ResultPanel = memo(function ResultPanel({
  interpretation,
  name,
  onStatus,
  shareSlug: shareSlugProp = null,
  publicView = false,
}) {
  const meta = useMemo(
    () => parseShareMeta(interpretation, name),
    [interpretation, name],
  )
  const sectionTitles = useMemo(
    () => listSectionTitles(interpretation),
    [interpretation],
  )
  const topics = useMemo(
    () =>
      RESULT_TOPICS.map((topic) => {
        const title = sectionTitles.find((t) => matchTopic(t, topic))
        return title ? { ...topic, title } : null
      }).filter(Boolean),
    [sectionTitles],
  )

  const [shareState, setShareState] = useState('')
  const [saveState, setSaveState] = useState('')
  const [focusTitle, setFocusTitle] = useState(null)
  const [shareSlug, setShareSlug] = useState(shareSlugProp)

  useEffect(() => {
    setShareSlug(shareSlugProp)
  }, [shareSlugProp])

  useEffect(() => {
    const prev = document.title
    document.title = `${meta.type} · 사주 미`
    // 공개 /result 페이지만 slug URL 유지. 홈에서는 주소창을 바꾸지 않음.
    if (publicView && shareSlug) {
      const next = `/result?s=${encodeURIComponent(shareSlug)}`
      if (`${window.location.pathname}${window.location.search}` !== next) {
        history.replaceState(null, '', next)
      }
    } else if (!publicView) {
      syncCardUrl(meta)
    }
    return () => {
      document.title = prev
    }
  }, [meta, shareSlug, publicView])

  const ensureShareSlug = async () => {
    if (shareSlug) return shareSlug
    const slug = await createSharedResult({
      name: meta.name,
      interpretation,
    })
    setShareSlug(slug)
    return slug
  }

  const handleShare = async () => {
    setShareState('sharing')
    try {
      const slug = await ensureShareSlug()
      const result = await shareReading(meta, { resultSlug: slug })
      trackEvent('share', {
        method: result === 'shared' ? 'web_share' : 'clipboard',
        content_type: 'saju_result',
      })
      setShareState(result)
      onStatus?.(
        result === 'shared'
          ? '친구에게 보낼 준비 끝!'
          : '결과 링크를 복사했어요. 카톡에 붙여 보세요',
      )
      setTimeout(() => setShareState(''), 2000)
    } catch (err) {
      setShareState('')
      onStatus?.(statusFromError(err, '공유가 안 됐어요. 잠시 뒤 다시 눌러 주세요.'))
    }
  }

  const handleCopyLink = async () => {
    setShareState('sharing')
    try {
      const slug = await ensureShareSlug()
      const url = buildResultUrl(slug)
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setShareState('copied')
        trackEvent('copy_link', { content_type: 'saju_result' })
        onStatus?.('결과 링크를 복사했어요')
      } else {
        await shareReading(meta, { resultSlug: slug })
        setShareState('shared')
        trackEvent('share', {
          method: 'web_share',
          content_type: 'saju_result',
        })
      }
      setTimeout(() => setShareState(''), 2000)
    } catch (err) {
      setShareState('')
      onStatus?.(statusFromError(err, '링크 복사가 안 됐어요. 잠시 뒤 다시 눌러 주세요.'))
    }
  }

  const handleSave = async () => {
    setSaveState('saving')
    try {
      await downloadShareImage(meta)
      setSaveState('saved')
      trackEvent('save_image', { content_type: 'saju_result' })
      onStatus?.('스토리용 이미지를 저장해 두었어요')
      setTimeout(() => setSaveState(''), 2000)
    } catch (err) {
      setSaveState('')
      onStatus?.(statusFromError(err, '이미지를 못 만들었어요. 잠시 뒤 다시 눌러 주세요.'))
    }
  }

  const shareLabel =
    shareState === 'copied'
      ? '복사됨'
      : shareState === 'shared'
        ? '공유됨'
        : shareState === 'sharing'
          ? '준비 중…'
          : '친구에게 보내기'

  const saveLabel =
    saveState === 'saved'
      ? '저장됨'
      : saveState === 'saving'
        ? '만드는 중…'
        : '이미지 저장'

  const displayName = meta.name === '나' ? '당신' : `${meta.name}님`

  return (
    <article className="result" aria-live="polite">
      <div className="result-lead">
        <p className="result-lead-kicker">
          물개가 본 {displayName} 사주, 한 장으로 말하면
        </p>
        <TypeCard
          meta={meta}
          footer={
            <div className="share-card-foot share-card-foot--actions">
              <span className="share-card-name">{meta.name}</span>
              <div className="share-card-actions">
                <button
                  type="button"
                  className="share-btn share-btn--ghost"
                  onClick={handleSave}
                  disabled={saveState === 'saving'}
                >
                  {saveLabel}
                </button>
                <button
                  type="button"
                  className="share-btn"
                  onClick={handleShare}
                  disabled={shareState === 'sharing'}
                >
                  {shareLabel}
                </button>
              </div>
            </div>
          }
        />
      </div>

      {topics.length > 0 ? (
        <nav className="topic-chips" aria-label="궁금한 분야">
          <p className="topic-chips-label">궁금한 분야</p>
          <div className="topic-chips-row">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className={`topic-chip${focusTitle === topic.title ? ' is-active' : ''}`}
                onClick={() => setFocusTitle(topic.title)}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </nav>
      ) : null}

      <div className="result-text-card">
        <header className="result-text-head">
          <div>
            <h2>물개 해석</h2>
            <p className="result-text-sub">궁금한 부분만 펼쳐 읽어 보세요</p>
          </div>
        </header>
        <InterpretationBody text={interpretation} focusTitle={focusTitle} />
      </div>

      <div className="result-share-bar">
        <p className="result-share-bar-copy">
          {publicView
            ? '이 결과도 친구에게 보내볼까요?'
            : '전체 해석 페이지 링크로 친구에게 공유해요'}
        </p>
        <div className="result-share-bar-actions">
          <button
            type="button"
            className="share-btn share-btn--ghost"
            onClick={handleCopyLink}
            disabled={shareState === 'sharing'}
          >
            링크 복사
          </button>
          <button
            type="button"
            className="share-btn"
            onClick={handleShare}
            disabled={shareState === 'sharing'}
          >
            {shareLabel}
          </button>
        </div>
      </div>
    </article>
  )
})
