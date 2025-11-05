import React from 'react';

function encode(d) {
  const newHash = btoa(encodeURIComponent(JSON.stringify(d)));
  window.history.replaceState(null, '', `#${newHash}`);
}

function decode(initialValue) {
  const hash = window.location.hash.slice(1);
  if (hash) {
    try {
      const deserialized = JSON.parse(decodeURIComponent(atob(hash)));
      if (deserialized) return deserialized;
    } catch (err) {
      alert(`Starting from scratch after failing to decode URL data.\n\nHash: ${hash}\n\nError: ${err.message}`);
      encode(initialValue);
      return initialValue;
    }
  }
  return initialValue;
}

/** Synchronizes state with the URL hash */
export function useUrlState(initialValue) {
  // Initialize state from URL hash if available, otherwise use initialValue
  const [state, setState] = React.useState(() => decode(initialValue));

  // Sync state to URL hash when it changes
  React.useEffect(() => {
    encode(state);
  }, [state]);

  // Listen for manual URL hash changes (browser back/forward, manual edit)
  React.useEffect(() => {
    function handleHashChange() {
      setState(decode(initialValue));
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return [state, setState];
}
