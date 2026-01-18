'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { GraduationCap, Menu } from 'lucide-react';
import { Button3D } from '@/components/ui/button-3d';
import { MobileMenu } from './MobileMenu';
import { MobileMenuItem, MobileMenuSeparator } from './MobileMenuItem';

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: '#features', label: 'Características' },
  { href: '#how-it-works', label: 'Cómo funciona' },
  { href: '#pricing', label: 'Precios' },
];

/**
 * Landing page navbar with mobile menu functionality
 * Desktop: Horizontal layout with inline links
 * Mobile: Hamburger menu with drawer
 */
export function LandingNavbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-x border-gray-300 dark:border-gray-800">
      <div className="px-4 md:px-8 py-4 flex items-center justify-between w-full max-w-[1280px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="text-[#2460FF] w-8 h-8" />
          <h2 className="text-[#2460FF] dark:text-white text-2xl font-black tracking-tight">
            Tutorcito
          </h2>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 justify-end gap-6 items-center">
          <div className="flex items-center gap-6 mr-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                className="text-gray-600 dark:text-gray-300 text-sm font-semibold hover:text-[#590df2] transition-colors"
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Conditional rendering based on auth state */}
          {!isLoaded ? (
            // Loading state - show skeleton
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
            </div>
          ) : isSignedIn ? (
            // User is authenticated - show Dashboard button + avatar
            <div className="flex items-center gap-3">
              <Button3D asChild size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button3D>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                    userButtonTrigger:
                      'focus:shadow-none hover:opacity-80 transition-opacity',
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          ) : (
            // User is not authenticated - show login/signup buttons
            <div className="flex gap-3">
              <Button3D size="sm" variant="outline" asChild>
                <Link href="/sign-in">
                  <span>Iniciar sesión</span>
                </Link>
              </Button3D>
              <Button3D asChild size="sm">
                <Link href="/sign-in">
                  <span>Regístrate</span>
                </Link>
              </Button3D>
            </div>
          )}
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

      {/* Mobile Menu Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        {/* Navigation Links */}
        {navLinks.map((link) => (
          <MobileMenuItem
            key={link.href}
            variant="link"
            href={link.href}
            label={link.label}
            onClick={(e) => {
              const anchor = e.currentTarget as HTMLAnchorElement;
              handleNavClick(e as any, anchor.href.split('#')[1] ? `#${anchor.href.split('#')[1]}` : anchor.href);
            }}
          />
        ))}

        <MobileMenuSeparator />

        {/* Auth Buttons */}
        {isLoaded && (
          <>
            {isSignedIn ? (
              // Authenticated user
              <div className="flex flex-col gap-2">
                <MobileMenuItem
                  variant="link"
                  href="/dashboard"
                  label="Dashboard"
                />
                <MobileMenuItem variant="custom">
                  <div className="px-6 py-2">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: 'w-10 h-10',
                          userButtonTrigger:
                            'focus:shadow-none hover:opacity-80 transition-opacity',
                        },
                      }}
                      afterSignOutUrl="/"
                    />
                  </div>
                </MobileMenuItem>
              </div>
            ) : (
              // Not authenticated
              <div className="flex flex-col gap-3 px-2">
                <Button3D asChild size="sm" variant="outline" className="w-full min-h-[48px]">
                  <Link href="/sign-in">
                    <span>Iniciar sesión</span>
                  </Link>
                </Button3D>
                <Button3D asChild size="sm" className="w-full min-h-[48px]">
                  <Link href="/sign-in">
                    <span>Regístrate</span>
                  </Link>
                </Button3D>
              </div>
            )}
          </>
        )}
      </MobileMenu>
    </nav>
  );
}
