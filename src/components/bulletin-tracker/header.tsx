"use client";

import Link from "next/link";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { auth } from "@/lib/firebase";

export function Header() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
  };

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
      <div className="flex items-center gap-2">
        {user && (
            <>
            <Button asChild variant="ghost" size="icon">
                <Link href="/settings">
                <Settings />
                <span className="sr-only">Settings</span>
                </Link>
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="icon">
                <LogOut />
                <span className="sr-only">Sign Out</span>
            </Button>
            </>
        )}
       </div>
    </header>
  );
}
