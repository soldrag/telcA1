import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { isOnline, subscribeNetworkStatus } from '../../services/pwaRegister.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function NetworkStatusBadge() {
  const { t } = useI18n();
  const [online, setOnline] = useState(isOnline);

  useEffect(() => {
    return subscribeNetworkStatus(setOnline);
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      title={t('header.offlineTooltip')}
      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0 select-none animate-pulse"
    >
      <WifiOff className="w-3 h-3" />
      <span>{t('header.offlineBadge')}</span>
    </div>
  );
}
