"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; 
import { useAuth } from "@/context/auth-context";
import { api, Election } from "@/lib/mock-db";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, ChevronLeft, Loader2, ShieldCheck, Copy, Check, Clock, AlertTriangle, XCircle } from "lucide-react";

export default function ElectionDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams(); 
  
  const electionIdString = params?.id as string;
  const electionId = parseInt(electionIdString);

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; hash?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && !isNaN(electionId)) {
      api.fetchElectionById(electionId).then((data) => {
        setElection(data || null);
        setLoading(false);
      });
    } else if (!isNaN(electionId) === false) {
       setLoading(false);
    }
  }, [user, electionId]);

  const handleVote = async () => {
    if (!selectedCandidate || !election || !user) return;
    setSubmitting(true);
    
    try {
      const res = await api.castVote(election.id, selectedCandidate, user.id);
      let hash = "";
      if (res.success && res.message.includes("Vote Hash:")) {
        hash = res.message.split("Vote Hash:")[1].trim();
      }
      setResult({ ...res, hash });
    } catch (e) {
      setResult({ success: false, message: "A network error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.hash) {
      navigator.clipboard.writeText(result.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- LOADER ---
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b]">
        <Navbar />
        <div className="container mx-auto p-6 max-w-2xl mt-12 space-y-6">
          <Skeleton className="h-8 w-1/3 bg-zinc-200 dark:bg-zinc-800" />
          <Skeleton className="h-[400px] w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  // --- NOT FOUND ---
  if (!election) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] flex flex-col items-center justify-center">
        <Navbar />
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Election Not Found</h1>
          <Button variant="outline" onClick={() => router.push("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  // --- SUCCESS STATE ---
  if (result?.success) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] font-sans">
        <Navbar />
        <main className="container mx-auto p-6 flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center shadow-sm animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Vote Confirmed</h2>
            <p className="text-zinc-500 text-sm mb-8">
              Your vote has been mined into block <span className="font-mono text-zinc-700 dark:text-zinc-300">#{(Date.now() / 1000).toFixed(0)}</span>
            </p>

            <div className="relative group cursor-pointer mb-8" onClick={copyToClipboard}>
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all hover:border-zinc-400 transition-colors">
                {result.hash}
              </div>
              <div className="absolute top-2 right-2 p-1 bg-white dark:bg-zinc-900 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-zinc-400" />}
              </div>
            </div>

            <Button onClick={() => router.push("/")} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800">
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // --- FAILURE STATE (NEW) ---
  if (result && !result.success) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] font-sans">
        <Navbar />
        <main className="container mx-auto p-6 flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 text-center shadow-sm animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Submission Failed</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
              {result.message}
            </p>

            <div className="flex flex-col gap-3">
              <Button onClick={() => setResult(null)} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800">
                Try Again
              </Button>
              <Button variant="ghost" onClick={() => router.push("/")} className="w-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200">
                Return to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- DEFAULT VIEW: VOTING FORM ---
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] font-sans transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto p-6 max-w-2xl mt-8">
        <Button variant="ghost" className="mb-6 pl-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                <ShieldCheck className="h-3 w-3" />
                <span>Secure Ballot</span>
              </div>
              {election.is_active && (
                <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  LIVE
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{election.title}</h1>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{election.description}</p>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-zinc-400 font-mono">
              <Clock className="h-3 w-3" />
              <span>Ends: {new Date(election.end_time).toLocaleString()}</span>
            </div>
          </div>

          {/* Candidates */}
          <div className="p-8 space-y-3 bg-zinc-50/50 dark:bg-black/20">
            {election.candidates.map((candidate) => {
              const isSelected = selectedCandidate === candidate.id;
              return (
                <div
                  key={candidate.id}
                  onClick={() => election.is_active && setSelectedCandidate(candidate.id)}
                  className={`
                    relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${!election.is_active ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-zinc-300 dark:hover:border-zinc-700'}
                    ${isSelected 
                      ? 'border-zinc-900 bg-white shadow-md dark:border-zinc-100 dark:bg-zinc-800' 
                      : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50'}
                  `}
                >
                  <div className={`
                    h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mr-4 transition-colors
                    ${isSelected 
                      ? 'border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-white' 
                      : 'border-zinc-300 dark:border-zinc-600'}
                  `}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white dark:bg-zinc-900" />}
                  </div>
                  <div>
                    <span className={`font-semibold text-lg ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      {candidate.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <Button 
              size="lg" 
              className="w-full text-base font-medium h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              onClick={handleVote}
              disabled={!selectedCandidate || submitting || !election.is_active}
            >
              {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {election.is_active ? "Submit Secure Vote" : "Election Closed"}
            </Button>
            <p className="text-center text-xs text-zinc-400 mt-4">
              Your vote is final and cannot be changed once submitted.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}