import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-12 w-1/2 rounded-xl" />
      <Skeleton className="h-72 w-full rounded-3xl" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
