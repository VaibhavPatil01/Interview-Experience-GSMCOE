import { useState, useEffect } from 'react';
import fpPromise from '@fingerprintjs/fingerprintjs';

/**
 * React hook to lazily load FingerprintJS and obtain a visitorId.
 * This ID is used as an anonymous identity signal for AI quota enforcement.
 */
export const useFingerprint = () => {
  const [visitorId, setVisitorId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadFingerprint = async () => {
      try {
        const fp = await fpPromise.load();
        const result = await fp.get();
        if (mounted) {
          setVisitorId(result.visitorId);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load FingerprintJS:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadFingerprint();

    return () => {
      mounted = false;
    };
  }, []);

  return { visitorId, isLoading };
};
