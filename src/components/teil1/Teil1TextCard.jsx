import React from 'react';
import EmailHeader from './EmailHeader.jsx';
import FontSizeControl from './FontSizeControl.jsx';

const FONT_SIZE_CLASSES = {
  normal: 'text-base leading-relaxed',
  large: 'text-xl leading-relaxed',
  xlarge: 'text-xl leading-loose',
};

export default function Teil1TextCard({
  headerText,
  bodyText,
  fontSizeLevel,
  onSelectFontSizeLevel,
}) {
  const bodyClass = FONT_SIZE_CLASSES[fontSizeLevel] || FONT_SIZE_CLASSES.normal;

  return (
    <div className="lg:col-span-7 p-5 sm:p-6 bg-surface-inset flex flex-col justify-start lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6.5rem)] lg:overflow-y-auto">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-content-primary bg-surface-card px-3 py-1 rounded border border-border-default shadow-xs">
            Lesetext
          </span>
          <span className="text-xs font-bold text-content-tertiary">
            Deutsch A1
          </span>
        </div>

        <FontSizeControl
          fontSizeLevel={fontSizeLevel}
          onSelectLevel={onSelectFontSizeLevel}
        />
      </div>

      <EmailHeader headerText={headerText} />

      <div className="bg-surface-card p-5 sm:p-8 rounded-2xl border-2 border-border-default shadow-sm">
        <div className={`text-content-primary font-normal whitespace-pre-line ${bodyClass}`}>
          {bodyText}
        </div>
      </div>
    </div>
  );
}
