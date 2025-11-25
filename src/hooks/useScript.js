import { useState, useEffect } from 'react';

export const useScript = (url) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    const onLoad = () => {
      setIsLoaded(true);
      setError(null);
    };

    const onError = () => {
      setIsLoaded(false);
      setError(new Error(`Failed to load script: ${url}`));
    };

    script.addEventListener('load', onLoad);
    script.addEventListener('error', onError);

    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      document.body.removeChild(script);
    };
  }, [url]);

  return { isLoaded, error };
};
