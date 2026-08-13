import './SubmitButton.css'

export function SubmitButton({
  busy = false,
  busyLabel,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`submit-btn${busy ? ' is-loading' : ''}${className ? ` ${className}` : ''}`}
      {...props}
    >
      {busy ? (
        <>
          <span className="spinner" aria-hidden="true" />
          <span className="submit-shimmer" aria-hidden="true" />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </button>
  )
}
