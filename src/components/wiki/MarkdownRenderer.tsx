import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { CodeBlock } from './CodeBlock';
import '../../styles/components/markdown.css';

// Import highlight.js styles (we'll use a dark theme that works in both modes)
import 'highlight.js/styles/atom-one-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Custom components for react-markdown
  const components = useMemo(
    () => ({
      // Custom code block rendering
      code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : 'text';
        const codeString = String(children).replace(/\n$/, '');

        // For inline code, use simple code element
        if (inline) {
          return (
            <code className="inline-code" {...props}>
              {children}
            </code>
          );
        }

        // For code blocks, use our custom CodeBlock component
        return (
          <CodeBlock
            code={codeString}
            language={language}
            showLineNumbers={codeString.split('\n').length > 5}
          />
        );
      },

      // Custom pre rendering (just pass through, code handles it)
      pre({ children }: any) {
        return <>{children}</>;
      },

      // Add IDs to headings for anchor links
      h1: ({ children, id, ...props }: any) => (
        <h1 id={id} {...props}>
          <a href={`#${id}`}>{children}</a>
        </h1>
      ),
      h2: ({ children, id, ...props }: any) => (
        <h2 id={id} {...props}>
          <a href={`#${id}`}>{children}</a>
        </h2>
      ),
      h3: ({ children, id, ...props }: any) => (
        <h3 id={id} {...props}>
          <a href={`#${id}`}>{children}</a>
        </h3>
      ),
      h4: ({ children, id, ...props }: any) => (
        <h4 id={id} {...props}>
          <a href={`#${id}`}>{children}</a>
        </h4>
      ),

      // External links open in new tab
      a: ({ href, children, ...props }: any) => {
        const isExternal = href?.startsWith('http');
        return (
          <a
            href={href}
            {...props}
            {...(isExternal && {
              target: '_blank',
              rel: 'noopener noreferrer',
            })}
          >
            {children}
          </a>
        );
      },

      // Tables with wrapper for horizontal scroll
      table: ({ children, ...props }: any) => (
        <div style={{ overflowX: 'auto' }}>
          <table {...props}>{children}</table>
        </div>
      ),

      // Images with loading lazy
      img: ({ src, alt, ...props }: any) => (
        <img src={src} alt={alt || ''} loading="lazy" {...props} />
      ),
    }),
    []
  );

  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
