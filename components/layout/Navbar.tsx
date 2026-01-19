"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, Library, ExternalLink, History } from "lucide-react";
import { Logo } from "./Logo";
import { UserMenu } from "@/components/auth/UserMenu";
import { cn } from "@/lib/utils";
import { Button3D } from "../ui/button-3d";
import { MobileMenu } from "./MobileMenu";
import { MobileMenuItem, MobileMenuSeparator } from "./MobileMenuItem";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/documentos", label: "Bancos", icon: Library },
    { href: "/historial", label: "Historial", icon: History },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard">
                <Logo size="sm" />
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-semibold transition-colors hover:text-[#590df2]",
                      pathname === item.href
                        ? "text-docker"
                        : "text-gray-600 dark:text-gray-300"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Button3D size="sm" asChild>
                <Link href="https://insigh.to/b/tutorcito" target="_blank" rel="noopener noreferrer">
                  Vota por características
                </Link>
              </Button3D>
              <UserMenu />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700 dark:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        {/* Navigation Links */}
        {navItems.map((item) => (
          <MobileMenuItem
            key={item.href}
            variant="link"
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
            onClick={() => setMobileMenuOpen(false)}
          />
        ))}

        <MobileMenuSeparator />

        {/* Voting Button */}
        <MobileMenuItem variant="custom">
          <div className="px-2">
            <Button3D asChild size="sm" className="w-full min-h-[48px]">
              <Link href="https://insigh.to/b/tutorcito" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Vota por características
              </Link>
            </Button3D>
          </div>
        </MobileMenuItem>

        <MobileMenuSeparator />

        {/* User Menu */}
        <MobileMenuItem variant="custom">
          <div className="px-6 py-2">
            <UserMenu />
          </div>
        </MobileMenuItem>
      </MobileMenu>
    </>
  );
}
