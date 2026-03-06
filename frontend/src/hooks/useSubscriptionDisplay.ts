import { useEffect, useMemo, useState } from 'react';
import type { User } from '@/types/User';
import { getSubscriptionDisplay } from '@/utils/subscriptionDisplay';

export const useSubscriptionDisplay = (user?: User | null) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    let intervalId: number | undefined;

    const delayToNextMinute = 60000 - (Date.now() % 60000);
    const timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 60000);
    }, delayToNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (typeof intervalId === 'number') {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return useMemo(() => {
    void now;
    return getSubscriptionDisplay(user);
  }, [user, now]);
};
