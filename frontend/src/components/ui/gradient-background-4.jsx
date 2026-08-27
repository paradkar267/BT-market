import { useTheme } from "../../ThemeContext";

export const GradientBackground = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!isDark) return null;

  return (
    <div className="fixed inset-0 h-full w-full -z-50 bg-[#000000] [background:radial-gradient(125%_125%_at_50%_-50%,#4f46e51a_40%,transparent_100%)]"></div>
  );
};
