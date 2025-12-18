"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { Loader2, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(defaultTab === "register");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, password);
        // After register, automatically switch to login or close (depending on your flow)
        // For now, we assume register auto-logs-in or user switches to login
        setIsRegister(false); 
        // Optional: Auto login after register if your API supports it
        const success = await login(username, password);
        if (success) onClose();
      } else {
        const success = await login(username, password);
        if (success) {
          onClose();
        } else {
          setError("Invalid credentials. Please try again.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl">
        
        {/* Header Section */}
        <div className="relative p-8 pb-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              {isRegister ? "Create Account" : "Welcome Back"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-slate-500 dark:text-slate-400">
              {isRegister 
                ? "Join the secure voting platform." 
                : "Enter your credentials to access your dashboard."}
            </DialogDescription>
          </div>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                type="password"
                className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center font-medium animate-pulse">{error}</p>
          )}

          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isRegister ? "Sign Up" : "Sign In"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center mx-auto gap-1"
            >
              {isRegister ? "Already have an account?" : "Don't have an account?"}
              <span className="font-semibold underline underline-offset-2">
                {isRegister ? "Login" : "Register"}
              </span>
            </button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}