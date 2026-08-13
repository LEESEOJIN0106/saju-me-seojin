import { memo, useMemo, useState } from 'react'
import { SAMPLE_BASIC_CHART } from '../lib/sajuPrompt'
import { listSectionTitles } from '../lib/listSectionTitles'
import { parseShareMeta, shareReading } from '../lib/shareCard'
import { matchTopic, RESULT_TOPICS } from '../lib/uxCopy'
import { InterpretationBody } from './Interpretation'
import { PillarGrid } from './PillarGrid'

const ShareCard = memo(function ShareCard({ meta, onShare, shareState }) {
  const shareLabel =
    shareState === 'copied'
      ? '복사됨'
      : shareState === 'shared'
        ? '공유됨'
        : shareState === 'sharing'
          ? '준비 중…'
          : '카드 공유하기'

  return (
    <section className="share-card" aria-label="사주 유형 카드">
      <div className="share-card-glow" aria-hidden="true" />
      <p className="share-card-eyebrow">나의 사주 유형</p>
      <h2 className="share-card-type">{meta.type}</h2>
      <p className="share-card-line">{meta.oneliner}</p>
      {meta.keywords.length > 0 ? (
        <ul className="share-card-tags" aria-label="키워드">
          {meta.keywords.map((kw) => (
            <li key={kw}>#{kw}</li>
          ))}
        </ul>
      ) : null}
      <div className="share-card-foot">
        <span className="share-card-name">{meta.name}</span>
        <button
          type="button"
          className="share-btn"
          onClick={onShare}
          disabled={shareState === 'sharing'}
        >
          {shareLabel}
        </button>
      </div>
    </section>
  )
})

export const ResultPanel = memo(function ResultPanel({
  interpretation,
  name,
  onStatus,
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
  const [focusTitle, setFocusTitle] = useState(null)
  const [showChart, setShowChart] = useState(false)

  const handleShare = async () => {
    setShareState('sharing')
    try {
      const result = await shareReading(meta)
      setShareState(result)
      onStatus?.(
        result === 'shared' ? '공유 시트를 열었습니다' : '공유 문구를 복사했어요',
      )
      setTimeout(() => setShareState(''), 2000)
    } catch (err) {
      setShareState('')
      onStatus?.(
        err instanceof Error ? err.message : '공유에 실패했어요. 잠시 후 다시 시도해 주세요.',
      )
    }
  }

  const displayName = meta.name === '나' ? '당신' : `${meta.name}님`

  return (
    <article className="result" aria-live="polite">
      <div className="result-lead">
        <p className="result-lead-kicker">{displayName}의 사주를 쉽게 풀어보면</p>
        <ShareCard meta={meta} onShare={handleShare} shareState={shareState} />
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
            <h2>쉬운 해석</h2>
            <p className="result-text-sub">원하는 부분만 펼쳐 읽어보세요</p>
          </div>
        </header>
        <InterpretationBody text={interpretation} focusTitle={focusTitle} />
      </div>

      <details
        className="chart-details"
        open={showChart}
        onToggle={(e) => setShowChart(e.currentTarget.open)}
      >
        <summary className="chart-details-summary">
          {showChart ? '사주 차트 접기' : '사주 차트 자세히 보기'}
        </summary>
        <p className="chart-details-hint">
          네 기둥은 참고용이에요. 위에서 읽은 쉬운 설명이 더 중요합니다.
        </p>
        <PillarGrid chart={SAMPLE_BASIC_CHART} />
      </details>
    </article>
  )
})
