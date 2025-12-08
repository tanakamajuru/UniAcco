import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center cursor-pointer text-[#2E4057] dark:text-[#E8EEF4]">
        <Sun className="h-5 w-5" />
      </div>
    )
  }

  return (
    <div
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 flex items-center justify-center cursor-pointer text-[#2E4057] dark:text-[#E8EEF4] hover:text-[#4A90E2] dark:hover:text-[#64B5F6] hover:scale-110 transition-all duration-200 rounded-full"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Moon className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </div>
  )
}
