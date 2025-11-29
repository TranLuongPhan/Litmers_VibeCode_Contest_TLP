"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Team {
  id: string;
  name: string;
  _count: {
    members: number;
    projects: number;
  };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const res = await fetch("/api/teams");
    if (res.ok) {
      const data = await res.json();
      setTeams(data);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName }),
      });

      if (res.ok) {
        setNewTeamName("");
        fetchTeams();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to create team");
      }
    } catch (error) {
      console.error("Failed to create team", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        #create-team-form input::placeholder {
          color: #9ca3af;
        }
      `}} />
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1>Manage Teams</h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button 
              onClick={() => router.push("/dashboard")}
              style={{ 
                padding: "0.5rem 1rem", 
                border: "1px solid #ccc", 
                background: "white", 
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              &larr; Back to Dashboard
            </button>
          </div>
        </div>

        {/* Create Team Form */}
        <div style={{ background: "#374151", border: "2px solid #1f2937", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
          <h2 style={{ color: "white", margin: "0 0 1rem 0" }}>Create New Team</h2>
        {error && (
          <div style={{ 
            background: "#fee2e2", 
            color: "#991b1b", 
            padding: "0.75rem", 
            borderRadius: "4px", 
            marginBottom: "1rem",
            fontSize: "0.875rem"
          }}>
            {error}
          </div>
        )}
        <form id="create-team-form" onSubmit={handleCreateTeam} style={{ display: "flex", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            required
            style={{ flex: 1, padding: "0.5rem", background: "#1f2937", color: "white", border: "1px solid #4b5563", borderRadius: "4px" }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: "0.5rem 1rem", 
              background: loading ? "#6b7280" : "#3b82f6", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Creating..." : "Create Team"}
          </button>
        </form>
      </div>

      {/* Team List */}
      <div>
        <h2>Your Teams</h2>
        <div style={{ display: "grid", gap: "1rem" }}>
          {teams.map((team) => (
            <div key={team.id} style={{ 
              border: "1px solid #ddd", 
              padding: "1rem", 
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>{team.name}</h3>
                <div style={{ color: "#666", fontSize: "0.875rem" }}>
                  {team._count.members} members • {team._count.projects} projects
                </div>
              </div>
              <button 
                style={{ 
                  padding: "0.25rem 0.75rem", 
                  border: "1px solid #ddd", 
                  background: "white", 
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Manage
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

