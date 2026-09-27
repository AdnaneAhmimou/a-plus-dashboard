"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FlaskConical,
  // CalendarDays, // Appointments — re-enable with the nav entry below
  // FileText,     // Documents — re-enable with the nav entry below
  Users,
  Package,
  Settings,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

import { useTranslations } from "next-intl";

import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  /** Key under the "nav" namespace in messages/*.json, not a literal. */
  labelKey: string;
  icon: LucideIcon;
}

export const PATIENT_NAV: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutGrid },
  { href: "/dashboard/results", labelKey: "myResults", icon: FlaskConical },
  // Hidden until the features behind them exist — linking to a page
  // that does nothing is worse than not offering it. Uncomment both the
  // entry and its icon import to bring one back.
  // { href: "/dashboard/appointments", labelKey: "appointments", icon: CalendarDays },
  // { href: "/dashboard/documents", labelKey: "documents", icon: FileText },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", labelKey: "overview", icon: BarChart3 },
  { href: "/admin/patients", labelKey: "patients", icon: Users },
  { href: "/admin/boxes", labelKey: "boxes", icon: Package },
];

export function Sidebar({
  navItems = PATIENT_NAV,
  sectionLabelKey = "patientSpace",
  settingsHref = "/dashboard/settings",
}: {
  navItems?: NavItem[];
  sectionLabelKey?: string;
  settingsHref?: string;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <aside className="sticky top-0 flex h-screen w-[250px] shrink-0 flex-col border-r border-border bg-card">
      <div className="px-6 pt-6 pb-4">
        <Logo height={36} />
      </div>

      <div className="px-3.5">
        <p className="px-2.5 pt-2 pb-3 text-[11px] font-bold tracking-wide text-faint uppercase">
          {t(sectionLabelKey)}
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, labelKey, icon: Icon }) => {
            const active =
              href === "/dashboard" || href === "/admin"
                ? pathname === href
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-secondary text-primary"
                    : "text-ink-soft hover:bg-muted"
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2 : 1.7}
                  className={active ? "text-primary" : "text-muted-foreground"}
                />
                {t(labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-3.5">
        <Link
          href={settingsHref}
          className="flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          <Settings size={20} strokeWidth={1.7} />
          {t("settings")}
        </Link>
      </div>
    </aside>
  );
}
