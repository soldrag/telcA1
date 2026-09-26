import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { useI18n } from '../../../i18n/I18nContext.jsx';
import ShareLinkPanel from '../../share/ShareLinkPanel.jsx';

// The cryptography is a detail for the curious: it sits behind an info icon, not in the main text.
function SignatureHint({ t }) {
  const hint = t('modals.createAssignment.signatureTooltip');
  return (
    <span className="relative inline-flex group align-middle">
      <button type="button" aria-label={hint} className="w-6 h-6 inline-flex items-center justify-center rounded-full text-content-muted hover:text-content-primary cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary">
        <Info className="w-4 h-4" aria-hidden="true" />
      </button>
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-56 rounded-lg bg-content-primary text-surface-card text-xs p-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
        {hint}
      </span>
    </span>
  );
}

function AddedNotice({ t }) {
  return (
    <p className="flex items-start gap-2 text-sm text-content-secondary leading-relaxed">
      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-state-success-text" aria-hidden="true" />
      <span>{t('modals.createAssignment.addedNotice')} <SignatureHint t={t} /></span>
    </p>
  );
}

/**
 * «Link is ready»: the signed link with copy, share and QR, and a note that it is in «Issued».
 */
export default function AssignmentReady({ url, summary }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <p lang="de" className="text-sm text-content-secondary">{summary}</p>
      <ShareLinkPanel url={url} title={summary} footnote={<AddedNotice t={t} />} />
    </div>
  );
}
