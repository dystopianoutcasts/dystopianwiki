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
      // Custom pre rendering - wraps code blocks
      pre({ children, ...props }: any) {
        // Extract the code element from pre's children
        const codeElement = children?.props;
        if (!codeElement) return <pre {...props}>{children}</pre>;

        const className = codeElement.className || '';
        const match = /language-(\w+)/.exec(className);
        const language = match ? match[1] : 'text';
        const codeString = String(codeElement.children).replace(/\n$/, '');

        return (
          <CodeBlock
            code={codeString}
            language={language}
            showLineNumbers={codeString.split('\n').length > 5}
          />
        );
      },

      // Inline code - NOT wrapped in pre
      code({ node, className, children, ...props }: any) {
        // If this code has a language class or contains newlines, it's likely a block
        // But since we handle blocks in pre, this should only receive inline code
        const hasLanguage = /language-(\w+)/.test(className || '');
        const content = String(children);
        const isMultiLine = content.includes('\n');

        // Truly inline code (no language, single line)
        if (!hasLanguage && !isMultiLine) {
          return (
            <code className="inline-code" {...props}>
              {children}
            </code>
          );
        }

        // Fallback for edge cases
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
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
