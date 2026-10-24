import type { ReactNode } from 'react';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightMatches(text: string, query: string): ReactNode {
  const trimmed = query.trim();
  if (!trimmed) {
    return text;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, 'ig'));

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={index}
        className="rounded bg-yellow-200 px-0.5 text-slate-900 dark:bg-yellow-500/70 dark:text-slate-950"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
