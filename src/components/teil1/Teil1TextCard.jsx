import React from 'react';
import { SPAN } from '../layout/pageLayout.js';
import EmailHeader from './EmailHeader.jsx';

export default function Teil1TextCard({ headerText, bodyText, isCollapsed = false }) {
  return (
    <div className={`${isCollapsed ? 'max-sm:hidden' : ''} ${SPAN.wide} p-4 sm:p-6 bg-surface-inset lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto`}>
      <EmailHeader headerText={headerText} />
      <div className="bg-surface-card p-4 sm:p-6 rounded-xl border border-border-default">
        <div lang="de" className="exam-reading text-content-primary whitespace-pre-line">
          {bodyText}
        </div>
      </div>
    </div>
  );
}
