import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-white shadow hover:bg-slate-800",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200",
        destructive:
          "border-red-200 bg-red-50 text-[#DC2626] font-medium",
        outline: "text-[#111827] border-[#E5E7EB]",
        student:
          "border-indigo-200 bg-[#EEF2FF] text-[#4F46E5] font-medium",
        admin:
          "border-purple-200 bg-purple-50 text-purple-700 font-medium",
        success:
          "border-green-200 bg-green-50 text-[#16A34A] font-medium",
        warning:
          "border-amber-200 bg-amber-50 text-[#D97706] font-medium",
        neutral:
          "border-[#E5E7EB] bg-gray-50 text-[#6B7280] font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
