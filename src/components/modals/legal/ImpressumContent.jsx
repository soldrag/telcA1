import React from 'react';

export default function ImpressumContent({ operator, disclaimer }) {
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
