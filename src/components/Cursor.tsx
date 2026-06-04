import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current!;
    const ring = ringRef.current!;

    const move = (e: MouseEvent) => {
      gsap.to(dot,  { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
    };

    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <>
      <div ref={dotRef}  className="custom-cursor" />
      <div ref={ringRef} className="custom-cursor-ring" />
    </>
  );
}
