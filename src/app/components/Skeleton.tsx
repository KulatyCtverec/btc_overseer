interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-surface-recessed rounded animate-pulse shadow-[var(--shadow-inset)] ${className}`}
      aria-hidden
    />
  );
}
