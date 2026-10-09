import { Bell } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EnablePushButton } from "@/components/notifications/EnablePushButton";

// Shared by both /dashboard/notifications (patient) and
// /admin/notifications — same list-and-mark-as-read behavior, only the
// section label above the heading differs. A Server Component (not a
// route handler) since it does the data fetch + mark-as-read itself; each
// page just renders it inside its own layout.
export async function NotificationsFeed({
  userId,
  sectionLabel,
}: {
  userId: string;
  sectionLabel: string;
}) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Capture which were unread before marking them read below, so this
  // render still highlights what's new — the visit itself is what clears
  // the badge for next time.
  const unreadIds = new Set(notifications.filter((n) => !n.read).map((n) => n.id));

  if (unreadIds.size > 0) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  return (
    <div>
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
          {sectionLabel}
        </p>
        <h1 className="font-display text-[28px] font-extrabold tracking-[-0.6px] text-foreground">
          Notifications
        </h1>
      </div>

      <div className="mb-5">
        <EnablePushButton />
      </div>

      {notifications.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
            <Bell size={28} strokeWidth={1.7} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            You don&apos;t have any notifications yet.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 px-5 py-4 ${
                  unreadIds.has(n.id) ? "bg-secondary/40" : ""
                }`}
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Bell size={14} strokeWidth={1.9} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {n.createdAt.toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
