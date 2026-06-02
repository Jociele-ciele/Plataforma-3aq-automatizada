import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/interface/button";
import { useThemeStore } from "@/store/theme";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -8, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 8, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
