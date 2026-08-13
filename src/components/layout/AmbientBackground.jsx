import './AmbientBackground.css'

export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="float-char float-char--1">木</span>
      <span className="float-char float-char--2">火</span>
      <span className="float-char float-char--3">土</span>
      <span className="float-char float-char--4">金</span>
      <span className="float-char float-char--5">水</span>
      <span className="spark spark--1" />
      <span className="spark spark--2" />
      <span className="spark spark--3" />
      <span className="spark spark--4" />
      <span className="spark spark--5" />
      <span className="spark spark--6" />
    </div>
  )
}
