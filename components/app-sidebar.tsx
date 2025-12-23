"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Types & Data Configuration ---

type MenuItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "destructive";
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

// Konfigurasi Menu Terpusat (Data-Driven)
const MENU_GROUPS: MenuGroup[] = [
  {
    label: "Menu Utama",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LucideIcons.Home },
      { title: "Data Anak", url: "/pasien", icon: LucideIcons.Baby },
      {
        title: "Mulai Imunisasi",
        url: "/jadwal-imunisasi",
        icon: LucideIcons.Calendar,
        badge: "3",
      },
      {
        title: "Riwayat Imunisasi",
        url: "/riwayat-imunisasi",
        icon: LucideIcons.Syringe,
      },
    ],
  },
  {
    label: "Manajemen Data",
    items: [
      {
        title: "Jenis Vaksin",
        url: "/jenis-vaksin",
        icon: LucideIcons.HeartPulse,
      },
      {
        title: "Stok Vaksin",
        url: "/stok-vaksin",
        icon: LucideIcons.Package,
        badge: "Low",
        badgeVariant: "destructive",
      },
      { title: "Data Orang Tua", url: "/orang-tua", icon: LucideIcons.Users },
      { title: "Posyandu", url: "/posyandu", icon: LucideIcons.Building2 },
      { title: "Petugas", url: "/petugas", icon: LucideIcons.UserCog },
    ],
  },
  {
    label: "Laporan & Analisis",
    items: [
      { title: "Laporan", url: "/laporan", icon: LucideIcons.FileText },
      { title: "Statistik", url: "/statistik", icon: LucideIcons.BarChart3 },
    ],
  },
  {
    label: "Sistem",
    items: [
      {
        title: "Notifikasi",
        url: "/notifikasi",
        icon: LucideIcons.Bell,
        badge: "5",
        badgeVariant: "destructive",
      },
      { title: "Pengaturan", url: "/pengaturan", icon: LucideIcons.Settings },
    ],
  },
];

// --- Sub-Components (Untuk Kebersihan Kode) ---

function AppLogo() {
  return (
    <div className="flex items-center gap-2 px-1 transition-all group-data-[collapsible=icon]:justify-center">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <LucideIcons.Syringe className="h-4 w-4" />
      </div>
      {/* Text akan hilang saat sidebar collapse */}
      <div className="flex flex-col group-data-[collapsible=icon]:hidden">
        <span className="text-sm font-bold leading-none">ImunKita</span>
        <span className="text-xs text-muted-foreground">Sistem Imunisasi</span>
      </div>
    </div>
  );
}

function UserProfileDropdown() {
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-12 w-full justify-start gap-2 px-2 hover:bg-sidebar-accent"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold">Admin Posyandu</span>
            <span className="truncate text-xs text-muted-foreground">
              admin@posyandu.id
            </span>
          </div>
          <LucideIcons.ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Admin Posyandu</span>
              <span className="truncate text-xs">admin@posyandu.id</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LucideIcons.User className="mr-2 h-4 w-4" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LucideIcons.Settings className="mr-2 h-4 w-4" />
          Pengaturan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <LucideIcons.LogOut className="mr-2 h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// --- Main Component ---

export function AppSidebar() {
  const pathname = usePathname();

  return (
    // collapsible="icon" adalah properti kunci agar sidebar mengecil menjadi icon
    <Sidebar collapsible="icon">
      {/* HEADER: Logo & Toggle Button */}
      <SidebarHeader className="border-b py-3">
        <div className="flex items-center justify-between">
          <AppLogo />
        </div>
      </SidebarHeader>

      {/* CONTENT: Menu Items Loop */}
      <SidebarContent>
        {MENU_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                      >
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium group-data-[collapsible=icon]:hidden", // Badge sembunyi saat collapse
                                item.badgeVariant === "destructive"
                                  ? "bg-destructive text-destructive-foreground"
                                  : "bg-primary text-primary-foreground"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* FOOTER: User Profile */}
      <SidebarFooter className="border-t p-2">
        <UserProfileDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
