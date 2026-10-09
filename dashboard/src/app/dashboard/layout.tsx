import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { getTranslations } from "next-intl/server";



export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  const t = await getTranslations("nav");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          firstName={user.firstName}
          lastName={user.lastName}
          roleLabel={`${t("patient")} · A+`}
          notificationHref="/dashboard/notifications"
          unreadCount={unreadCount}
        />
        <main className="mx-auto w-full max-w-[1320px] flex-1 px-10 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
