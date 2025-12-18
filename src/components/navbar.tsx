"use client";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle"; // <--- Import

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-900 dark:text-indigo-400">
          SecureVote
        </Link>

        <div className="flex items-center gap-4">
          {/* Add Toggle Here */}
          <ModeToggle />

          {user && (
            <>
              {user.role === 'admin' && (
                <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
                  <Link href="/admin">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}

              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.username}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} className="text-slate-500 hover:text-red-500">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}