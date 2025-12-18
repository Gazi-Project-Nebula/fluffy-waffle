"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, LogIn } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { AuthModal } from "@/components/modal/auth-modal";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-slate-200 dark:border-slate-800 transition-colors duration-300 h-16">
        {/* 
            FIX: 
            1. Removed 'max-w-7xl' to match the dashboard layout exactly.
            2. Added 'h-full' to ensure the flexbox takes the full 64px height.
        */}
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          
          {/* Left Side: Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-900 dark:text-indigo-400 hover:opacity-80 transition-opacity">
            SecureVote
          </Link>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-4">
            <ModeToggle />

            {user ? (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
                {user.role === 'admin' && (
                  <Button variant="ghost" size="sm" className="hidden sm:flex" asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </Button>
                )}

                <div className="hidden sm:flex flex-col items-end leading-none">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.username}</span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">{user.role}</span>
                </div>
                
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

                <Button variant="ghost" size="icon" onClick={logout} className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/20"
              >
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </>
  );
}