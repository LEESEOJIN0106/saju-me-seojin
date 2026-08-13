import { useEffect, useState } from 'react'
import { useStatusToast } from '../../hooks/useStatusToast'
import { trackEvent } from '../../lib/ga'
import { fetchSharedResult } from '../../lib/sharedResult'
import { friendlyError } from '../../lib/uxCopy'
import { Mascot } from '../ui/Mascot'
import { StatusBanner } from '../ui/StatusBanner'
import { ResultPanel } from './ResultPanel'
import './ResultSharePage.css'

/** 로그인 없이 공개 공유 링크(/result?s=)로 전체 해석을 본다 */
export function ResultSharePage() {
  const slug = new URLSearchParams(window.location.search).get('s') || ''
  const [sharedResult, setSharedResult] = useState(null)
  const [loadState, setLoadState] = useState(
    slug ? 'loading' : 'error',
  )
  const [errorMessage, setErrorMessage] = useState(
    slug ? '' : '공유 링크가 올바르지 않아요',
  )
  const [statusMessage, showStatus] = useStatusToast()

  useEffect(() => {
    if (!slug) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const result = await fetchSharedResult(slug)
        if (cancelled) return
        if (!result) {
          setErrorMessage('이 사주 결과를 찾지 못했어요')
          setLoadState('error')
          return
        }
        setSharedResult(result)
        setLoadState('success')
        trackEvent('share_page_view')
      } catch (error) {
        if (cancelled) return
        setErrorMessage(friendlyError(error))
        setLoadState('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <div className="layout result-share-layout">
      <div className="page result-share-page">
        <header className="result-share-head">
          <Mascot size="sm" />
          <div>
            <p className="result-share-brand">사주 미</p>
            <h1>친구가 보낸 사주 결과</h1>
            <p className="result-share-sub">로그인 없이 바로 읽어볼 수 있어요</p>
          </div>
        </header>

        {loadState === 'loading' ? (
          <StatusBanner statusMessage="물개가 결과를 가져오는 중…" />
        ) : null}

        {loadState === 'error' ? (
          <div className="status status--error" role="alert">
            <p>{errorMessage}</p>
            <a className="status-retry" href="/">
              홈으로
            </a>
          </div>
        ) : null}

        <StatusBanner statusMessage={statusMessage} />

        {sharedResult ? (
          <>
            <ResultPanel
              interpretation={sharedResult.interpretation}
              name={sharedResult.name}
              shareSlug={sharedResult.slug}
              publicView
              onStatus={showStatus}
            />
            <a
              className="result-share-cta"
              href="/"
              onClick={() => trackEvent('share_page_cta')}
            >
              내 사주도 물개에게 읽어 달라고 하기
            </a>
          </>
        ) : null}
      </div>
    </div>
  )
}
