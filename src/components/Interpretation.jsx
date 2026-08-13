import { memo, useEffect, useMemo, useState } from 'react'
import { parseInterpretation } from '../lib/parseInterpretation'
import { stripShareHeader } from '../lib/shareCard'
import { softenSubLabel } from '../lib/uxCopy'

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
      /긍정|강점/.test(item.label)
        ? 'positive'
        : /부정|약점|조심/.test(item.label)
          ? 'careful'
          : 'neutral'

    return (
      <div className={`interp-subitem interp-subitem--${tone}`}>
        <span className="interp-subitem-label">{softenSubLabel(item.label)}</span>
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

export const InterpretationBody = memo(function InterpretationBody({
  text,
  focusTitle = null,
}) {
  const bodyText = useMemo(() => stripShareHeader(text), [text])
  const blocks = useMemo(() => parseInterpretation(bodyText), [bodyText])
  const firstSectionIdx = useMemo(
    () => blocks.findIndex((b) => b.type === 'section'),
    [blocks],
  )
  const [openMap, setOpenMap] = useState({})

  useEffect(() => {
    if (firstSectionIdx < 0) return
    setOpenMap({ [firstSectionIdx]: true })
  }, [text, firstSectionIdx])

  useEffect(() => {
    if (!focusTitle) return
    const idx = blocks.findIndex(
      (b) => b.type === 'section' && focusTitle && b.title.includes(focusTitle),
    )
    if (idx < 0) return
    setOpenMap((prev) => ({ ...prev, [idx]: true }))
    const id = window.setTimeout(() => {
      document
        .getElementById(`interp-section-${idx}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    return () => window.clearTimeout(id)
  }, [focusTitle, blocks])

  return (
    <div className="interp-body">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`

        if (block.type === 'intro') {
          return (
            <div key={key} className="interp-intro">
              <p className="interp-intro-kicker">물개가 한눈에 보면</p>
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
          const open = openMap[index] ?? false
          return (
            <details
              key={key}
              id={`interp-section-${index}`}
              className="interp-section"
              style={{ '--section-i': block.number }}
              open={open}
              onToggle={(e) => {
                const next = e.currentTarget.open
                setOpenMap((prev) => ({ ...prev, [index]: next }))
              }}
            >
              <summary className="interp-section-head">
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
                <span className="interp-section-toggle" aria-hidden="true">
                  {open ? '접기' : '자세히'}
                </span>
              </summary>
              <div className="interp-section-body">
                {block.items.map((item, itemIndex) => (
                  <InterpretationItem
                    key={`${key}-item-${itemIndex}`}
                    item={item}
                  />
                ))}
              </div>
            </details>
          )
        }

        if (block.type === 'special' || block.type === 'subitem') {
          return <InterpretationItem key={key} item={block} standalone />
        }

        if (block.type === 'summary-header') {
          return (
            <div key={key} className="interp-summary-head">
              <h3>종합하면</h3>
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
