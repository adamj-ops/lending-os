"use client"

import { IconCircleCheck, IconAlertCircle, IconLoader2, IconX, IconAlertTriangle } from "@tabler/icons-react";
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <IconCircleCheck size={16} stroke={2} />,
        info: <IconAlertCircle size={16} stroke={2} />,
        warning: <IconAlertTriangle size={16} stroke={2} />,
        error: <IconX size={16} stroke={2} />,
        loading: <IconLoader2 size={16} stroke={2} className="animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
