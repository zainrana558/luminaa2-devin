import { Skeleton } from "@/components/ui/skeleton";
import SkeletonRow from "@/components/browse/SkeletonRow";

export default function BrowseLoading() {
  return (
    <div>
      <Skeleton className="h-[70vh] w-full md:h-[85vh]" />
      <div className="-mt-16 relative z-10 space-y-8 pb-12">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}
