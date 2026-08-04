import Link from "next/link";
import {
  CloudSun,
  LayoutDashboard,
  Radar,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavVariant = "sidebar" | "rail" | "bottom";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/forecast", label: "Prakiraan", icon: CloudSun },
  { href: "/radar", label: "Peta Radar", icon: Radar },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navigasi utama Awanara. Murni presentasional: pathname diterima sebagai
 * prop agar mudah diuji dan di-storybook.
 *
 * Accessibility:
 * - Link aktif memakai aria-current="page"
 * - Label ikon pakai aria-hidden; teks label tetap accessible name
 * - Ukuran target sentuh >= 44px (kelas min-h/mobile)
 */
export function Navigation({
  pathname,
  variant,
  onNavigate,
}: {
  pathname: string;
  variant: NavVariant;
  onNavigate?: () => void;
}) {
  const base =
    "flex items-center gap-3 rounded-md text-sm font-medium transition-colors";
  const activeCls = "bg-nav-active text-on-nav-active";
  const idleCls =
    "text-text-muted hover:bg-surface-container hover:text-text";

  const classes: Record<NavVariant, string> = {
    sidebar: "px-4 py-3 w-full",
    rail: "flex-col justify-center w-full min-h-[44px] px-0 py-3 gap-1 text-xs",
    bottom: "flex-1 flex-col justify-center min-h-16 px-1 py-2 gap-1 text-xs",
  };

  const listCls: Record<NavVariant, string> = {
    sidebar: "flex flex-col gap-1",
    rail: "flex flex-col gap-2 items-stretch",
    bottom: "flex items-stretch",
  };

  return (
    <nav aria-label="Navigasi utama">
      <ul className={listCls[variant]}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className={variant === "bottom" ? "flex-1" : undefined}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`${base} ${classes[variant]} ${
                  active ? activeCls : idleCls
                }`}
              >
                <Icon
                  className={variant === "sidebar" ? "h-5 w-5 shrink-0" : "h-5 w-5 shrink-0"}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
