import { Skeleton } from "@/components/ui/skeleton";

export default function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
}
