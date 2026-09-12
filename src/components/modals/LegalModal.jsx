import React, { useState } from 'react';
import { Shield, FileText, X } from 'lucide-react';
import { LEGAL_CONFIG } from '../../config/legalConfig.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

function ImpressumContent({ operator, disclaimer }) {
  return (
    <div className="space-y-4 text-xs sm:text-sm text-content-secondary leading-relaxed">
      <section>
        <h4 className="font-bold text-content-primary mb-1">Angaben gemäß § 18 MStV (Nicht-kommerzielles Angebot)</h4>
        <p className="font-medium text-content-primary">{operator.name}</p>
        <p>{operator.cityCountry || operator.zipCity || 'Deutschland'}</p>
        <p className="mt-1">
          E-Mail:{' '}
          <a href={`mailto:${operator.email}`} className="text-action-primary hover:underline">
            {operator.email}
          </a>
        </p>
        {operator.website && (
          <p>
            Web:{' '}
            <a
              href={operator.website}
              target="_blank"
              rel="noreferrer noopener"
              className="text-action-primary hover:underline"
            >
              {operator.website}
            </a>
          </p>
        )}
        {operator.mission && (
          <p className="mt-2 text-xs text-content-secondary bg-surface-raised p-2.5 rounded-xl border border-border-default">
            {operator.mission}
          </p>
        )}
        {operator.status && <p className="mt-1.5 text-xs text-content-tertiary italic">{operator.status}</p>}
      </section>

      <section>
        <h4 className="font-bold text-content-primary mb-1">Hinweis zu geschützten Marken & Prüfungsformaten</h4>
        <p>{disclaimer.trademark}</p>
      </section>

      <section>
        <h4 className="font-bold text-content-primary mb-1">Haftung für Inhalte</h4>
        <p>{disclaimer.content}</p>
      </section>
    </div>
  );
}

function DatenschutzContent({ operator, privacy }) {
  return (
    <div className="space-y-4 text-xs sm:text-sm text-content-secondary leading-relaxed">
      <section>
        <h4 className="font-bold text-content-primary mb-1">1. Datenschutz auf einen Blick</h4>
        <p>
          Diese Webanwendung wurde nach dem Grundsatz der Datenminimierung («Privacy by Design») konzipiert.
          Es werden keine Benutzerkonten geführt und keine Prüfungsergebnisse auf externen Servern gespeichert.
        </p>
      </section>

      <section>
        <h4 className="font-bold text-content-primary mb-1">2. Verantwortliche Stelle</h4>
        <p>{operator.name}, {operator.cityCountry || operator.zipCity || 'Deutschland'} &bull; Kontakt: {operator.email}</p>
      </section>

      <section>
        <h4 className="font-bold text-content-primary mb-1">3. Lokale Speicherung im Browser (§ 25 Abs. 2 Nr. 2 TDDDG)</h4>
        <p>{privacy.localStoragePurpose}</p>
        <p className="mt-1 text-xs opacity-80">
          Gespeichert werden: <code>telc_exam_attempts_v1</code> (Testergebnisse), <code>telc_theme</code> (Farbschema), <code>telc_language</code> (Sprache).
          Sie können diese Daten jederzeit über die Schaltfläche «Verlauf löschen» oder in den Einstellungen Ihres Browsers entfernen.
        </p>
      </section>

      <section>
        <h4 className="font-bold text-content-primary mb-1">4. Keine Tracking-Cookies & keine Webanalyse</h4>
        <p>
          Wir setzen <strong>weder Tracking-Cookies noch Drittanbieter-Analysetools</strong> (z. B. Google Analytics, Meta Pixel) ein.
          Ein Cookie-Einwilligungsbanner ist daher gemäß § 25 Abs. 2 TDDDG nicht erforderlich.
        </p>
      </section>

      <section>
        <h4 className="font-bold text-content-primary mb-1">5. Lokale Schriftarten (Fonts)</h4>
        <p>
          Alle Schriftarten (Inter) werden direkt von unserem eigenen Webserver bereitgestellt.
          Es erfolgt keine Übertragung Ihrer IP-Adresse an Google Fonts oder sonstige externe CDN-Dienste.
        </p>
      </section>

      <section>
        <h4 className="font-bold text-content-primary mb-1">6. Server-Logfiles</h4>
        <p>
          Beim Abruf von Seiten verarbeitet der Webserver aus technischen Gründen temporär Verbindungsdaten (IP-Adresse, Zeitpunkt).
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Ausfallsicherheit und Missbrauchsschutz).
        </p>
      </section>

      <section>
        <h4 className="font-bold text-content-primary mb-1">7. Ihre Rechte</h4>
        <p>
          Ihnen stehen die gesetzlichen Rechte nach Art. 15–21 DSGVO zu (Auskunft, Berichtigung, Löschung).
          Wenden Sie sich dazu an die im Impressum angegebene E-Mail-Adresse.
        </p>
      </section>
    </div>
  );
}

export default function LegalModal({ isOpen, initialType = 'impressum', onClose }) {
  const [activeTab, setActiveTab] = useState(initialType);
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-card border border-border-default rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-scaleUp">
        <div className="p-5 border-b border-border-default flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-2xl bg-action-primary-subtle text-action-primary flex items-center justify-center">
              {activeTab === 'impressum' ? <FileText className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div className="flex space-x-1 bg-surface-raised p-1 rounded-xl border border-border-default">
              <button
                type="button"
                onClick={() => setActiveTab('impressum')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'impressum'
                    ? 'bg-action-primary text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {t('footer.impressum') || 'Impressum'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('datenschutz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'datenschutz'
                    ? 'bg-action-primary text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {t('footer.datenschutz') || 'Datenschutz'}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-content-muted hover:text-content-primary p-2 rounded-xl hover:bg-surface-raised transition-colors"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'impressum' ? (
            <ImpressumContent operator={LEGAL_CONFIG.operator} disclaimer={LEGAL_CONFIG.disclaimer} />
          ) : (
            <DatenschutzContent operator={LEGAL_CONFIG.operator} privacy={LEGAL_CONFIG.privacy} />
          )}
        </div>

        <div className="p-4 border-t border-border-default flex justify-end bg-surface-raised/40 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-white bg-action-primary hover:bg-action-primary-hover rounded-xl transition-all"
          >
            {t('modals.shareClose') || 'Schließen'}
          </button>
        </div>
      </div>
    </div>
  );
}
