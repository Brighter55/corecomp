import logoDark from "../assets/logoDarkMode.png";
import logoLight from "../assets/logoLightMode.png";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeContext.jsx";

type BrandProps = {
  variant: "landing" | "product";
};

function Brand({ variant }: BrandProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const path = variant === "landing" ? "/" : "/overview";
  const logo = theme === "light" ? logoLight : logoDark;

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-1 py-1 text-left"
      onClick={() => {
        navigate(path);
      }}
    >
      <img src={logo} alt="logo" className="h-12 w-12 rounded-lg" />
      <span className="text-3xl font-bold text-[var(--text-main)]">CoreComp</span>
    </button>
  );
}

export default Brand;
