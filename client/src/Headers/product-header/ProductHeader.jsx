import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, Moon, Sun, UserCircle2, X } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider.jsx";
import Brand from "../../shared/Brand.tsx";
import SymbolSearch from "../../shared/SymbolSearch.jsx";
import { authenticatedClient } from "../../helpers/api.js";
import { Button } from "../../components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "../../components/ui/navigation-menu";
import { useTheme } from "../../theme/ThemeContext.jsx";


function ProductHeader() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    function handleCloseNavMenu() {
        setIsMobileMenuOpen(false);
    }

    function handleItemClicked(path) {
        handleCloseNavMenu();
        navigate(path);
    }

    function handleSearchSubmit(event, symbol) {
        event.preventDefault();

        const trimmed = symbol.trim().toUpperCase();
        if (!trimmed) {
            return;
        }

        handleCloseNavMenu();
        navigate(`/overview/${encodeURIComponent(trimmed)}`);
    }

    async function handleSignoutClicked() {
        // send a request to Django with refresh token to revoke the token
        await authenticatedClient({ endpoint: "/accounts/sign-out" });
        handleCloseNavMenu();
        setUser(null);
        navigate("/sign-in");
    }

    return (
        <header className="mb-12 border-b border-[var(--line-muted)] bg-[var(--bg-main)] px-4 backdrop-blur-sm">
            <div className="mx-auto flex h-20 max-w-6xl items-center gap-4">
                <Brand variant="product" />

                <div className="hidden flex-1 items-center justify-center gap-4 md:flex">
                    <SymbolSearch
                        className="w-72 lg:w-80"
                        label="Search markets"
                        placeholder="Search markets..."
                        handleSearchSubmit={handleSearchSubmit}
                    />

                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="bg-transparent text-base capitalize hover:bg-transparent">
                                    features
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <div className="grid min-w-[240px] gap-1 p-2">
                                        <button
                                            type="button"
                                            className="rounded-xl px-3 py-2 text-left transition hover:bg-[var(--surface-soft)]"
                                            onClick={() => {
                                                handleItemClicked("/overview");
                                            }}
                                        >
                                            <p className="text-sm font-semibold text-[var(--text-main)]">Overview</p>
                                            <p className="text-xs text-[var(--text-muted)]">Browse company fundamentals and market data.</p>
                                        </button>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    <Button type="button" variant="ghost" onClick={toggleTheme} aria-label="Toggle theme" size="icon">
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--text-main)]"
                        onClick={() => {
                            handleItemClicked("/account");
                        }}
                    >
                        <UserCircle2 className="h-6 w-6" />
                    </Button>
                    <Button
                        onClick={handleSignoutClicked}
                        variant="closeOut"
                        className="rounded-xl"
                    >
                        Sign Out
                    </Button>
                </div>

                <div className="ml-auto flex items-center gap-2 md:hidden">
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl text-[var(--text-main)]"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        size="icon"
                    >
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl text-[var(--text-main)]"
                        onClick={() => {
                            setIsMobileMenuOpen((current) => !current);
                        }}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>

                    <div className={`absolute right-3 top-[calc(100%+0.5rem)] z-30 w-72 rounded-2xl border border-[var(--line-muted)] bg-[var(--surface-glass)] p-2 backdrop-blur-xl transition ${isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
                        <div className="mb-2">
                            <SymbolSearch
                                className="w-full"
                                label="Search markets"
                                placeholder="Search markets..."
                                handleSearchSubmit={handleSearchSubmit}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            className="mb-1 flex w-full justify-start rounded-xl text-[var(--text-main)]"
                            onClick={() => {
                                handleItemClicked("/overview");
                            }}
                        >
                            Features
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="mb-1 flex w-full justify-start rounded-xl text-[var(--text-main)]"
                            onClick={() => {
                                handleItemClicked("/account");
                            }}
                        >
                            <UserCircle2 className="mr-2 h-5 w-5" />
                            Account
                        </Button>
                        <Button
                            type="button"
                            variant="forest"
                            className="w-full justify-start rounded-xl"
                            onClick={handleSignoutClicked}
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default ProductHeader;
