import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-semibold transition-all duration-200",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-blue-600 text-white shadow-sm hover:shadow-md",
                secondary:
                    "border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
                destructive:
                    "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
                outline: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
                success: "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100",
                warning: "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100",
                info: "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
