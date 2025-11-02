import { IconLoader2 } from "@tabler/icons-react";

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<typeof IconLoader2>) {
  return (
    <IconLoader2
      size={16}
      stroke={2}
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
