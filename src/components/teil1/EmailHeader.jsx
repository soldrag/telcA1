import React from 'react';
import { Mail, Calendar, User, Tag } from 'lucide-react';

export default function EmailHeader({ headerText }) {
  if (!headerText) return null;

  const lines = headerText.split('\n').filter(Boolean);
  const parsed = lines.map(parseHeaderLine);

  return (
    <div className="mb-4 bg-surface-card rounded-2xl border-2 border-border-default overflow-hidden shadow-xs">
      <div className="bg-surface-inset px-4 py-2 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-action-primary" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-content-primary">
            E-Mail Kopfzeile
          </span>
        </div>
        <span className="text-xs font-bold text-action-primary bg-action-primary-subtle px-2 py-1 rounded border border-action-primary-border">
          Posteingang
        </span>
      </div>

      <div className="p-4 space-y-2 text-xs sm:text-sm divide-y divide-border-subtle">
        {parsed.map((item, lineIndex) => {
          const isSubject = item.key.toLowerCase() === 'betreff';

          return (
            <div
              key={lineIndex}
              className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 ${
                lineIndex > 0 ? 'pt-2' : ''
              }`}
            >
              {item.key && (
                <div className="flex items-center space-x-2 w-24 flex-shrink-0 text-content-tertiary font-bold text-xs uppercase tracking-wide">
                  {getHeaderIcon(item.key)}
                  <span>{item.key}:</span>
                </div>
              )}
              <div
                className={`flex-1 break-words ${
                  isSubject
                    ? 'font-bold text-content-primary text-sm sm:text-base'
                    : 'text-content-primary font-medium'
                }`}
              >
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function parseHeaderLine(line) {
  const match = line.match(/^([^:]+):\s*(.*)$/);
  if (match) {
    return { key: match[1].trim(), value: match[2].trim() };
  }
  return { key: '', value: line.trim() };
}

function getHeaderIcon(key) {
  const lower = key.toLowerCase();
  if (lower === 'von' || lower === 'an') return <User className="w-4 h-4 text-action-primary" />;
  if (lower === 'datum') return <Calendar className="w-4 h-4 text-state-warning" />;
  if (lower === 'betreff') return <Tag className="w-4 h-4 text-action-primary" />;
  return <Mail className="w-4 h-4 text-content-secondary" />;
}
