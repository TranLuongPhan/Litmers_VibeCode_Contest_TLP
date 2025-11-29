"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import KanbanBoard from "@/components/KanbanBoard";

interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
}

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Backlog");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "board">("board");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    const res = await fetch("/api/issues");
    if (res.ok) {
      const data = await res.json();
      setIssues(data);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status, priority }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        fetchIssues(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIssueStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, status: newStatus } : issue
    ));

    try {
        await fetch("/api/issues", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus }),
        });
        // Optionally refetch to ensure sync
    } catch (error) {
        console.error("Failed to update status");
        fetchIssues(); // Revert on error
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: 0, color: "#666" }}>Hello, {session?.user?.name || "User"}</h3>
          <h1 style={{ margin: 0 }}>My Dashboard</h1>
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button 
            onClick={() => setViewMode(viewMode === "list" ? "board" : "list")}
            style={{
                padding: "0.5rem 1rem",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer"
            }}
          >
            Switch to {viewMode === "list" ? "Board" : "List"} View
          </button>
          <Link href="/teams" style={{ color: "blue", textDecoration: "underline" }}>Manage Teams</Link>
          <LogoutButton />
        </div>
      </div>

      {/* Create Issue Form */}
      <div style={{ background: "#f5f5f5", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
        <h2>Create New Issue</h2>
        <form onSubmit={handleCreateIssue} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Issue Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ padding: "0.5rem" }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: "0.5rem", minHeight: "80px" }}
          />
          <div style={{ display: "flex", gap: "1rem" }}>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "0.5rem" }}>
              <option value="Backlog">Backlog</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: "0.5rem" }}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: "0.5rem 1rem", 
                background: "blue", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </form>
      </div>

      {/* Issue Board / List */}
      <div>
        <h2>My Issues</h2>
        {issues.length === 0 ? (
            <p>No issues yet. Create one above!</p>
        ) : viewMode === "board" ? (
            <KanbanBoard issues={issues} onUpdateIssue={handleUpdateIssueStatus} />
        ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
            {issues.map((issue) => (
                <div key={issue.id} style={{ 
                border: "1px solid #ddd", 
                padding: "1rem", 
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
                }}>
                <div>
                    <h3 style={{ margin: "0 0 0.5rem 0" }}>{issue.title}</h3>
                    <p style={{ margin: 0, color: "#666" }}>{issue.description}</p>
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <span style={{ 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "4px", 
                    background: issue.status === "Done" ? "#dcfce7" : issue.status === "In Progress" ? "#dbeafe" : "#f3f4f6",
                    color: issue.status === "Done" ? "#166534" : issue.status === "In Progress" ? "#1e40af" : "#374151",
                    fontSize: "0.875rem"
                    }}>
                    {issue.status}
                    </span>
                    <span style={{ 
                    padding: "0.25rem 0.5rem", 
                    borderRadius: "4px", 
                    background: issue.priority === "HIGH" ? "#fee2e2" : "#f3f4f6",
                    color: issue.priority === "HIGH" ? "#991b1b" : "#374151",
                    fontSize: "0.875rem"
                    }}>
                    {issue.priority}
                    </span>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}
