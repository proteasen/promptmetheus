import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus as dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

interface MarkdownProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string;
  className?: string;
}

export const Markdown = forwardRef<HTMLDivElement, MarkdownProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('prose dark:prose-invert max-w-none', className)}
        {...props}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, className, children, ...props }: {
              node?: any;
              className?: string;
              children?: React.ReactNode;
              [key: string]: any;
            }) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !className?.includes('language-');
              
              if (isInline) {
                return (
                  <code className={cn('bg-muted px-1 py-0.5 rounded', className)} {...props}>
                    {children}
                  </code>
                );
              }

              return match ? (
                <SyntaxHighlighter
                  style={dark}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-md text-sm"
                  showLineNumbers
                  wrapLines
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <pre className="bg-muted p-2 rounded overflow-auto">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
            a: (props) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              />
            ),
            ul: (props) => (
              <ul className="list-disc pl-6 my-2" {...props} />
            ),
            ol: (props) => (
              <ol className="list-decimal pl-6 my-2" {...props} />
            ),
            blockquote: (props) => (
              <blockquote
                className="border-l-4 border-muted-foreground/20 pl-4 italic my-2"
                {...props}
              />
            ),
            table: (props) => (
              <div className="my-2 w-full overflow-x-auto">
                <table className="w-full border-collapse" {...props} />
              </div>
            ),
            th: (props) => (
              <th
                className="border px-4 py-2 text-left bg-muted/50"
                {...props}
              />
            ),
            td: (props) => (
              <td className="border px-4 py-2" {...props} />
            ),
            h1: (props) => (
              <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
            ),
            h2: (props) => (
              <h2 className="text-xl font-bold mt-5 mb-3" {...props} />
            ),
            h3: (props) => (
              <h3 className="text-lg font-bold mt-4 mb-2" {...props} />
            ),
            p: (props) => (
              <p className="my-2 leading-relaxed" {...props} />
            ),
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  }
);

Markdown.displayName = 'Markdown';
