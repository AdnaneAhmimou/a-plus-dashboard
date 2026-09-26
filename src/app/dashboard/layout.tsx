import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

const ROLE_LABEL: Record<string, string> = {
  PATIENT: "Patient · A+",
  ADMIN: "Admin · A+",
  SUPER_ADMIN: "Super Admin · A+",
};

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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          firstName={user.firstName}
          lastName={user.lastName}
          roleLabel={ROLE_LABEL[user.role] ?? "Patient · A+"}
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
