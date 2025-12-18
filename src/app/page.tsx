"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { api, Election } from "@/lib/mock-db";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ChevronRight, Vote, ShieldCheck, Lock, BarChart3 } from "lucide-react";
import { ElectionModal } from "@/components/modal/election-modal";
import { AuthModal } from "@/components/modal/auth-modal";
import { Button } from "@/components/ui/button"; // Make sure to import Button

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  
  const [elections, setElections] = useState<Election[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [isElectionModalOpen, setElectionModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"vote" | "results">("vote");

  useEffect(() => {
    api.fetchElections().then((data) => {
      setElections(data);
      setDataLoading(false);
    });
  }, []);

  const handleOpenModal = (election: Election, mode: "vote" | "results") => {
    if (!user && mode === "vote") {
      setAuthModalOpen(true);
    } else {
      setSelectedElection(election);
      setModalMode(mode);
      setElectionModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-500 selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-[#0f172a] text-white overflow-hidden pb-32 border-b border-white/5">
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full overflow-hidden z-0 opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] animate-blob opacity-20 dark:opacity-40"></div>
          <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000 opacity-20 dark:opacity-40"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-indigo-200 text-sm font-medium mb-6 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Blockchain Secured Voting</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
            Make Your Voice Count.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {user ? (
              <span>Welcome back, <span className="text-indigo-400 font-semibold">{user.username}</span>.</span>
            ) : (
              <span>Join the decentralized governance platform.</span>
            )}
            {" "}Participate with transparency and speed.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <main className="relative z-20 container mx-auto px-6 -mt-20 pb-20">
        
        {dataLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 h-64 shadow-xl border border-slate-100 dark:border-slate-800">
                <Skeleton className="h-full w-full rounded-2xl dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {elections.map((election) => (
              <div 
                key={election.id} 
                className="group block h-full cursor-pointer relative"
              >
                <div className={`
                  relative h-full rounded-3xl p-1 overflow-hidden transition-all duration-500 
                  bg-white dark:bg-slate-900 
                  border border-slate-100 dark:border-slate-800
                  shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none
                  hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(99,102,241,0.2)] dark:hover:shadow-[0_20px_40px_rgba(99,102,241,0.1)]
                  dark:hover:border-indigo-500/30
                `}>
                  
                  <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${election.is_active ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800'}`} />

                  {/* Main Click Area (Vote) */}
                  <div className="p-7 flex flex-col h-full" onClick={() => handleOpenModal(election, election.is_active ? "vote" : "results")}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`
                        inline-flex items-center justify-center w-12 h-12 rounded-2xl transition-transform duration-300 group-hover:scale-110
                        ${election.is_active 
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}
                      `}>
                        <Vote className="w-6 h-6" />
                      </div>
                      
                      <Badge className={`
                        px-3 py-1 rounded-full font-medium tracking-wide border
                        ${election.is_active 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'}
                      `}>
                        {election.is_active ? "Active" : "Closed"}
                      </Badge>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {election.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 mb-8 flex-grow">
                      {election.description}
                    </p>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">Ends on</span>
                        <div className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                          <Calendar className="w-3 h-3 mr-1.5 text-slate-400" />
                          {new Date(election.end_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* VIEW RESULTS BUTTON (Visible if logged in) */}
                        {user && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent main card click
                              handleOpenModal(election, "results");
                            }}
                            title="View Live Results"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {/* ACTION LABEL */}
                        <div className={`
                          flex items-center gap-1 text-sm font-bold transition-all duration-300 ml-2
                          ${election.is_active 
                            ? 'text-indigo-600 dark:text-indigo-400 translate-x-0' 
                            : 'text-slate-300 dark:text-slate-600'}
                          group-hover:translate-x-1
                        `}>
                          {user ? (
                            <>{election.is_active ? "Vote" : "Results"} <ChevronRight className="w-4 h-4" /></>
                          ) : (
                            <><Lock className="w-3 h-3 mr-1" /> Login</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ElectionModal 
        election={selectedElection} 
        isOpen={isElectionModalOpen} 
        onClose={() => setElectionModalOpen(false)}
        initialMode={modalMode} 
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
}