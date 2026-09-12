import React from 'react';
import { Cpu, CheckCircle2, AlertCircle } from 'lucide-react';
import { PROVIDER_IDS } from '../../services/ai/types.js';

export default function SchreibenAiStatusBadge({ providerId, language = 'de' }) {
  if (providerId === PROVIDER_IDS.WINDOW_AI) {
    return (
      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        <span>
          {language === 'ru'
            ? 'Встроенный ИИ браузера (Prompt API)'
            : 'Browser-KI (Prompt API)'}
        </span>
      </div>
    );
  }

  if (providerId === PROVIDER_IDS.CLIENT_WEBGPU) {
    return (
      <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
        <span>
          {language === 'ru'
            ? 'Локальная модель (WebGPU, Qwen3-0.6B)'
            : 'On-Device Modell (WebGPU, Qwen3-0.6B)'}
        </span>
      </div>
    );
  }

  // Fallback: limited mode / rule-based
  return (
    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
      <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
      <span>
        {language === 'ru'
          ? 'Ограниченный режим: только правиловая оценка'
          : 'Eingeschränkter Modus: Nur regelbasierte Bewertung'}
      </span>
    </div>
  );
}
