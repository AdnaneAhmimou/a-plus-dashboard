import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Sidebar, ADMIN_NAV } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin · A+",
  SUPER_ADMIN: "Super Admin · A+",
};

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        navItems={ADMIN_NAV}
        sectionLabel="Laboratory portal"
        settingsHref="/admin/settings"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          firstName={user.firstName}
          lastName={user.lastName}
          roleLabel={ROLE_LABEL[user.role] ?? "Admin · A+"}
          searchPlaceholder="Search patients, box numbers..."
        />
        <main className="mx-auto w-full max-w-[1320px] flex-1 px-10 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
