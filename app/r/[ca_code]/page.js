'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ReferralRedirectPage() {
  const params = useParams();

  const caCode =
    typeof params?.ca_code === 'string' ? params.ca_code : null;

  const [status, setStatus] = useState('loading');
  const [countdown, setCountdown] = useState(3);

  // Validate CA code
  useEffect(() => {
    if (!caCode) {
      setStatus('invalid');
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(`/api/ca/redirect/${caCode}`, {
          method: 'POST',
        });

        let data = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (res.ok && data?.valid) {
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch {
        setStatus('invalid');
      }
    };

    validate();
  }, [caCode]);

  // Countdown
  useEffect(() => {
    if (status !== 'valid') return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // Redirect
  useEffect(() => {
    if (status === 'valid' && countdown === 0) {
      window.location.href = `/register?ca=${caCode}`;
    }
  }, [countdown, status, caCode]);

  const cardClipPath =
    'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)';

  // LOADING
  if (status === 'loading') {
    return (
      <section className="section-container border-t border-white/10 pb-32">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#0A090F] p-12 rounded-lg">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-500/20 flex items-center justify-center">
              <i className="ri-loader-4-line text-5xl text-orange-500 animate-spin" />
            </div>
            <h1 className="text-3xl text-white mb-2">
              Validating Referral Link
            </h1>
            <p className="text-white/60">
              Please wait while we verify your CA code
            </p>
          </div>
        </div>
      </section>
    );
  }

  // VALID
  if (status === 'valid') {
    return (
      <section className="section-container border-t border-white/10 pb-32">
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="bg-[#0A090F] p-12 rounded-lg"
            style={{ clipPath: cardClipPath }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <i className="ri-checkbox-circle-fill text-5xl text-green-500" />
            </div>

            <h1 className="text-3xl text-white mb-4">
              Valid Referral Link
            </h1>

            <p className="text-white/80 mb-6">
              Redirecting you to Hackwise 2.0 registration page
            </p>

            <div className="text-6xl font-bold text-orange-500 mb-6">
              {countdown}
            </div>

            <p className="text-white/60 text-sm">
              If you are not redirected automatically,{' '}
              <a
                href={`/register?ca=${caCode}`}
                className="text-orange-500 hover:underline"
              >
                click here
              </a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  // INVALID
  return (
    <section className="section-container border-t border-white/10 pb-32">
      <div className="max-w-2xl mx-auto text-center">
        <div
          className="bg-[#0A090F] p-12 rounded-lg"
          style={{ clipPath: cardClipPath }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <i className="ri-error-warning-fill text-5xl text-red-500" />
          </div>

          <h1 className="text-3xl text-white mb-4">
            Invalid Referral Link
          </h1>

          <p className="text-white/80 mb-6">
            The CA code&nbsp;
            <span className="text-orange-500 font-mono font-bold">
              {caCode}
            </span>
            &nbsp;is invalid or not approved.
          </p>

          <a
            href="/"
            className="inline-block px-8 py-3 bg-orange-500 text-black font-bold hover:bg-orange-600 transition-colors"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    </section>
  );
}
