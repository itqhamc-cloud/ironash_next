'use client';

import { useEffect } from 'react';

export function DisableDevTools() {
  useEffect(() => {
    const disableDevToolsHandler = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    window.addEventListener('keydown', disableDevToolsHandler);
    return () => {
      window.removeEventListener('keydown', disableDevToolsHandler);
    };
  }, []);

  return null;
}
