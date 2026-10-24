export const MENTION_PATTERN = /@([a-zA-Z0-9_]{3,30})/g;

export function parseMentionCandidates(content: string): string[] {
  const candidates = new Set<string>();

  for (const match of content.matchAll(MENTION_PATTERN)) {
    const username = match[1];
    if (username) {
      candidates.add(username);
    }
  }

  return Array.from(candidates);
}
