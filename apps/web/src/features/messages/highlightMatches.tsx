import type { ReactNode } from 'react';
import Box from '@mui/material/Box';

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
      <Box
        key={index}
        component="mark"
        sx={{ borderRadius: 0.5, px: 0.25, bgcolor: 'warning.light', color: 'warning.contrastText' }}
      >
        {part}
      </Box>
    ) : (
      part
    ),
  );
}
