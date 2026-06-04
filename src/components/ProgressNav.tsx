import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { PageData } from '../data/pages';

interface Props {
  pages: PageData[];
}

export function ProgressNav({ pages }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dots = trackRef.current?.querySelectorAll('[data-dot]');
    if (!dots) return;

    // Highlight active dot based on scroll
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const idx = Math.round(self.progress * (pages.length - 1));
        dots.forEach((dot, i) => {
          (dot as HTMLElement).style.opacity = i === idx ? '1' : '0.25';
          (dot as HTMLElement).style.transform = i === idx ? 'scale(1.4)' : 'scale(1)';
        });
      },
    });
  }, [pages.length]);

  return (
    <nav
      ref={trackRef}
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 hidden md:flex"
      aria-label="Page navigation"
    >
      {pages.map((p, i) => (
        <button
          key={p.id}
          data-dot
          aria-label={p.label}
          className="w-1.5 h-1.5 rounded-full bg-white transition-all duration-300"
          style={{ opacity: i === 0 ? 1 : 0.25 }}
          onClick={() => {
            // Scroll to approx section position
            const progress = i / (pages.length - 1);
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({ top: progress * maxScroll * 0.95, behavior: 'smooth' });
          }}
        />
      ))}
    </nav>
  );
}
