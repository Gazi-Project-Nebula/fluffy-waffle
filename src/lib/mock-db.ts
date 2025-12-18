const API_URL = "http://127.0.0.1:8000";

// --- TYPES ---
// We keep these the same so the rest of your app doesn't break
export type User = {
  id: number;
  username: string;
  role: "admin" | "voter";
};

export type Candidate = {
  id: number;
  election_id: number;
  name: string;
  bio?: string;
  description?: string; 
};

export type Election = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string; 
  is_active: boolean; 
  created_by: number;
  candidates: Candidate[];
};

// --- HELPER: Get Token for Requests ---
function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return token 
    ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" } 
    : { "Content-Type": "application/json" };
}

export const api = {
  // 1. LOGIN: Get Token -> Then Get User Profile
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      // A. Login to get Access Token
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const tokenRes = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!tokenRes.ok) return null;
      const tokenData = await tokenRes.json();
      
      // B. Save Token to Browser
      localStorage.setItem("access_token", tokenData.access_token);

      // C. Use Token to get User Details (ID, Role, etc)
      const userRes = await fetch(`${API_URL}/users/me/`, {
        headers: { "Authorization": `Bearer ${tokenData.access_token}` }
      });
      
      if (!userRes.ok) return null;
      return await userRes.json();

    } catch (e) {
      console.error("Login connection error", e);
      return null;
    }
  },

  // 2. REGISTER
  register: async (username: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role: "voter" }),
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed");
    }
    
    // Return a dummy user object to satisfy the frontend type
    return { id: 0, username, role: "voter" }; 
  },

  // 3. FETCH ELECTIONS
  fetchElections: async (): Promise<Election[]> => {
    try {
      const res = await fetch(`${API_URL}/api/elections`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      
      const data = await res.json();
      
      // Map Backend "status" to Frontend "is_active"
      return data.map((e: any) => ({
        ...e,
        is_active: e.status === "active",
        candidates: e.candidates.map((c: any) => ({
            ...c, 
            description: c.bio || "No description provided"
        }))
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  fetchElectionById: async (id: number): Promise<Election | undefined> => {
    try {
      const res = await fetch(`${API_URL}/api/elections/${id}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return undefined;
      const e = await res.json();
      
      return {
        ...e,
        is_active: e.status === "active",
        candidates: e.candidates.map((c: any) => ({
            ...c, 
            description: c.bio || "No description provided"
        }))
      };
    } catch (e) {
      return undefined;
    }
  },

  // 4. CREATE ELECTION
  createElection: async (
    title: string, 
    description: string, 
    endTime: string, 
    candidateNames: string[], 
    creatorId: number
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/elections`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          description,
          end_time: endTime, 
          candidate_names: candidateNames,
          creator_id: creatorId
        })
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // 5. CAST VOTE
  castVote: async (electionId: number, candidateId: number, userId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/votes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          election_id: electionId,
          candidate_id: candidateId,
          user_id: userId
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, message: data.detail || "Voting failed" };
      }
      return { success: true, message: `Vote Hash: ${data.vote_hash}` };
    } catch (e) {
      return { success: false, message: "Network error connecting to backend" };
    }
  },
};