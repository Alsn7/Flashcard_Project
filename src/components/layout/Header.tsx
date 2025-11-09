"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatedMenu } from "./AnimatedMenu";
import { UserAccountMenu } from "./UserAccountMenu";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-full">
        <div className="flex items-center gap-3">
          <AnimatedMenu />
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/ICON.png" alt="ClassNerd Logo" width={24} height={24} className="w-6 h-6" />
            <span className="font-bold text-sm sm:text-base">ClassNerd</span>
          </Link>
        </div>
        <UserAccountMenu />
      </div>
    </header>
  );
}
