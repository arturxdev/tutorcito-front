"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { UserMenu } from "@/components/auth/UserMenu";
import { cn } from "@/lib/utils";
import { Button3D } from "../ui/button-3d";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/documentos", label: "Bancos" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container w-4/5 mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard">
              <Logo size="sm" />
            </Link>

            {/* <div className="hidden md:flex items-center gap-6">
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
            </div> */}
          </div>
          <div className="flex">
            <Button3D size="sm" asChild>
              <Link href="https://insigh.to/b/tutorcito" target="_blank">Vota por nuevas caracteristricas</Link>
            </Button3D>
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
