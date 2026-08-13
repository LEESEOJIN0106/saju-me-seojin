import { trackEvent } from '../../lib/ga'
import { TypeCard } from './TypeCard'
import './InboundTeaser.css'

export function InboundTeaser({ inboundCard, onReadMine }) {
  return (
    <section className="inbound-teaser">
      <p className="inbound-kicker">이 유형 카드</p>
      <TypeCard
        meta={inboundCard}
        eyebrow={`${inboundCard.name}의 유형`}
        footer={
          <div className="share-card-foot">
            <span className="share-card-name">{inboundCard.name}</span>
            <button
              type="button"
              className="share-btn"
              onClick={() => {
                trackEvent('inbound_cta')
                onReadMine()
              }}
            >
              내 유형도 읽어 보기
            </button>
          </div>
        }
      />
      <p className="inbound-hint">아래에 생년월일을 넣으면 내 유형도 나와요</p>
    </section>
  )
}
