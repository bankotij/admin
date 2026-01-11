import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted/50 skeleton-wave",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
