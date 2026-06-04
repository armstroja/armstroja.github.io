import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from './hooks/useLenis';
import { PageTurnSection } from './components/PageTurnSection';
import { ProgressNav } from './components/ProgressNav';
import { Cursor } from './components/Cursor';
import { pages } from './data/pages';
import './styles/globals.css';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useLenis();

  // Refresh ScrollTrigger on resize
  useEffect(() => {
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      {/* Film grain */}
      <div className="grain fixed inset-0 pointer-events-none z-[9997]" />

      {/* Custom cursor */}
      <Cursor />

      {/* Page navigation dots */}
      <ProgressNav pages={pages} />

      {/* Scroll container */}
      <div className="scroll-container">
        {pages.map((page, i) => (
          <PageTurnSection
            key={page.id}
            page={page}
            nextPage={pages[i + 1] ?? null}
            index={i}
            total={pages.length}
          />
        ))}
      </div>
    </>
  );
}
