import { memo, useMemo, useState } from 'react'
import { SAMPLE_BASIC_CHART } from '../lib/sajuPrompt'
import { parseShareMeta, shareReading } from '../lib/shareCard'
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
      <p className="share-card-eyebrow">MY SAJU TYPE</p>
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
  const [shareState, setShareState] = useState('')

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
        err instanceof Error ? err.message : '공유에 실패했습니다.',
      )
    }
  }

  return (
    <article className="result" aria-live="polite">
      <ShareCard meta={meta} onShare={handleShare} shareState={shareState} />

      <div className="result-summary">
        <h2>기본 차트 해석</h2>
        <p>사주 명식을 바탕으로 성격·기질·재능의 흐름을 읽습니다.</p>
      </div>

      <PillarGrid chart={SAMPLE_BASIC_CHART} />

      <div className="result-text-card">
        <header className="result-text-head">
          <h2>해석</h2>
          <span className="result-text-badge" aria-hidden="true">
            解
          </span>
        </header>
        <InterpretationBody text={interpretation} />
      </div>
    </article>
  )
})
