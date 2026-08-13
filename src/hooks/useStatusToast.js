import { useCallback, useEffect, useRef, useState } from 'react'

const TOAST_MS = 2400

export function useStatusToast(durationMs = TOAST_MS) {
  const [statusMessage, setStatusMessage] = useState('')
  const timerRef = useRef(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const showStatus = useCallback(
    (message) => {
      setStatusMessage(message)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setStatusMessage(''), durationMs)
    },
    [durationMs],
  )

  return [statusMessage, showStatus]
}
