import './StatusBanner.css'

export function StatusBanner({ errorMessage, statusMessage, onRetry }) {
  if (!errorMessage && !statusMessage) return null

  return (
    <>
      {errorMessage ? (
        <div className="status status--error" role="alert">
          <p>{errorMessage}</p>
          {onRetry ? (
            <button type="button" className="status-retry" onClick={onRetry}>
              다시 시도
            </button>
          ) : null}
        </div>
      ) : null}

      {statusMessage ? (
        <p className="status status--ok" role="status">
          {statusMessage}
        </p>
      ) : null}
    </>
  )
}
