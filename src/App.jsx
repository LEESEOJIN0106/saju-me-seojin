import { AnalysisLoading } from './components/AnalysisLoading'
import { FortuneForm } from './components/FortuneForm'
import { GuestResultGate } from './components/GuestResultGate'
import { Mascot } from './components/Mascot'
import { ProfileModal } from './components/ProfileModal'
import { ReadingsSidebar } from './components/ReadingsSidebar'
import { ResultPanel, TypeCard } from './components/ResultPanel'
import { useSajuApp } from './hooks/useSajuApp'
import './App.css'

function AmbientBackground() {
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

function App() {
  const app = useSajuApp()
  const showForm = Boolean(app.user || !app.interpretation)

  return (
    <div className="layout">
      <AmbientBackground />

      {app.user ? (
        <ReadingsSidebar
          user={app.user}
          profile={app.profile}
          authBusy={app.authBusy}
          onGoogleSignIn={app.handleGoogleSignIn}
          onSignOut={app.handleSignOut}
          onOpenProfile={app.handleOpenProfile}
          onUseMyProfile={app.handleUseMyProfile}
          onNewInput={app.handleNewInput}
          readings={app.readings}
          readingsLoading={app.readingsLoading}
          activeReadingId={app.activeReadingId}
          onSelectReading={app.handleSelectReading}
          onDeleteReading={app.handleDeleteReading}
        />
      ) : app.interpretation || app.isLoading ? null : (
        <div className="guest-bar">
          <button
            type="button"
            className="guest-bar-login"
            disabled={app.authBusy}
            onClick={app.handleGoogleSignIn}
          >
            로그인
          </button>
        </div>
      )}

      {app.needsOnboarding ? (
        <ProfileModal
          mode="onboard"
          initial={app.profile}
          busy={app.profileBusy}
          errorMessage={app.profileError}
          onSave={app.handleSaveProfile}
        />
      ) : null}

      {app.editProfileOpen && !app.needsOnboarding ? (
        <ProfileModal
          mode="view"
          initial={app.profile}
          busy={app.profileBusy}
          errorMessage={app.profileError}
          onSave={app.handleSaveProfile}
          onClose={() => {
            app.setEditProfileOpen(false)
            app.setProfileError('')
          }}
        />
      ) : null}

      <div className="page">
        {app.inboundCard && !app.interpretation && !app.isLoading ? (
          <section className="inbound-teaser">
            <p className="inbound-kicker">이 유형 카드</p>
            <TypeCard
              meta={app.inboundCard}
              eyebrow={`${app.inboundCard.name}의 유형`}
              footer={
                <div className="share-card-foot">
                  <span className="share-card-name">{app.inboundCard.name}</span>
                  <button
                    type="button"
                    className="share-btn"
                    onClick={() =>
                      app.formCardRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                    }
                  >
                    내 유형도 읽어 보기
                  </button>
                </div>
              }
            />
            <p className="inbound-hint">
              아래에 생년월일을 넣으면 내 유형도 나와요
            </p>
          </section>
        ) : app.interpretation && !app.user ? null : (
          <header className="hero">
            <div className="hero-mascot" aria-hidden="true">
              <Mascot size="lg" className="hero-mascot-img" />
            </div>
            <p className="hero-brand">사주 미</p>
            <h1>
              나는 <span className="hero-title-accent">어떤 형</span>일까
            </h1>
            <p className="hero-sub">
              {app.profileReady
                ? '저장된 정보로 물개가 바로 유형 카드를 읽어 줄게요'
                : '생년월일만 넣으면 바로 읽어 볼 수 있어요'}
            </p>
          </header>
        )}

        {showForm ? (
          <FortuneForm
            formCardRef={app.formCardRef}
            isRecalling={app.isRecalling}
            profileReady={app.profileReady}
            guestFormOpen={app.guestFormOpen}
            profile={app.profile}
            form={app.form}
            setForm={app.setForm}
            isLoading={app.isLoading}
            canSubmit={app.canSubmit}
            missingHint={app.missingHint}
            onOpenProfile={app.handleOpenProfile}
            onInterpretProfile={app.handleInterpretProfile}
            onUseMyProfile={app.handleUseMyProfile}
            onOpenGuestForm={app.handleOpenGuestForm}
            onSubmit={app.handleSubmit}
          />
        ) : null}

        {app.isLoading ? <AnalysisLoading /> : null}

        {app.errorMessage ? (
          <div className="status status--error" role="alert">
            <p>{app.errorMessage}</p>
            <button
              type="button"
              className="status-retry"
              onClick={app.handleRetry}
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {app.statusMessage ? (
          <p className="status status--ok" role="status">
            {app.statusMessage}
          </p>
        ) : null}

        {app.interpretation ? (
          <div ref={app.resultRef}>
            <div className="result-ready" role="status">
              <Mascot size="sm" />
              <div className="result-ready-copy">
                <p className="result-ready-kicker">첨벙</p>
                <p className="result-ready-title">물개가 다 읽어 봤어요</p>
              </div>
            </div>
            {app.user ? (
              <ResultPanel
                interpretation={app.interpretation}
                name={app.form.name}
                onStatus={app.showStatus}
              />
            ) : (
              <GuestResultGate
                authBusy={app.authBusy}
                onGoogleSignIn={app.handleGoogleSignIn}
                onReset={app.handleGuestReset}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default App
