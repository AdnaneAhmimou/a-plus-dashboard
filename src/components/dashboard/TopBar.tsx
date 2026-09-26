import Link from "next/link";
import { Search, Bell, LogOut } from "lucide-react";

import { LogoutButton } from "@/components/auth/LogoutButton";

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function NotificationBell({
  href,
  unreadCount,
}: {
  href?: string;
  unreadCount?: number;
}) {
  const badge =
    unreadCount && unreadCount > 0 ? (
      <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-[1.5px] border-background bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    ) : href ? null : (
      <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full border-[1.5px] border-background bg-primary" />
    );

  if (href) {
    return (
      <Link href={href} className="relative text-ink-soft" aria-label="Notifications">
        <Bell size={22} strokeWidth={1.7} />
        {badge}
      </Link>
    );
  }

  return (
    <button type="button" className="relative text-ink-soft" aria-label="Notifications">
      <Bell size={22} strokeWidth={1.7} />
      {badge}
    </button>
  );
}

export function TopBar({
  firstName,
  lastName,
  roleLabel,
  searchPlaceholder = "Search an analysis...",
  notificationHref,
  unreadCount,
}: {
  firstName: string;
  lastName: string;
  roleLabel: string;
  searchPlaceholder?: string;
  notificationHref?: string;
  unreadCount?: number;
}) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-background px-8 py-4">
      <div className="relative w-80 max-w-[45vw]">
        <Search
          size={17}
          strokeWidth={1.9}
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-faint"
        />
        <input
          placeholder={searchPlaceholder}
          className="w-full rounded-[11px] border border-border bg-card py-2.5 pr-3 pl-10 text-sm font-medium text-foreground outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-5">
        <NotificationBell href={notificationHref} unreadCount={unreadCount} />

        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-deep font-display text-[13px] font-bold text-white">
            {initials(firstName, lastName)}
          </div>
          <div>
            <div className="text-[13.5px] leading-tight font-bold text-foreground">
              {firstName} {lastName}
            </div>
            <div className="mt-0.5 text-[11.5px] leading-none font-semibold text-muted-foreground">
              {roleLabel}
            </div>
          </div>
        </div>

        <LogoutButton variant="icon">
          <LogOut size={18} strokeWidth={1.8} />
        </LogoutButton>
      </div>
    </div>
  );
}
