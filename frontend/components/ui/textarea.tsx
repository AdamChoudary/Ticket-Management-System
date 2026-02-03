import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[120px] w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm transition-all duration-200",
                    "placeholder:text-gray-400",
                    "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
