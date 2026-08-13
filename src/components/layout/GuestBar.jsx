import { GoogleMark } from '../ui/GoogleMark'
import './GuestBar.css'

export function GuestBar({ authBusy, onGoogleSignIn }) {
  return (
    <div className="guest-bar">
      <button
        type="button"
        className="guest-bar-login"
        disabled={authBusy}
        onClick={() => onGoogleSignIn('guest_bar')}
      >
        <GoogleMark />
        Google로 로그인
      </button>
    </div>
  )
}
