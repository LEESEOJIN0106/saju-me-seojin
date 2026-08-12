import { memo } from 'react'
import { SAMPLE_BASIC_CHART } from '../lib/sajuPrompt'

const PILLAR_ORDER = [
  { key: 'year', label: '년주' },
  { key: 'month', label: '월주' },
  { key: 'day', label: '일주' },
  { key: 'hour', label: '시주' },
]

const STEM_ELEMENT = {
  갑: 'wood',
  을: 'wood',
  병: 'fire',
  정: 'fire',
  무: 'earth',
  기: 'earth',
  경: 'metal',
  신: 'metal',
  임: 'water',
  계: 'water',
}

const BRANCH_ELEMENT = {
  자: 'water',
  축: 'earth',
  인: 'wood',
  묘: 'wood',
  진: 'earth',
  사: 'fire',
  오: 'fire',
  미: 'earth',
  신: 'metal',
  유: 'metal',
  술: 'earth',
  해: 'water',
}

const ELEMENT_LABEL = {
  wood: '목',
  fire: '화',
  earth: '토',
  metal: '금',
  water: '수',
}

function getCharElement(char, kind) {
  const map = kind === 'stem' ? STEM_ELEMENT : BRANCH_ELEMENT
  return map[char] ?? null
}

function PillarChar({ char, kind }) {
  const element = getCharElement(char, kind)
  return (
    <div className="pillar-char">
      {char}
      {element ? (
        <span className={`badge badge--${element}`}>
          {ELEMENT_LABEL[element]}
        </span>
      ) : null}
    </div>
  )
}

export const PillarGrid = memo(function PillarGrid({
  chart = SAMPLE_BASIC_CHART,
}) {
  return (
    <div className="pillar-grid" aria-label="사주 네 기둥">
      {PILLAR_ORDER.map(({ key, label }, index) => {
        const pillar = chart.pillars[key] ?? ''
        return (
          <div
            key={key}
            className={`pillar-card pillar-card--${index + 1}`}
          >
            <span className="pillar-label">{label}</span>
            <div className="pillar-chars">
              <PillarChar char={pillar[0] ?? ''} kind="stem" />
              <PillarChar char={pillar[1] ?? ''} kind="branch" />
            </div>
          </div>
        )
      })}
    </div>
  )
})
