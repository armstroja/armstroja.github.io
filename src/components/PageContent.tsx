import type { PageData } from '../data/pages';

interface Props {
  page: PageData;
  index: number;
  total: number;
}

export function PageContent({ page, index, total }: Props) {
  const { headline, subheadline, body, year, tag, label, layout, fg, accent } = page;

  const lines = headline.split('\n');
  const pageNum = String(index + 1).padStart(2, '0');
  const totalNum = String(total).padStart(2, '0');

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden select-none"
      style={{ color: fg }}
    >
      {/* ── Header bar ── */}
      <header className="flex items-center justify-between px-8 md:px-14 pt-8 md:pt-10 pb-4 shrink-0">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-50"
          style={{ color: fg }}>
          {label}
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] opacity-40"
          style={{ color: fg }}>
          {pageNum} / {totalNum}
        </span>
      </header>

      {/* ── Content area ── */}
      <main className="flex-1 flex flex-col px-8 md:px-14 pb-8 md:pb-14">
        {layout === 'title' && <TitleLayout lines={lines} subheadline={subheadline} body={body} year={year} fg={fg} accent={accent} />}
        {layout === 'editorial' && <EditorialLayout lines={lines} subheadline={subheadline} body={body} year={year} tag={tag} fg={fg} accent={accent} />}
        {layout === 'archive' && <ArchiveLayout lines={lines} subheadline={subheadline} body={body} year={year} tag={tag} fg={fg} accent={accent} />}
        {layout === 'split' && <SplitLayout lines={lines} subheadline={subheadline} body={body} year={year} fg={fg} accent={accent} />}
        {layout === 'minimal' && <MinimalLayout lines={lines} body={body} tag={tag} fg={fg} accent={accent} />}
      </main>

      {/* ── Footer ── */}
      <footer className="flex items-center justify-between px-8 md:px-14 pb-8 shrink-0">
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-30" style={{ color: fg }}>
          jaacck.me
        </span>
        {year && (
          <span className="font-mono text-[9px] tracking-[0.2em] opacity-30" style={{ color: fg }}>
            {year}
          </span>
        )}
      </footer>
    </div>
  );
}

/* ─────────────────────── Layout variants ─────────────────────── */

interface LayoutProps {
  lines: string[];
  subheadline?: string;
  body: string;
  year?: string;
  tag?: string;
  fg: string;
  accent: string;
}

function TitleLayout({ lines, subheadline, body, year, fg, accent }: LayoutProps) {
  return (
    <div className="flex-1 flex flex-col justify-between">
      <div className="mt-auto mb-auto">
        {/* Huge display headline */}
        <div className="mb-8">
          {lines.map((l, i) => (
            <h1
              key={i}
              className="font-display font-black leading-[0.9] tracking-[-0.03em]"
              style={{
                fontSize: 'clamp(5rem, 16vw, 14rem)',
                color: fg,
              }}
            >
              {l}
            </h1>
          ))}
        </div>

        {/* Divider */}
        <div className="w-16 h-px mb-8" style={{ background: accent }} />

        <div className="flex items-start gap-16 flex-wrap">
          <div className="max-w-sm">
            {subheadline && (
              <p className="font-mono text-xs tracking-[0.2em] uppercase mb-3 opacity-60" style={{ color: fg }}>
                {subheadline}
              </p>
            )}
            <p className="font-body text-sm md:text-base leading-relaxed opacity-70" style={{ color: fg }}>
              {body}
            </p>
          </div>
          <div className="ml-auto text-right opacity-30">
            <p className="font-display italic text-7xl md:text-9xl leading-none" style={{ color: fg }}>
              {year}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorialLayout({ lines, subheadline, body, year, tag, fg, accent }: LayoutProps) {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Tag row */}
      <div className="flex items-center gap-4 mb-12 mt-4">
        <span className="font-mono text-[9px] tracking-[0.35em] uppercase px-3 py-1.5 border opacity-50"
          style={{ borderColor: accent, color: fg }}>
          {tag}
        </span>
        <div className="h-px flex-1 opacity-20" style={{ background: fg }} />
      </div>

      {/* Headline */}
      <div className="flex-1 flex items-end">
        <div className="w-full">
          <div className="grid grid-cols-2 gap-8 items-end">
            <div>
              {lines.map((l, i) => (
                <h2
                  key={i}
                  className="font-display font-black leading-[0.88] tracking-[-0.02em]"
                  style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', color: fg }}
                >
                  {l}
                </h2>
              ))}
            </div>
            <div className="pb-2">
              {subheadline && (
                <p className="font-mono text-xs tracking-widest uppercase mb-4 opacity-50" style={{ color: fg }}>
                  {subheadline}
                </p>
              )}
              <p className="font-body text-sm leading-relaxed opacity-60" style={{ color: fg }}>
                {body}
              </p>
              <div className="mt-6 font-mono text-xs tracking-[0.2em] opacity-30" style={{ color: fg }}>
                {year}
              </div>
            </div>
          </div>
          <div className="w-full h-px mt-10 opacity-15" style={{ background: fg }} />
        </div>
      </div>
    </div>
  );
}

