'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register ScrollTrigger globally
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: window.innerWidth <= 768 ? 0.15 : 0.1,
      smoothWheel: true,
      touchMultiplier: 1.5,
      // Skip Lenis for any element that manages its own scroll
      prevent: (node: Element) => {
        const style = window.getComputedStyle(node);
        return (
          style.overflowY === 'scroll' ||
          style.overflowY === 'auto' ||
          style.overflowX === 'scroll' ||
          style.overflowX === 'auto' ||
          node.hasAttribute('data-lenis-prevent')
        );
      },
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFunction = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerFunction);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerFunction);
    };
  }, []);

  return <>{children}</>;
}
