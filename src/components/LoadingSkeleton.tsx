import { cn } from "~/lib/utils";

interface LoadingSkeletonProps {
  /** Number of content rows (default 5) */
  rows?: number;
  /** Show a title bar at top (default true) */
  showTitle?: boolean;
  /** Additional class names */
  className?: string;
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 rounded bg-muted animate-pulse",
        className,
      )}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <SkeletonBar className="w-1/3" />
          <SkeletonBar className="w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonBar className="w-full" />
        <SkeletonBar className="w-4/5" />
      </div>
    </div>
  );
}

/**
 * LoadingSkeleton — animated placeholder for pages that are loading data.
 * Use as `pendingComponent` in route definitions or inline in component loading states.
 */
export function LoadingSkeleton({
  rows = 5,
  showTitle = true,
  className,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "w-full max-w-6xl mx-auto px-6 py-12 space-y-6",
        className,
      )}
      role="status"
      aria-label="Chargement en cours"
    >
      {showTitle && (
        <div className="space-y-3 mb-8">
          <SkeletonBar className="h-8 w-1/3" />
          <SkeletonBar className="h-5 w-1/2" />
        </div>
      )}

      {/* Content rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBar
            key={i}
            className={i % 3 === 0 ? "w-full" : i % 3 === 1 ? "w-3/4" : "w-1/2"}
          />
        ))}
      </div>

      {/* Card grid skeleton for directory/catalog pages */}
      {rows >= 4 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={`card-${i}`} />
          ))}
        </div>
      )}

      <span className="sr-only">Chargement...</span>
    </div>
  );
}

export { SkeletonBar, SkeletonCard };
