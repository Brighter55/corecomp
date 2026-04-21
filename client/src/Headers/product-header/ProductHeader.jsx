import { useNavigate } from 'react-router-dom';
import { useState } from "react"
import { Menu, UserCircle2, X } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider.jsx"
// components
import Features from "./components/Features.jsx"
import Brand from "../../shared/Brand.tsx";
import HideOnScroll from "../components/HideOnScroll.jsx"
import { authenticatedClient } from '../../helpers/api.js';
import { Button } from "../../components/ui/button";


function ProductHeader() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleOpenNavMenu = () => {
        setIsMobileMenuOpen(true);
    };

    const handleCloseNavMenu = () => {
        setIsMobileMenuOpen(false);
    };

    function handleItemClicked(path) {
        navigate(path);
    }

    async function handleSignoutClicked() {
        // send a request to Django with refresh token to revoke the token
        await authenticatedClient({ endpoint: "/accounts/sign-out" });
        handleCloseNavMenu();
        setUser(null);
        navigate("/sign-in");
    }

    return (
        <HideOnScroll>
            <header className="sticky top-4 z-40 mb-16 rounded-3xl border border-[var(--line-muted)] bg-[var(--surface-glass)] shadow-sm backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-3 sm:px-4">
                    <div className="flex min-h-20 items-center gap-2">
                        <Brand variant="product" />
                        <Features />
                        <div className="hidden items-center gap-2 md:flex">
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-xl text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--text-main)]"
                                onClick={() => { handleItemClicked("/account"); }}
                            >
                                <UserCircle2 className="h-6 w-6" />
                            </Button>
                            <Button
                                onClick={handleSignoutClicked}
                                variant="forest"
                                className="rounded-xl"
                            >
                                Sign Out
                            </Button>
                        </div>
                        <div className="md:hidden">
                            <Button
                                type="button"
                                variant="ghost"
                                className="rounded-xl text-[var(--text-main)]"
                                onClick={handleOpenNavMenu}
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>

                            <div
                                className={`absolute right-3 top-[calc(100%+0.5rem)] z-30 w-56 rounded-2xl border border-[var(--line-muted)] bg-[var(--surface-glass)] p-2 backdrop-blur-xl transition ${isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="mb-1 flex w-full justify-start rounded-xl text-[var(--text-main)]"
                                    onClick={() => {
                                        handleCloseNavMenu();
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
                </div>
            </header>
        </HideOnScroll>
    );
}

export default ProductHeader;
