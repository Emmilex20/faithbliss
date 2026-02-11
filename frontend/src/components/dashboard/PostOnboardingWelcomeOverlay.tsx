import type { User } from '@/services/api';

interface PostOnboardingWelcomeOverlayProps {
  user?: User;
  onPrimary: () => void;
  onDismiss: () => void;
}

export const PostOnboardingWelcomeOverlay = ({
  user,
  onPrimary,
  onDismiss,
}: PostOnboardingWelcomeOverlayProps) => {
  const bgImage = user?.profilePhoto1 || user?.profilePhoto2 || '';

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: bgImage
            ? `linear-gradient(180deg, rgba(2,6,23,0.3) 0%, rgba(2,6,23,0.88) 52%, rgba(2,6,23,0.98) 100%), url('${bgImage}')`
            : 'radial-gradient(circle at 10% 10%, rgba(236,72,153,0.2), transparent 38%), radial-gradient(circle at 90% 0%, rgba(59,130,246,0.2), transparent 35%), linear-gradient(180deg, #0b1220 0%, #020617 100%)',
        }}
      />

      <div className="absolute inset-0 bg-black/25" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-5xl font-black uppercase tracking-[0.08em] text-white sm:text-6xl">FaithBliss+</h1>

          <p className="mx-auto mt-6 max-w-lg text-3xl font-semibold leading-tight text-white sm:text-4xl">
            See more believers near you and connect faster
          </p>

          <p className="mx-auto mt-4 max-w-md text-sm text-slate-200 sm:text-base">
            Your profile is ready. Start discovering meaningful matches in your city and beyond.
          </p>

          <div className="mt-10 space-y-4">
            <button
              type="button"
              onClick={onPrimary}
              className="w-full rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-orange-500 px-8 py-4 text-xl font-bold text-white shadow-[0_18px_40px_rgba(236,72,153,0.35)] transition hover:brightness-110"
            >
              Let&apos;s do it
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="text-lg font-semibold uppercase tracking-wide text-white/90 transition hover:text-white"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
