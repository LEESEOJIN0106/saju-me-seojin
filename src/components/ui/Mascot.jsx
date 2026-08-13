import './Mascot.css'

/** 사주 미 마스코트 — public/mascot.png */
export function Mascot({
  className = '',
  size = 'md',
  alt = '',
  decorative = true,
}) {
  return (
    <img
      src="/mascot.png?v=2"
      alt={decorative ? '' : alt || '사주 미 마스코트'}
      className={`mascot mascot--${size}${className ? ` ${className}` : ''}`}
      width={size === 'lg' ? 220 : size === 'sm' ? 96 : 148}
      height={size === 'lg' ? 200 : size === 'sm' ? 88 : 134}
      decoding="async"
      aria-hidden={decorative ? true : undefined}
    />
  )
}
