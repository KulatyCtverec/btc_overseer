import { useEffect, useRef, useState } from "react";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const DURATION_MS = 400;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

interface AnimatedPriceProps {
  value: number;
  className?: string;
}

export function AnimatedPrice({ value, className }: AnimatedPriceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const displayValueRef = useRef(value);
  const prevValueRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (value === prevValueRef.current) return;

    const start = displayValueRef.current;
    prevValueRef.current = value;
    const end = value;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION_MS, 1);
      const eased = easeOutCubic(t);
      const current = start + (end - start) * eased;
      setDisplayValue(current);
      displayValueRef.current = current;

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevValueRef.current = value;
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value]);

  return <span className={className}>{formatPrice(displayValue)}</span>;
}
