interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-[#1a1a1a] rounded animate-pulse ${className}`}
      aria-hidden
    />
  );
}
