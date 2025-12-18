"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api, Election } from "@/lib/mock-db";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Plus, Calendar, Settings2, ArrowRight, Trash2, MoreHorizontal, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = () => {
    api.fetchElections().then(setElections);
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "admin") {
        router.push("/"); 
      } else {
        loadData();
      }
    }
  }, [user, isLoading, router]);

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure you want to delete this election? This action cannot be undone.")) return;
    
    setDeletingId(id);
    const success = await api.deleteElection(id);
    if (success) {
      // Remove from local state immediately for snappy feel
      setElections(prev => prev.filter(e => e.id !== id));
    } else {
      alert("Failed to delete election");
    }
    setDeletingId(null);
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] transition-colors duration-300 font-sans text-zinc-900 dark:text-zinc-100">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Console</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Manage voting protocols, candidates, and smart contract states.
            </p>
          </div>
          
          <Button asChild className="h-10 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium shadow-sm transition-transform active:scale-95">
            <Link href="/admin/create">
              <Plus className="mr-2 h-4 w-4" />
              New Election
            </Link>
          </Button>
        </div>

        {/* --- ELECTIONS LIST --- */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-zinc-500">Election List</h2>
          </div>

          {elections.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              No elections created yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {elections.map((election) => (
                <div 
                  key={election.id} 
                  className="group flex flex-col sm:flex-row items-center justify-between p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  {/* Left: Info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                    <div className={`
                      h-10 w-10 rounded-full flex items-center justify-center border
                      ${election.is_active 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600' 
                        : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'}
                    `}>
                      <span className="text-xs font-bold font-mono">{election.id}</span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {election.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        <span className={`flex items-center gap-1.5 ${election.is_active ? 'text-emerald-600 font-medium' : ''}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${election.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                          {election.is_active ? "Active" : "Closed"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(election.end_time).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    
                    {/* View Button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      asChild
                    >
                      <Link href={`/elections/${election.id}`}>
                        View <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>

                    {/* Manage Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          disabled={deletingId === election.id}
                        >
                          {deletingId === election.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Settings2 className="h-3.5 w-3.5 mr-2" />
                          )}
                          Manage
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10" onClick={() => handleDelete(election.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Election
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}