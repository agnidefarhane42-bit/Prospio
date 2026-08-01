'use client';

import React from 'react';
import { Zap, Activity, Info } from 'lucide-react';

interface SignalsBadgeProps {
  score: number | null | undefined;
  signals: string | null | undefined;
  showDetailsInline?: boolean;
}

export default function SignalsBadge({
  score,
  signals,
  showDetailsInline = false,
}: SignalsBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
        <Activity className="w-3 h-3 text-gray-400" />
        <span>Non analysé</span>
      </span>
    );
  }

  // Parse signals string or array
  let parsedSignals: string[] = [];
  if (signals) {
    try {
      const parsed = JSON.parse(signals);
      if (Array.isArray(parsed)) {
        parsedSignals = parsed.map(String);
      } else if (typeof parsed === 'string') {
        parsedSignals = [parsed];
      }
    } catch {
      parsedSignals = signals.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  // Determine badge colors based on score
  // Rouge < 30, Orange 30-60, Vert > 60
  let colorStyle = {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100',
    dot: 'bg-emerald-500',
    icon: 'text-emerald-600',
  };

  if (score < 30) {
    colorStyle = {
      badge: 'bg-red-50 text-red-700 border-red-200/80 hover:bg-red-100',
      dot: 'bg-red-500',
      icon: 'text-red-600',
    };
  } else if (score <= 60) {
    colorStyle = {
      badge: 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100',
      dot: 'bg-amber-500',
      icon: 'text-amber-600',
    };
  }

  const tooltipText =
    parsedSignals.length > 0
      ? `Signaux: ${parsedSignals.join(' • ')}`
      : `Score d'intention: ${score}%`;

  return (
    <div className="relative group inline-block">
      <div
        title={tooltipText}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors cursor-help ${colorStyle.badge}`}
      >
        <Zap className={`w-3.5 h-3.5 ${colorStyle.icon}`} />
        <span>{score}%</span>
        <span className={`w-1.5 h-1.5 rounded-full ${colorStyle.dot}`} />
      </div>

      {/* Tooltip au survol */}
      {parsedSignals.length > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-30 w-56 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl pointer-events-none transition-all duration-150">
          <div className="flex items-center space-x-1 mb-1.5 text-slate-300 font-semibold border-b border-slate-800 pb-1">
            <Info className="w-3 h-3 text-sky-400" />
            <span>Signaux d'intention ({score}%)</span>
          </div>
          <ul className="space-y-1">
            {parsedSignals.map((signal, idx) => (
              <li key={idx} className="flex items-start space-x-1.5 text-slate-200">
                <span className="text-sky-400 font-bold">•</span>
                <span className="leading-tight">{signal}</span>
              </li>
            ))}
          </ul>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}

      {showDetailsInline && parsedSignals.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {parsedSignals.map((sig, idx) => (
            <span
              key={idx}
              className="inline-block px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded"
            >
              {sig}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
