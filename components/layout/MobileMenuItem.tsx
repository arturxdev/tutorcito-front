'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileMenuItemLinkProps {
  variant: 'link';
  href: string;
  icon?: LucideIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface MobileMenuItemButtonProps {
  variant: 'button';
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}

interface MobileMenuItemCustomProps {
  variant: 'custom';
  children: React.ReactNode;
}

type MobileMenuItemProps =
  | MobileMenuItemLinkProps
  | MobileMenuItemButtonProps
  | MobileMenuItemCustomProps;

/**
 * Mobile menu item component
 * Optimized for touch with min 48px height
 * Supports link, button, and custom variants
 */
export function MobileMenuItem(props: MobileMenuItemProps) {
  if (props.variant === 'custom') {
    return <div className="w-full">{props.children}</div>;
  }

  const { icon: Icon, label, active } = props;

  const baseClasses = cn(
    'flex items-center gap-3 w-full min-h-[48px] px-6 py-3',
    'text-base font-semibold rounded-lg transition-colors',
    'hover:bg-gray-100 dark:hover:bg-gray-800',
    active
      ? 'text-docker bg-docker/10'
      : 'text-gray-700 dark:text-gray-300'
  );

  const content = (
    <>
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      <span>{label}</span>
    </>
  );

  if (props.variant === 'link') {
    return (
      <Link
        href={props.href}
        className={baseClasses}
        onClick={props.onClick}
      >
        {content}
      </Link>
    );
  }

  if (props.variant === 'button') {
    return (
      <button
        className={baseClasses}
        onClick={props.onClick}
      >
        {content}
      </button>
    );
  }

  return null;
}

/**
 * Visual separator for mobile menu sections
 */
export function MobileMenuSeparator() {
  return (
    <div className="my-2 border-t border-gray-200 dark:border-gray-800" />
  );
}
