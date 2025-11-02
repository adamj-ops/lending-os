"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setPreference } from "@/server/server-actions";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";
import type { ThemeMode } from "@/types/preferences/theme";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const setThemeMode = usePreferencesStore((state) => state.setThemeMode);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    if (themeMode === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [themeMode, mounted]);

  const handleThemeChange = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await setPreference("theme_mode", mode);
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <IconSun size={20} stroke={2} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <IconSun size={20} stroke={2} className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <IconMoon size={20} stroke={2} className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
