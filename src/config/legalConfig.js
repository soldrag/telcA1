/**
 * Legal configuration for Impressum (§ 5 DDG) and Datenschutzerklärung (Art. 13 DSGVO).
 * Can be configured via environment or updated directly with operator contact details.
 */

export const LEGAL_CONFIG = {
  // Angaben gemäß § 18 Abs. 1 MStV (Nicht-kommerzielles Bildungs- und Hilfsprojekt)
  operator: {
    name: 'Artem Smirnov',
    cityCountry: 'Berlin, Deutschland',
    email: 'soldrag@gmail.com',
    website: 'https://github.com/artemsmirnov',
    mission:
      'Kostenloses und ehrenamtliches Bildungsprojekt zur Unterstützung von Deutschlernenden bei der Vorbereitung auf die Prüfung telc Deutsch A1 / Start Deutsch 1. Dieses Projekt wird privat ohne jede Gewinnerzielungsabsicht betrieben, enthält keine Werbung, verlangt keine Registrierung und erhebt keinerlei Gebühren.',
    status:
      'Privates, nicht-kommerzielles Telemedium gem. § 18 Abs. 1 MStV (kein geschäftsmäßiger Dienst).',
  },

  // Haftungsausschluss & Markenhinweis
  disclaimer: {
    trademark:
      'telc Deutsch A1 und Start Deutsch 1 sind eingetragene Marken bzw. Prüfungsformate der telc gGmbH bzw. des Goethe-Instituts. Diese Webanwendung ist ein unabhängiges Lern- und Trainingswerkzeug zu Bildungszwecken und steht in keiner geschäftlichen oder offiziellen Verbindung zur telc gGmbH oder zum Goethe-Institut.',
    content:
      'Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Übungsmaterialien und Prüfungssimulationen kann jedoch keine Gewähr übernommen werden.',
  },

  // Datenschutz-Spezifikation nach DSGVO & § 25 TDDDG
  privacy: {
    localStoragePurpose:
      'Die Speicherung von Prüfungsfortschritten, Antworten, Punkten sowie Theme- und Spracheinstellungen erfolgt ausschließlich lokal auf dem Endgerät des Nutzers (LocalStorage gem. § 25 Abs. 2 Nr. 2 TDDDG). Eine serverseitige Speicherung von Prüfungsergebnissen findet nicht statt.',
    shareTokenPurpose:
      'Beim Teilen von Ergebnissen («Ergebnis teilen») werden Prüfungsergebnisse und der optionale Name ausschließlich lokal im Browser komprimiert und in den URL-Fragmentbezeichner (Hash-Teil der Webadresse, nach dem «#») eingebettet. Dieser Teil der URL wird technisch bedingt niemals an den Webserver übertragen (Zero-Knowledge-Sharing). Die Weitergabe des Links an Dritte (z. B. Lehrkräfte) erfolgt rein freiwillig durch den Nutzer.',
    serverLogsRetentionDays: 7,
    noThirdPartyTracking: true,
    selfHostedFonts: true,
  },
};
