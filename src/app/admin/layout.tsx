import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Sidebar, ADMIN_NAV } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  const t = await getTranslations("nav");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        navItems={ADMIN_NAV}
        sectionLabelKey="admin"
        settingsHref="/admin/settings"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          firstName={user.firstName}
          lastName={user.lastName}
          roleLabel={`${t("admin")} · A+`}
          searchPlaceholderKey="searchPatientsPlaceholder"
          notificationHref="/admin/notifications"
          unreadCount={unreadCount}
        />
        <main className="mx-auto w-full max-w-[1320px] flex-1 px-10 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
