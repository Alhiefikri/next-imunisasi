"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Syringe, User } from "lucide-react";
import { authClient } from "@/lib/auth-client"; // Pastikan path ini benar

// UI Components
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NavMenu({
  userName,
  userImage = "",
}: {
  userName?: string; // Boleh undefined kalau belum login
  userImage?: string;
}) {
  const router = useRouter();

  // Cek apakah user sedang login
  const isLoggedIn = !!userName;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh(); // Refresh halaman setelah logout
  };

  return (
    <div className="flex w-full items-center justify-between py-4">
      {/* 1. KIRI: LOGO */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Syringe className="h-4 w-4" />
        </div>
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900"
        >
          ImunKita
        </Link>
      </div>
      {/* 2. TENGAH: NAVIGATION LINKS (Desktop) */}
      <div className="hidden md:block">
        <NavigationMenu>
          <NavigationMenuList>
            {/* Gunakan asChild agar NavigationMenuLink tidak merender tag <a> tambahan */}
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/">Beranda</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/#fitur">Fitur</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/#faq">FAQ</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {/* 3. KANAN: USER ACTION */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          // JIKA SUDAH LOGIN -> TAMPILKAN AVATAR DROPDOWN
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarImage key={userImage} src={userImage} alt={userName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {userName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    User Terdaftar
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profil" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil Saya</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // JIKA BELUM LOGIN -> TAMPILKAN TOMBOL MASUK
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/sign-up">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Daftar Sekarang</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
