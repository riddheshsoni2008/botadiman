import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { getStudioSettings } from "@/actions/settings";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const settingsResult = await getStudioSettings();
  const studioName = settingsResult.success ? settingsResult.data?.studioName : "Botadi";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
      <Sidebar user={session.user} studioName={studioName} />
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <Navbar user={session.user} studioName={studioName} />
        <main className="flex-1 p-3 sm:p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
