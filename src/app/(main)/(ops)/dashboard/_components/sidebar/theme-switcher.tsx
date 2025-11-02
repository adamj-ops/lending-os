"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { updateThemeMode } from "@/lib/theme-utils";
import { setValueToCookie } from "@/server/server-actions";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export function ThemeSwitcher() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);

  const handleValueChange = async () => {
    const newTheme = themeMode === "dark" ? "light" : "dark";
    updateThemeMode(newTheme);
    setThemeMode(newTheme);
    await setValueToCookie("theme_mode", newTheme);
  };

  return (
    <Button size="icon" onClick={handleValueChange}>
      {themeMode === "dark" ? <IconSun size={20} stroke={2} /> : <IconMoon size={20} stroke={2} />}
    </Button>
  );
}
