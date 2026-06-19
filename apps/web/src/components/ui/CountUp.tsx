'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function CountUp({ end, duration = 1500, suffix = '', prefix = '', className }: CountUpProps) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number>(0);
  const frameId = useRef<number>(0);

  useEffect(() => {
    startTime.current = Date.now();

    function tick() {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        frameId.current = requestAnimationFrame(tick);
      }
    }

    frameId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId.current);
  }, [end, duration]);

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}
