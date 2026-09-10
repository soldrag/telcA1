import React from 'react';
import { Mail, Calendar, User, Tag } from 'lucide-react';

export default function EmailHeader({ headerText }) {
  if (!headerText) return null;

  const lines = headerText.split('\n').filter(Boolean);
  const parsed = lines.map(parseHeaderLine);

  return (
    <div className="mb-4 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs">
      <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-telc-700" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            E-Mail Kopfzeile
          </span>
        </div>
        <span className="text-xs font-bold text-telc-800 bg-telc-100 px-2 py-1 rounded border border-telc-200">
          Posteingang
        </span>
      </div>

      <div className="p-4 space-y-2 text-xs sm:text-sm divide-y divide-slate-100">
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
                <div className="flex items-center space-x-2 w-24 flex-shrink-0 text-slate-600 font-bold text-xs uppercase tracking-wide">
                  {getHeaderIcon(item.key)}
                  <span>{item.key}:</span>
                </div>
              )}
              <div
                className={`flex-1 break-words ${
                  isSubject
                    ? 'font-bold text-slate-950 text-sm sm:text-base'
                    : 'text-slate-900 font-medium'
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
  if (lower === 'von' || lower === 'an') return <User className="w-4 h-4 text-telc-700" />;
  if (lower === 'datum') return <Calendar className="w-4 h-4 text-amber-700" />;
  if (lower === 'betreff') return <Tag className="w-4 h-4 text-blue-700" />;
  return <Mail className="w-4 h-4 text-slate-600" />;
}
