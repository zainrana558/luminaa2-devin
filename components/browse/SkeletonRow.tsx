import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonRow() {
  return (
    <div className="space-y-2 px-4 md:px-8">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-36 flex-shrink-0 rounded-lg md:w-44" />
        ))}
      </div>
    </div>
  );
}
