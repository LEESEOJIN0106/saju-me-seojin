import { Mascot } from '../ui/Mascot'
import './Hero.css'

export function Hero({ profileReady }) {
  return (
    <header className="hero">
      <div className="hero-mascot" aria-hidden="true">
        <Mascot size="lg" className="hero-mascot-img" />
      </div>
      <p className="hero-brand">사주 미</p>
      <h1>
        나는 <span className="hero-title-accent">어떤 형</span>일까
      </h1>
      <p className="hero-sub">
        {profileReady
          ? '저장된 정보로 물개가 바로 유형 카드를 읽어 줄게요'
          : '생년월일만 넣으면 바로 읽어 볼 수 있어요'}
      </p>
    </header>
  )
}
