import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { PageData } from '../data/pages';
import { PageContent } from './PageContent';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  page: PageData;
  nextPage: PageData | null;
  index: number;
  total: number;
}

/**
 * Each PageTurnSection pins itself for 120vh of scroll,
 * during which the page card rotates from 0→ -90deg (left-edge book spine).
 * The next page is visible underneath, stationary.
 */
export function PageTurnSection({ page, nextPage, index, total }: Props) {
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const cardRef       = useRef<HTMLDivElement>(null);
  const shadowRef     = useRef<HTMLDivElement>(null);
  const nextCardRef   = useRef<HTMLDivElement>(null);

  const isLast = !nextPage;

  useEffect(() => {
    const wrapper  = wrapperRef.current!;
    const card     = cardRef.current!;
    const shadow   = shadowRef.current!;

    if (isLast) return; // last page just sits — no turn needed

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // Phase 1 (0–70%): rotate page away
      tl.to(card, {
        rotateY: -88,
        scale: 0.97,
        ease: 'none',
        duration: 0.7,
      }, 0);

      // Shadow grows as page lifts
      tl.to(shadow, {
        opacity: 1,
        ease: 'none',
        duration: 0.5,
      }, 0);

      // Phase 2 (70–100%): fade out entirely
      tl.to(card, {
        opacity: 0,
        ease: 'none',
        duration: 0.3,
      }, 0.7);

      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: '+=120%',
        pin: true,
        pinSpacing: true,
        scrub: 1.2,
        animation: tl,
        // Subtle ease-in on scrub progress
        onUpdate: (self) => {
          tl.progress(self.progress);
        },
      });
    }, wrapper);

    return () => ctx.revert();
  }, [isLast]);

  return (
    <div ref={wrapperRef} className="pin-wrapper w-full h-screen">
      {/* ── Viewport stage (sets perspective) ── */}
      <div className="page-stage w-full h-full relative">

        {/* ── Next page underneath (stationary) ── */}
        {nextPage && (
          <div
            ref={nextCardRef}
            className="absolute inset-0 overflow-hidden"
            style={{
              background: nextPage.bg,
              zIndex: index,
            }}
          >
            <PageContent page={nextPage} index={index + 1} total={total} />
          </div>
        )}

        {/* ── Current page (turns away) ── */}
        <div
          ref={cardRef}
          className="page-card absolute inset-0 overflow-hidden"
          style={{
            background: page.bg,
            zIndex: index + 1,
            boxShadow: '4px 0 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
          }}
        >
          <PageContent page={page} index={index} total={total} />

          {/* Book spine shadow */}
          <div className="spine-shadow" />

          {/* Right edge highlight */}
          <div className="page-edge" />

          {/* Darkening shadow that intensifies during turn */}
          <div ref={shadowRef} className="page-turn-shadow" />
        </div>
      </div>
    </div>
  );
}
