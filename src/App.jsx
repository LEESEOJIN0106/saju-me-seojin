import { FortuneForm } from './components/fortune/FortuneForm'
import { AmbientBackground } from './components/layout/AmbientBackground'
import { GuestBar } from './components/layout/GuestBar'
import { Hero } from './components/layout/Hero'
import { ProfileModal } from './components/profile/ProfileModal'
import { ReadingsSidebar } from './components/readings/ReadingsSidebar'
import { AnalysisLoading } from './components/result/AnalysisLoading'
import { InboundTeaser } from './components/result/InboundTeaser'
import { ResultSection } from './components/result/ResultSection'
import { StatusBanner } from './components/ui/StatusBanner'
import { useSajuApp } from './hooks/useSajuApp'

export default function App() {
  const app = useSajuApp()
  const showForm = Boolean(app.user || !app.interpretation)
  const showGuestBar = !app.user && !app.interpretation && !app.isLoading
  const showInbound = Boolean(
    app.inboundCard && !app.interpretation && !app.isLoading,
  )
  const hideHero = Boolean(app.interpretation && !app.user)

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
      ) : null}

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
        {showGuestBar ? (
          <GuestBar
            authBusy={app.authBusy}
            onGoogleSignIn={app.handleGoogleSignIn}
          />
        ) : null}

        {showInbound ? (
          <InboundTeaser
            inboundCard={app.inboundCard}
            onReadMine={() =>
              app.formCardRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              })
            }
          />
        ) : hideHero ? null : (
          <Hero profileReady={app.profileReady} />
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

        <StatusBanner
          errorMessage={app.errorMessage}
          statusMessage={app.statusMessage}
          onRetry={app.handleRetry}
        />

        {app.interpretation ? (
          <ResultSection
            resultRef={app.resultRef}
            user={app.user}
            interpretation={app.interpretation}
            name={app.form.name}
            onStatus={app.showStatus}
            authBusy={app.authBusy}
            onGoogleSignIn={app.handleGoogleSignIn}
            onReset={app.handleGuestReset}
          />
        ) : null}
      </div>
    </div>
  )
}
