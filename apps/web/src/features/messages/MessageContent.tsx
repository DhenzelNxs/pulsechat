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
    return <p className="whitespace-pre-wrap break-words">{children}</p>;
  },
  a({ href, children }) {
    if (href?.startsWith(MENTION_SCHEME)) {
      return (
        <span className="rounded bg-sky-500/15 px-1 font-medium text-sky-600 dark:text-sky-400">
          {children}
        </span>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" className="underline">
        {children}
      </a>
    );
  },
  code({ className, children }) {
    if (!className) {
      return (
        <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.85em] dark:bg-white/10">
          {children}
        </code>
      );
    }
    return <code className={className}>{children}</code>;
  },
  pre({ children }) {
    return (
      <pre className="my-1 overflow-x-auto rounded bg-slate-950 p-2 text-xs text-slate-100">
        {children}
      </pre>
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
