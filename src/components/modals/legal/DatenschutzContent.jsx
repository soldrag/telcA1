import React from 'react';

export default function DatenschutzContent({ operator, privacy }) {
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
