import React from 'react';
import { ArrowLeft, History } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export default function DefaultHeaderActions({ screen, onNavigateHome, onOpenHistory }) {
  if (screen === 'history') {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={onNavigateHome}
        className="text-xs sm:text-sm font-bold"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Главное меню</span>
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onOpenHistory}
      title="История ваших прохождений"
      className="text-xs sm:text-sm font-bold border border-slate-200/80"
    >
      <History className="w-4 h-4 mr-1.5 text-telc-700" />
      <span>История</span>
    </Button>
  );
}
