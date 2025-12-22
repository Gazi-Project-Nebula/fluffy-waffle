const API_URL = "https://scriptsecurebackend.onrender.com";

// --- TYPES ---
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

// NEW: Result Type
export type ElectionResult = {
  id: number;
  title: string;
  status: string;
  results: {
    id: number;
    name: string;
    vote_count: number;
  }[];
};

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  login: async (username: string, password: string): Promise<User | null> => {
    try {
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
      
      localStorage.setItem("access_token", tokenData.access_token);

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
    return { id: 0, username, role: "voter" }; 
  },

  fetchElections: async (): Promise<Election[]> => {
    try {
      const res = await fetch(`${API_URL}/api/elections`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      const data = await res.json();
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

  // NEW: Fetch Results
  fetchResults: async (electionId: number): Promise<ElectionResult | null> => {
    try {
      const res = await fetch(`${API_URL}/api/elections/${electionId}/results`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  createElection: async (title: string, description: string, endTime: string, candidateNames: string[], creatorId: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/elections`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, description, end_time: endTime, candidate_names: candidateNames, creator_id: creatorId })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  deleteElection: async (id: number): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/elections/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  castVote: async (electionId: number, candidateId: number, userId: number): Promise<{ success: boolean; message: string; vote_hash?: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/votes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ election_id: electionId, candidate_id: candidateId, user_id: userId })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.detail || "Voting failed" };
      }
      return { success: true, message: `Vote Hash: ${data.vote_hash}`, vote_hash: data.vote_hash };
    } catch (e) {
      return { success: false, message: "Network error connecting to backend" };
    }
  },
};