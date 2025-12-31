'use client';

import { useEffect } from 'react';

export default function SafariDetector() {
  useEffect(() => {
    const isSafari =
      typeof navigator !== 'undefined' &&
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari) {
      document.documentElement.classList.add('safari');
      document.body.classList.add('safari-pad');
    }
  }, []);

  return null;
}

