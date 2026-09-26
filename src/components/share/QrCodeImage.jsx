import React, { useEffect, useState } from 'react';

// The QR library is only fetched when a code is actually shown.
async function renderQrSvg(text) {
  const module = await import('qrcode');
  const qrcode = module.default || module;
  return qrcode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'L' });
}

/**
 * QR code of a link, dark on white in both themes so any phone camera reads it.
 * Renders nothing if the link is too long for a QR code.
 */
export default function QrCodeImage({ value, label, className = 'w-40 h-40' }) {
  const [state, setState] = useState({ value: null, src: null, failed: false });

  useEffect(() => {
    let isCurrent = true;
    renderQrSvg(value)
      .then((svg) => isCurrent && setState({ value, src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, failed: false }))
      .catch(() => isCurrent && setState({ value, src: null, failed: true }));
    return () => { isCurrent = false; };
  }, [value]);

  if (state.failed) return null;
  const isReady = state.value === value && state.src;
  return (
    <div className={`shrink-0 rounded-xl bg-white p-2 border border-border-default ${className}`}>
      {isReady && <img src={state.src} alt={label} className="w-full h-full" />}
    </div>
  );
}
