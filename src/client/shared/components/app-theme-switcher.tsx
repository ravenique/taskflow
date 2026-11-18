import { Moon, Sun } from "lucide-react";
import { useTheme } from "../shadcn/components/theme-provider";
import { Button } from "../shadcn/components/ui/button";

export function AppThemeSwitcher() {
	const { setTheme } = useTheme();

	const handleToggle = () => {
		const isDark = document.documentElement.classList.contains("dark");
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<Button variant="outline" size="icon" onClick={handleToggle}>
			<Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
			<span className="sr-only">สลับธีม</span>
		</Button>
	);
}