function ArchiveLayout({ lines, subheadline, body, year, tag, fg, accent }: LayoutProps) {
  const archiveItems = [
    { num: '001', title: 'Neue Grotesk Identity', year: '2024' },
    { num: '002', title: 'Almanac Annual Report', year: '2024' },
    { num: '003', title: 'Forma Type Specimen', year: '2023' },
    { num: '004', title: 'Grid Studies Vol. II',  year: '2023' },
    { num: '005', title: 'Monograph Series',      year: '2022' },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Headline compact */}
      <div className="mb-10 mt-4">
        <div className="flex items-baseline gap-6 flex-wrap">
          {lines.map((l, i) => (
            <h2
              key={i}
              className="font-display font-black leading-none tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', color: fg }}
            >
              {l}
            </h2>
          ))}
          {subheadline && (
            <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-40 ml-auto" style={{ color: fg }}>
              {subheadline}
            </span>
          )}
        </div>
        <div className="w-full h-px mt-4 opacity-20" style={{ background: fg }} />
      </div>

      {/* Archive list */}
      <div className="flex-1">
        {archiveItems.map((item, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between py-3 border-b opacity-70 hover:opacity-100 transition-opacity"
            style={{ borderColor: `${fg}20`, color: fg }}
          >
            <span className="font-mono text-[9px] tracking-[0.3em] opacity-40">{item.num}</span>
            <span className="font-display text-lg md:text-xl font-normal flex-1 mx-6">{item.title}</span>
            <span className="font-mono text-[9px] tracking-[0.2em] opacity-40">{item.year}</span>
          </div>
        ))}
      </div>

      {/* Body below */}
      <div className="mt-8">
        <p className="font-body text-sm leading-relaxed opacity-50 max-w-md" style={{ color: fg }}>
          {body}
        </p>
      </div>
    </div>
  );
}

function SplitLayout({ lines, subheadline, body, year, fg, accent }: LayoutProps) {
  return (
    <div className="flex-1 flex items-stretch">
      {/* Left: huge headline */}
      <div className="flex-1 flex flex-col justify-end pb-2 pr-8 border-r"
        style={{ borderColor: `${fg}15` }}>
        {lines.map((l, i) => (
          <h2
            key={i}
            className="font-display font-black leading-[0.88] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)', color: fg }}
          >
            {l}
          </h2>
        ))}
        <div className="mt-6 font-display italic text-sm opacity-40" style={{ color: fg }}>
          {year}
        </div>
      </div>

      {/* Right: vertical stack */}
      <div className="w-72 md:w-80 flex flex-col justify-between pl-8">
        <div className="mt-4">
          <div className="w-8 h-px mb-6" style={{ background: accent }} />
          {subheadline && (
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase mb-4 opacity-40" style={{ color: fg }}>
              {subheadline}
            </p>
          )}
          <p className="font-body text-sm leading-relaxed opacity-60" style={{ color: fg }}>
            {body}
          </p>
        </div>

        {/* Faux grid texture */}
        <div className="grid grid-cols-3 gap-1 opacity-10 mb-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square border" style={{ borderColor: fg }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MinimalLayout({ lines, body, tag, fg, accent }: LayoutProps) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="max-w-2xl">
        <div className="mb-10">
          {lines.map((l, i) => (
            <h2
              key={i}
              className="font-display font-black leading-[0.88] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(4rem, 11vw, 10rem)', color: fg }}
            >
              {l}
            </h2>
          ))}
        </div>
        <div className="w-12 h-px mb-8" style={{ background: accent }} />
        <p className="font-body text-base leading-relaxed opacity-60 max-w-sm mb-10" style={{ color: fg }}>
          {body}
        </p>
        {tag && (
          <a
            href={`mailto:hello@${tag}`}
            className="font-mono text-xs tracking-[0.25em] uppercase underline underline-offset-4 opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: fg }}
          >
            hello@{tag}
          </a>
        )}
      </div>
    </div>
  );
}
