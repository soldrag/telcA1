import React from 'react';
import { Home, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export default function ResultsHeaderActions({ onNavigateHome, onResetExam }) {
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={onNavigateHome}
        className="text-xs sm:text-sm font-semibold"
      >
        <Home className="w-4 h-4 mr-1.5" />
        <span>В меню</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onResetExam}
        className="text-xs sm:text-sm font-semibold text-telc-700 border-telc-200 bg-telc-50/50 hover:bg-telc-100/70"
      >
        <RotateCcw className="w-4 h-4 mr-1.5" />
        <span>Пройти заново</span>
      </Button>
    </>
  );
}
