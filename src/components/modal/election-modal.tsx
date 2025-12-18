"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, Election, ElectionResult } from "@/lib/mock-db";
import { useAuth } from "@/context/auth-context";
import { CheckCircle2, Loader2, Copy, Check, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";

interface ElectionModalProps {
  election: Election | null;
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "vote" | "results";
}

export function ElectionModal({ election, isOpen, onClose, initialMode = "vote" }: ElectionModalProps) {
  const { user } = useAuth();
  
  // States
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; hash?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Results Mode State
  const [mode, setMode] = useState<"vote" | "results">(initialMode);
  const [resultsData, setResultsData] = useState<ElectionResult | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // Initialize/Reset on Open
  useEffect(() => {
    if (isOpen && election) {
      // Force "results" mode if election is closed
      const targetMode = !election.is_active ? "results" : initialMode;
      setMode(targetMode);
      
      setSelectedCandidate(null);
      setResult(null);
      setResultsData(null);

      if (targetMode === "results") {
        loadResults(election.id);
      }
    }
  }, [isOpen, election, initialMode]);

  const loadResults = async (id: number) => {
    setLoadingResults(true);
    const data = await api.fetchResults(id);
    setResultsData(data);
    setLoadingResults(false);
  };

  const handleVote = async () => {
    if (!selectedCandidate || !election || !user) return;
    setSubmitting(true);

    try {
      const res = await api.castVote(election.id, selectedCandidate, user.id);
      let hash = "";
      if (res.success && res.message.includes("Vote Hash:")) {
        hash = res.message.split("Vote Hash:")[1].trim();
      } else if (res.vote_hash) {
        hash = res.vote_hash;
      }
      setResult({ ...res, hash });
    } catch (error) {
      setResult({ success: false, message: "An unexpected error occurred." });
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

  const formatHash = (hash: string) => {
    if (!hash) return "";
    if (hash.length < 20) return hash;
    return `${hash.substring(0, 12)}...${hash.substring(hash.length - 12)}`;
  };

  const getTotalVotes = () => resultsData?.results.reduce((acc, curr) => acc + curr.vote_count, 0) || 0;
  
  const getPercentage = (count: number) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  if (!election) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Hide default close 'X' when showing success/failure for visual balance */}
      <DialogContent className={`
        sm:max-w-md bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 
        p-0 overflow-hidden gap-0 shadow-2xl transition-all
        ${result ? "[&>button]:hidden" : ""} 
      `}>
        
        {/* =======================
            VIEW 1: VOTING FORM
           ======================= */}
        {!result && mode === "vote" && (
          <>
            <div className="relative p-6 pb-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <DialogHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white mb-1 text-left">
                      {election.title}
                    </DialogTitle>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <ShieldCheck className="w-3 h-3 mr-1 text-indigo-500" />
                      <span>Blockchain ID: {election.id}</span>
                    </div>
                  </div>
                  <Badge variant="default" className="shrink-0">Active</Badge>
                </div>
                <DialogDescription className="mt-2 text-slate-600 dark:text-slate-400 line-clamp-2 text-left">
                  {election.description}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
              {election.candidates.map((candidate) => {
                const isSelected = selectedCandidate === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate.id)}
                    className={`
                      relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      hover:bg-slate-50 dark:hover:bg-slate-800/50
                      ${isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-500' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950'}
                    `}
                  >
                    <div className={`
                      h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mr-4 transition-colors
                      ${isSelected 
                        ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500' 
                        : 'border-slate-300 dark:border-slate-600'}
                    `}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-left ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-slate-200'}`}>
                        {candidate.name}
                      </p>
                      {candidate.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 text-left">{candidate.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter className="p-6 pt-2 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="w-full flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" 
                  disabled={!selectedCandidate || submitting}
                  onClick={handleVote}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Vote
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {/* =======================
            VIEW 2: RESULTS VIEW 
           ======================= */}
        {!result && mode === "results" && (
          <>
             <div className="relative p-6 pb-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="flex justify-between items-center">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Live Results
                </DialogTitle>
                <Button variant="ghost" size="icon" onClick={() => loadResults(election.id)} disabled={loadingResults}>
                  <RefreshCw className={`h-4 w-4 ${loadingResults ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-sm text-slate-500 mt-1">Real-time data from the blockchain ledger.</p>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loadingResults ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                  <p className="text-sm text-slate-500">Decrypting tally...</p>
                </div>
              ) : resultsData ? (
                <div className="space-y-6">
                  {resultsData.results.map((r, idx) => (
                    <div key={r.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {idx + 1}. {r.name}
                        </span>
                        <span className="font-mono text-slate-500">
                          {r.vote_count} votes ({getPercentage(r.vote_count)}%)
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${getPercentage(r.vote_count)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400 font-mono">
                      Total Cast Votes: {getTotalVotes()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500">No results available yet.</div>
              )}
            </div>

            <DialogFooter className="p-6 pt-2 bg-slate-50/50 dark:bg-slate-900/20">
              <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900" onClick={onClose}>
                Close Results
              </Button>
            </DialogFooter>
          </>
        )}

        {/* =======================
            VIEW 3: SUCCESS/FAIL
           ======================= */}
        {result && (
          <div className="flex flex-col items-center justify-center p-8 pt-10 min-h-[400px] text-center animate-in fade-in zoom-in-95 duration-300 w-full">
            {result.success ? (
              <>
                <div className="relative mb-6 mt-2 mx-auto">
                  <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
                  <div className="relative h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center w-full">
                  Vote Recorded
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center max-w-xs mx-auto leading-relaxed">
                  Your transaction has been mined and added to the immutable ledger.
                </p>
                
                {result.hash && (
                  <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-2 mb-8">
                    <div className="flex justify-center items-center w-full">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center">
                        {copied ? <span className="text-green-500">Copied to Clipboard!</span> : "Transaction Hash"}
                      </p>
                    </div>
                    
                    <div 
                      className="relative w-full cursor-pointer group flex justify-center"
                      onClick={copyToClipboard}
                    >
                      <code className="text-sm font-mono text-slate-700 dark:text-indigo-300 bg-slate-100 dark:bg-indigo-950/30 px-3 py-1.5 rounded border border-slate-200 dark:border-indigo-900/50 hover:bg-slate-200 dark:hover:bg-indigo-900/50 transition-colors text-center">
                        {formatHash(result.hash)}
                      </code>
                      
                      <div className="ml-2 inline-flex items-center text-slate-400">
                         {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex w-full gap-3">
                  <Button className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90" onClick={onClose}>
                    Close
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => { setResult(null); setMode("results"); loadResults(election.id); }}>
                    View Results
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="h-20 w-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">Vote Failed</h3>
                <p className="text-red-500 text-sm mb-8 text-center">{result.message}</p>
                <Button className="w-full h-11" variant="outline" onClick={onClose}>Close</Button>
              </>
            )}
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}