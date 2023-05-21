"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import Icons from "./Icons"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="hover:dark:bg-blue-700 hover:bg-blue-500 bg-blue-400 dark:bg-blue-900 rounded-full border border-black dark:border-white">
          <Icons.Moon className="text-violet-400 text-2xl absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 " />
          <Icons.Sun className="text-yellow-400 rotate-0 text-2xl scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="z-[100] gap-1 grid dark:text-white text-black dark:bg-zinc-900 bg-zinc-200" forceMount>
        <DropdownMenuItem className="bg-blue-400 hover:bg-blue-600" onClick={() => setTheme("light")}>
          <Icons.Sun className="text-yellow-400 mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="bg-blue-900 hover:bg-blue-600" onClick={() => setTheme("dark")}>
          <Icons.Moon className="text-violet-400 mr-2 h-4 w-4" />
          <span className='text-white'>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white" onClick={() => setTheme("system")}>
          <Icons.Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
