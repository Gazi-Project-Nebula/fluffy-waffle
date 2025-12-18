"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative rounded-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-300"
    >
      {/* Sun Icon: Visible in Light, Hidden in Dark */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 ease-in-out dark:-rotate-90 dark:scale-0 text-amber-500" />
      
      {/* Moon Icon: Hidden in Light, Visible in Dark */}
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 ease-in-out dark:rotate-0 dark:scale-100 text-indigo-400" />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}