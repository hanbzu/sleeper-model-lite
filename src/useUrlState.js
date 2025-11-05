import React from 'react';

/** Synchronizes state with the URL hash */
export function useUrlState(initialValue) {
  // Initialize state from URL hash if available, otherwise use initialValue
  const [state, setState] = React.useState(() => decode(initialValue));

  // Sync state to URL hash when it changes
  React.useEffect(() => {
    const newHash = encode(state);
    window.history.pushState(null, '', `#${newHash}`); // Do it in a way that the user can go back
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

function encode(d) {
  return btoa(encodeURIComponent(JSON.stringify(d)));
}

function decode(initialValue) {
  const hash = window.location.hash.slice(1);
  if (hash) {
    try {
      const deserialized = JSON.parse(decodeURIComponent(atob(hash)));
      if (deserialized) return deserialized;
    } catch (err) {
      alert(`Starting from scratch after failing to decode URL data.\n\nHash: ${hash}\n\nError: ${err.message}`);
      const newHash = encode(initialValue);
      window.history.replaceState(null, '', `#${newHash}`);
      return initialValue;
    }
  }
  return initialValue;
}
