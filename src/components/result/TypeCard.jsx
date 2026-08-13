import { memo } from 'react'
import { cardPalette } from '../../lib/shareCard'
import './TypeCard.css'

export const TypeCard = memo(function TypeCard({
  meta,
  footer,
  eyebrow = '물개가 본 유형',
}) {
  const palette = cardPalette(meta.type)
  return (
    <section
      className="share-card"
      style={{ '--card-from': palette.from, '--card-to': palette.to }}
      aria-label="사주 유형 카드"
    >
      <div className="share-card-glow" aria-hidden="true" />
      <span className="share-card-han" aria-hidden="true">
        {palette.han}
      </span>
      <p className="share-card-eyebrow">{eyebrow}</p>
      <h2 className="share-card-type">{meta.type}</h2>
      <p className="share-card-line">{meta.oneliner}</p>
      {meta.chemistry ? (
        <p className="share-card-chem">케미 · {meta.chemistry}</p>
      ) : null}
      {meta.keywords.length > 0 ? (
        <ul className="share-card-tags" aria-label="키워드">
          {meta.keywords.map((kw) => (
            <li key={kw}>#{kw}</li>
          ))}
        </ul>
      ) : null}
      {footer}
    </section>
  )
})
