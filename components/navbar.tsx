"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";
import { signOut } from "better-auth/api";
import { authClient } from "@/lib/auth-client";

export default function NavMenu({
  userName,
  userImage,
}: {
  userName?: string;
  userImage?: string;
}) {
  const isMobile = useIsMobile();
  return (
    <NavigationMenu viewport={isMobile} className="mx-auto max-w-full my-5">
      <div className="flex justify-between w-full container">
        <NavigationMenuList className="flex-wrap">
          <NavigationMenuItem>
            <NavigationMenuLink href="/">Home</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>

        <NavigationMenuList className="flex-wrap">
          <NavigationMenuItem className="hidden md:block">
            <NavigationMenuTrigger>
              <Avatar>
                <AvatarImage src={userImage} />
                <AvatarFallback>{userName}</AvatarFallback>
              </Avatar>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-50 gap-4">
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/dashboard"
                      className="flex-row item-center gap-2"
                    >
                      <LayoutDashboard />
                      Dashboard
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <div
                      className="flex-row items-center gap-2 cursor-pointer"
                      onClick={() => authClient.signOut()}
                    >
                      <LogOut />
                      Signout
                    </div>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
}
