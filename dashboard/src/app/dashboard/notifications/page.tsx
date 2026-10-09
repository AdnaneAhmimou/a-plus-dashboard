import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";
import { NotificationsFeed } from "@/components/notifications/NotificationsFeed";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <NotificationsFeed userId={user.id} sectionLabel="Patient space" />;
}
