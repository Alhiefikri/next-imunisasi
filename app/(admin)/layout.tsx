import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator"; // Opsional: untuk garis pemisah
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* 1. Sidebar Komponen */}
      <AppSidebar />

      {/* 2. Main Content Area */}
      <main className="relative flex min-h-svh flex-1 flex-col bg-background">
        {/* Header Bar: Tempat tombol Trigger berada */}
        <header className="flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger /> {/* Tombol ini yang membuka/menutup sidebar */}
          <Separator orientation="vertical" className="mr-2 h-4" />
          {/* Opsional: Breadcrumb atau Judul Halaman Statis */}
          <span className="text-sm font-medium">Admin Area</span>
        </header>

        {/* Content Halaman (Children) */}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
}