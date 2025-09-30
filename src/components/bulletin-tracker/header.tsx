"use client";

import Link from "next/link";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between gap-4 py-4 px-4 md:px-8">
      <div className="flex items-center gap-4">
        <Logo className="h-10 w-10" />
        <div>
          <h1 className="text-2xl font-bold text-primary-dark font-headline tracking-tight">
            theBulletinTracker
          </h1>
          <p className="text-muted-foreground">
            Your daily operations companion.
          </p>
        </div>
      </div>
       <Button asChild variant="ghost" size="icon">
        <Link href="/settings">
          <Settings />
          <span className="sr-only">Settings</span>
        </Link>
      </Button>
    </header>
  );
}
