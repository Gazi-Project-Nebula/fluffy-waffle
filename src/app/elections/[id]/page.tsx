"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; 
import { useAuth } from "@/context/auth-context";
import { api, Election } from "@/lib/mock-db";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { CheckCircle2, ChevronLeft, Loader2, AlertCircle, ShieldCheck, Copy, Check } from "lucide-react";

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
  
  // State for success modal and hash
  const [voteResult, setVoteResult] = useState<{success: boolean, message: string} | null>(null);
  const [extractedHash, setExtractedHash] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Auth Check
  useEffect(() => {
    if (!authLoading && !user) router.push("/auth/login");
  }, [authLoading, user, router]);

  // Data Fetch
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
    
    const result = await api.castVote(election.id, selectedCandidate, user.id);
    
    setSubmitting(false);
    setVoteResult(result);

    // Extract just the hash code from the message "Vote Hash: abc123..."
    if (result.success && result.message.includes("Vote Hash:")) {
      const hash = result.message.split("Vote Hash:")[1].trim();
      setExtractedHash(hash);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to shorten the hash visually (e.g. ad928...71a6fe)
  const truncateHash = (hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  // 1. Loading State
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto p-4 max-w-2xl mt-8 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // 2. Not Found State
  if (!election) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center p-8 mt-10 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Election Not Found</h1>
          <Button variant="outline" onClick={() => router.push("/")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  // 3. Main Voting Form (With Modal)
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      <main className="container mx-auto p-4 max-w-3xl mt-4">
        <Button variant="ghost" className="mb-4 pl-0 text-slate-500 hover:text-slate-900" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>

        {/* Error Message Display (Inline) */}
        {voteResult && !voteResult.success && (
           <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
             <AlertCircle className="h-5 w-5" />
             <span className="font-medium">{voteResult.message}</span>
           </div>
        )}

        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">ID: {election.id}</span>
               {election.is_active ? (
                 <span className="text-xs font-bold text-green-600 border border-green-200 px-2 py-1 rounded bg-green-50">OPEN</span>
               ) : (
                 <span className="text-xs font-bold text-red-500 border border-red-200 px-2 py-1 rounded bg-red-50">CLOSED</span>
               )}
            </div>
            <CardTitle className="text-2xl md:text-3xl">{election.title}</CardTitle>
            <CardDescription className="text-base mt-2">{election.description}</CardDescription>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4 text-slate-800">Ballot Options</h3>
            <div className="grid grid-cols-1 gap-4">
              {election.candidates.map((candidate) => {
                const isSelected = selectedCandidate === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    onClick={() => election.is_active && setSelectedCandidate(candidate.id)}
                    className={`
                      relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${!election.is_active ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'hover:border-blue-300 hover:bg-blue-50/50'}
                      ${isSelected ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm' : 'border-slate-200 bg-white'}
                    `}
                  >
                    <div className={`
                      h-6 w-6 rounded-full border shrink-0 mr-4 flex items-center justify-center transition-colors
                      ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}
                    `}>
                      {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {candidate.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{candidate.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-6 border-t bg-slate-50/50 rounded-b-lg">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 px-1 mb-2">
              <span className="flex items-center"><ShieldCheck className="h-3 w-3 mr-1"/> Valid Token Required</span>
              <span>Ledger Encrypted</span>
            </div>
            <Button 
              size="lg" 
              className="w-full text-lg h-12 shadow-md" 
              onClick={handleVote}
              disabled={!selectedCandidate || submitting || !election.is_active}
            >
              {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {submitting ? "Signing Block..." : "Cast Secure Vote"}
            </Button>
          </CardFooter>
        </Card>
      </main>

      {/* --- SUCCESS MODAL --- */}
      <Dialog open={!!(voteResult?.success)} onOpenChange={() => router.push('/')}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl text-green-900">Vote Confirmed!</DialogTitle>
            <DialogDescription>
              Your vote has been securely recorded on the blockchain.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2 p-4 bg-slate-100 rounded-lg mt-2 border border-slate-200">
            <div className="grid flex-1 gap-1 text-left">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Vote Receipt Hash</p>
              <code className="text-sm font-mono text-slate-900 break-all">
                {extractedHash ? truncateHash(extractedHash) : "Processing..."}
              </code>
            </div>
            <Button type="button" size="icon" variant="ghost" onClick={copyToClipboard} className="h-8 w-8">
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-slate-500" />}
            </Button>
          </div>

          <DialogFooter className="sm:justify-center mt-4">
            <Button type="button" className="w-full sm:w-auto min-w-[150px] bg-green-600 hover:bg-green-700" onClick={() => router.push('/')}>
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}