import { useEffect, useMemo, useState } from 'react';
import { XCircle } from 'lucide-react';
import { API } from '@/services/api';

export interface MarketerOption {
  id: string;
  name: string;
  email: string;
  profilePhoto1?: string;
}

interface PostPaymentSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (result: { contacted: boolean; marketerId?: string }) => void;
}

export const PostPaymentSurveyModal = ({ isOpen, onClose, onCompleted }: PostPaymentSurveyModalProps) => {
  const [step, setStep] = useState<'initial' | 'selectMarketer' | 'thankYou'>('initial');
  const [contacted, setContacted] = useState<boolean | null>(null);
  const [marketers, setMarketers] = useState<MarketerOption[]>([]);
  const [selectedMarketerId, setSelectedMarketerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMarketer = useMemo(
    () => marketers.find((m) => m.id === selectedMarketerId),
    [marketers, selectedMarketerId]
  );

  useEffect(() => {
    if (!isOpen) return;

    setStep('initial');
    setContacted(null);
    setSelectedMarketerId(null);
    setError(null);
    setMarketers([]);
    setLoading(false);
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'selectMarketer') return;

    setLoading(true);
    setError(null);

    API.User.getMarketers()
      .then((response) => {
        setMarketers(response.marketers || []);
      })
      .catch((err) => {
        console.error('Failed to load marketers', err);
        setError('Unable to load sales contacts right now. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, [step]);

  const handleClose = () => {
    setStep('initial');
    setContacted(null);
    setSelectedMarketerId(null);
    setError(null);
    setMarketers([]);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      await API.User.submitPostPaymentSurvey({
        contacted: Boolean(contacted),
        marketerId: selectedMarketerId || undefined,
      });
    } catch (error) {
      console.error('Failed to submit survey response', error);
      // continue anyway; we don't want this to block the user
    }

    onCompleted?.({ contacted: Boolean(contacted), marketerId: selectedMarketerId || undefined });
    setStep('thankYou');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-gray-900/90 border border-white/10 p-6 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-200 transition hover:bg-white/10"
          aria-label="Close"
        >
          <XCircle className="h-6 w-6" />
        </button>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Quick check-in</h2>

          {step === 'initial' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                Did a sales representative reach out to you about this purchase?
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setContacted(true);
                    setStep('selectMarketer');
                  }}
                  className="flex-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-pink-400 hover:to-purple-500"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setContacted(false);
                    setStep('thankYou');
                  }}
                  className="flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {step === 'selectMarketer' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                Please pick the sales executive that reached out to you.
              </p>

              {loading && (
                <p className="text-sm text-gray-400">Loading sales representatives…</p>
              )}

              {error && (
                <p className="text-sm text-red-300">{error}</p>
              )}

              {!loading && !error && marketers.length === 0 && (
                <p className="text-sm text-gray-400">
                  There are no sales representatives available right now.
                </p>
              )}

              {!loading && marketers.length > 0 && (
                <div className="max-h-56 overflow-y-auto space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                  {marketers.map((marketer) => (
                    <label
                      key={marketer.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                    >
                      <input
                        type="radio"
                        name="marketer"
                        value={marketer.id}
                        checked={selectedMarketerId === marketer.id}
                        onChange={() => setSelectedMarketerId(marketer.id)}
                        className="h-4 w-4 accent-pink-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{marketer.name}</div>
                        <div className="text-xs text-gray-400">{marketer.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleSubmit}
                  disabled={marketers.length > 0 && !selectedMarketerId}
                  className="flex-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setContacted(false);
                    setStep('thankYou');
                  }}
                  className="flex-1 rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/10"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {step === 'thankYou' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-300">
                Thank you! We really appreciate the feedback.
              </p>
              {contacted && selectedMarketer && (
                <p className="text-sm text-gray-300">
                  We will note that <span className="font-semibold text-white">{selectedMarketer.name}</span> was in touch.
                </p>
              )}
              <button
                onClick={() => {
                  onCompleted?.({ contacted: Boolean(contacted), marketerId: selectedMarketerId || undefined });
                  handleClose();
                }}
                className="w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-blue-400 hover:to-indigo-500"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
