'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type ConsentValue = 'all' | 'essential' | null;

interface ConsentContextValue {
  consent: ConsentValue;
  ready: boolean;
  analyticsAllowed: boolean;
  setConsent: (value: ConsentValue) => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children, required = true }: { children: ReactNode; required?: boolean }) {
  const [consent, setConsentState] = useState<ConsentValue>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dl-consent') as ConsentValue;
    if (saved === 'all' || saved === 'essential') {
      setConsentState(saved);
      document.cookie = `dl-consent=${saved}; path=/; max-age=31536000; SameSite=Lax`;
    } else if (!required) {
      setConsentState('all');
      document.cookie = 'dl-consent=all; path=/; max-age=31536000; SameSite=Lax';
    }
    setReady(true);
  }, [required]);

  function setConsent(value: ConsentValue) {
    setConsentState(value);
    if (value) {
      localStorage.setItem('dl-consent', value);
      document.cookie = `dl-consent=${value}; path=/; max-age=31536000; SameSite=Lax`;
    } else {
      localStorage.removeItem('dl-consent');
      document.cookie = 'dl-consent=; path=/; max-age=0';
    }
  }

  return (
    <ConsentContext.Provider
      value={{
        consent,
        ready,
        analyticsAllowed: consent === 'all',
        setConsent,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) throw new Error('useConsent must be used inside ConsentProvider');
  return context;
}


