import Box from '@mui/material/Box';
import ReactMarkdown, { defaultUrlTransform, type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

const MENTION_SCHEME = 'mention:';

function urlTransform(value: string): string {
  return value.startsWith(MENTION_SCHEME) ? value : defaultUrlTransform(value);
}

function withMentionLinks(content: string): string {
  const segments = content.split(/(```[\s\S]*?```)/g);

  return segments
    .map((segment, index) => {
      if (index % 2 === 1) {
        return segment;
      }
      return segment.replace(
        /@([a-zA-Z0-9_]{3,30})/g,
        (full, username: string) => `[${full}](${MENTION_SCHEME}${username})`,
      );
    })
    .join('');
}

const components: Components = {
  p({ children }) {
    return (
      <Box component="p" sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {children}
      </Box>
    );
  },
  a({ href, children }) {
    if (href?.startsWith(MENTION_SCHEME)) {
      return (
        <Box
          component="span"
          sx={{ borderRadius: 1, px: 0.5, fontWeight: 600, bgcolor: 'rgba(14, 165, 233, 0.15)', color: 'info.main' }}
        >
          {children}
        </Box>
      );
    }
    return (
      <Box component="a" href={href} target="_blank" rel="noreferrer" sx={{ textDecoration: 'underline' }}>
        {children}
      </Box>
    );
  },
  code({ className, children }) {
    if (!className) {
      return (
        <Box
          component="code"
          sx={{
            borderRadius: 0.5,
            px: 0.5,
            py: 0.125,
            fontFamily: 'monospace',
            fontSize: '0.85em',
            bgcolor: 'action.selected',
          }}
        >
          {children}
        </Box>
      );
    }
    return <code className={className}>{children}</code>;
  },
  pre({ children }) {
    return (
      <Box
        component="pre"
        sx={{ my: 0.5, overflowX: 'auto', borderRadius: 1, p: 1, fontSize: '0.75rem', bgcolor: '#0f172a', color: '#f1f5f9' }}
      >
        {children}
      </Box>
    );
  },
};

interface MessageContentProps {
  content: string;
}

export function MessageContent({ content }: MessageContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
      urlTransform={urlTransform}
    >
      {withMentionLinks(content)}
    </ReactMarkdown>
  );
}
