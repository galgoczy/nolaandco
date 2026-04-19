import { readFileSync } from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RevealOnScroll from '@/components/ui/RevealOnScroll';

export const metadata = {
  title: 'Adatkezelési tájékoztató – Nola & Co.',
  description: 'A Nola & Co. adatkezelési tájékoztatója (GDPR).',
};

export default function AdatkezelesPage() {
  const mdPath = path.join(process.cwd(), 'public', 'adatkezelesi_tajekoztato.md');
  const raw = readFileSync(mdPath, 'utf-8');
  const content = raw.replace(/^#\s+.*\n?/, '');

  return (
    <section className="min-h-screen bg-warm-beige py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <RevealOnScroll>
          <h1 className="montserrat-light-caps text-4xl md:text-5xl text-carbon mb-4 text-center">
            Adatkezelési Tájékoztató
          </h1>
          <div className="w-12 h-[2px] bg-primary mx-auto mb-12" />
        </RevealOnScroll>

        <div className="text-carbon-light font-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="text-lg text-carbon font-medium mt-10 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base text-carbon font-medium mt-6 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-base leading-relaxed mb-4">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside ml-5 space-y-1 mb-4 text-sm">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside ml-5 space-y-1 mb-4 text-sm">{children}</ol>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              a: ({ href, children }) => {
                const external = href?.startsWith('http');
                return (
                  <a
                    href={href}
                    className="text-[#C4A591] underline underline-offset-2 hover:text-[#4A4A4A] transition-colors break-words"
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                );
              },
              strong: ({ children }) => <strong className="text-carbon">{children}</strong>,
              hr: () => <hr className="my-8 border-[#4A4A4A]/15" />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
