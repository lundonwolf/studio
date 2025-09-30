"use client";

import { Logo } from "@/components/icons";

export function Header() {
  return (
    <header className="flex items-center gap-4 py-4 px-4 md:px-8">
      <Logo className="h-10 w-10" />
      <div>
        <h1 className="text-2xl font-bold text-primary-dark font-headline tracking-tight">
          theBulletinTracker
        </h1>
        <p className="text-muted-foreground">
          Your daily operations companion.
        </p>
      </div>
    </header>
  );
}
