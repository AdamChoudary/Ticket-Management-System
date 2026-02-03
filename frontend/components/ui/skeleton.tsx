import { Card } from "./card";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200", className)}
            {...props}
        />
    );
}

export function TicketRowSkeleton() {
    return (
        <div className="border-b border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-5" />
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Status cards skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-6">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-16" />
                    </Card>
                ))}
            </div>

            {/* Tickets list skeleton */}
            <Card>
                <div className="p-6 border-b border-gray-200">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div>
                    {[...Array(5)].map((_, i) => (
                        <TicketRowSkeleton key={i} />
                    ))}
                </div>
            </Card>
        </div>
    );
}
