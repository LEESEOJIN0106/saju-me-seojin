import { memo, useMemo } from 'react'
import { parseInterpretation } from '../lib/parseInterpretation'
import { stripShareHeader } from '../lib/shareCard'

function HighlightText({ text }) {
  const parts = text.split(/([''""][^''""]+[''""]|[（(][^）)]+[）)])/g)

  return parts.map((part, i) => {
    if (/^[''""].+[''""]$/.test(part)) {
      return (
        <em key={i} className="interp-em">
          {part.slice(1, -1)}
        </em>
      )
    }
    if (/^[（(].+[）)]$/.test(part)) {
      return (
        <span key={i} className="interp-paren">
          {part}
        </span>
      )
    }
    return part
  })
}

function InterpretationItem({ item, standalone = false }) {
  if (item.type === 'special') {
    return (
      <article
        className={`interp-special${standalone ? ' interp-special--solo' : ''}`}
      >
        <header className="interp-special-head">
          <span className="interp-special-marker" aria-hidden="true">
            {item.marker}
          </span>
          <h4>
            <HighlightText text={item.title} />
          </h4>
        </header>
        {item.body.length > 0 ? (
          <div className="interp-special-body">
            {item.body.map((sub, i) => (
              <InterpretationItem key={i} item={sub} />
            ))}
          </div>
        ) : null}
      </article>
    )
  }

  if (item.type === 'subitem') {
    const tone =
      item.label.includes('긍정') || item.label.includes('강점')
        ? 'positive'
        : item.label.includes('부정') || item.label.includes('약점')
          ? 'negative'
          : 'neutral'

    return (
      <div className={`interp-subitem interp-subitem--${tone}`}>
        <span className="interp-subitem-label">{item.label}</span>
        <p>
          <HighlightText text={item.content} />
        </p>
      </div>
    )
  }

  return (
    <p className="interp-para">
      <HighlightText text={item.content} />
    </p>
  )
}

export const InterpretationBody = memo(function InterpretationBody({ text }) {
  const bodyText = useMemo(() => stripShareHeader(text), [text])
  const blocks = useMemo(() => parseInterpretation(bodyText), [bodyText])

  return (
    <div className="interp-body">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`

        if (block.type === 'intro') {
          return (
            <div key={key} className="interp-intro">
              <span className="interp-intro-badge" aria-hidden="true">
                ✦
              </span>
              <p>
                <HighlightText text={block.content} />
              </p>
            </div>
          )
        }

        if (block.type === 'keywords') {
          return (
            <div key={key} className="interp-keywords">
              <p className="interp-keywords-text">
                <HighlightText text={block.content} />
              </p>
              {block.keywords.length > 0 ? (
                <ul className="interp-keyword-pills" aria-label="핵심 키워드">
                  {block.keywords.map((kw) => (
                    <li key={kw}>{kw}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )
        }

        if (block.type === 'section') {
          return (
            <section
              key={key}
              className="interp-section"
              style={{ '--section-i': block.number }}
            >
              <header className="interp-section-head">
                <span className="interp-section-num" aria-hidden="true">
                  {block.number}
                </span>
                <div className="interp-section-titles">
                  <h3>{block.title}</h3>
                  {block.tagline ? (
                    <p className="interp-section-tagline">
                      「{block.tagline}」
                    </p>
                  ) : null}
                </div>
              </header>
              <div className="interp-section-body">
                {block.items.map((item, itemIndex) => (
                  <InterpretationItem
                    key={`${key}-item-${itemIndex}`}
                    item={item}
                  />
                ))}
              </div>
            </section>
          )
        }

        if (block.type === 'special' || block.type === 'subitem') {
          return <InterpretationItem key={key} item={block} standalone />
        }

        if (block.type === 'summary-header') {
          return (
            <div key={key} className="interp-summary-head">
              <span className="interp-summary-seal" aria-hidden="true">
                總
              </span>
              <h3>종합 의견</h3>
            </div>
          )
        }

        return (
          <p key={key} className="interp-para">
            <HighlightText text={block.content} />
          </p>
        )
      })}
    </div>
  )
})
