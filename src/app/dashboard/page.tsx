"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import KanbanBoard from "@/components/KanbanBoard";
import { useSession } from "next-auth/react";

interface Issue {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
}

// Fake demo data for when user is not logged in
const FAKE_ISSUES: Issue[] = [
  { id: "fake-1", title: "Implement user authentication", description: "Add login and signup functionality", status: "Done", priority: "HIGH" },
  { id: "fake-2", title: "Design dashboard UI", description: "Create responsive dashboard layout", status: "Done", priority: "MEDIUM" },
  { id: "fake-3", title: "Add issue tracking", description: "Implement CRUD operations for issues", status: "In Progress", priority: "HIGH" },
  { id: "fake-4", title: "Setup database schema", description: "Create Prisma models and migrations", status: "In Progress", priority: "MEDIUM" },
  { id: "fake-5", title: "Write unit tests", description: "Add test coverage for API routes", status: "Backlog", priority: "LOW" },
  { id: "fake-6", title: "Deploy to production", description: "Configure Vercel deployment", status: "Backlog", priority: "MEDIUM" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Backlog");
  const [priority, setPriority] = useState("MEDIUM");
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "board">("board");
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchIssues();
    } else {
      // Show fake data when not logged in
      setIssues(FAKE_ISSUES);
    }
  }, [session]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/issues");
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (error) {
      console.error("Failed to fetch issues", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

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
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to create issue");
      }
    } catch (error) {
      console.error("Failed to create issue", error);
      setError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateIssueStatus = async (id: string, newStatus: string) => {
    // If not logged in, just update locally (fake data)
    if (!session) {
      setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, status: newStatus } : issue
      ));
      return;
    }

    // Optimistic update
    setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, status: newStatus } : issue
    ));

    try {
        const res = await fetch("/api/issues", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus }),
        });
        if (!res.ok) {
          fetchIssues(); // Revert on error
        }
    } catch (error) {
        console.error("Failed to update status", error);
        fetchIssues(); // Revert on error
    }
  };

  const handleUpdateIssuePriority = async (id: string, newPriority: string) => {
    // If not logged in, just update locally (fake data)
    if (!session) {
      setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, priority: newPriority } : issue
      ));
      return;
    }

    // Optimistic update
    setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, priority: newPriority } : issue
    ));

    try {
        const res = await fetch("/api/issues", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, priority: newPriority }),
        });
        if (!res.ok) {
          fetchIssues(); // Revert on error
        }
    } catch (error) {
        console.error("Failed to update priority", error);
        fetchIssues(); // Revert on error
    }
  };

  const handleUpdateTitle = async (id: string, newTitle: string) => {
    if (!session) {
      setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, title: newTitle } : issue
      ));
      return;
    }

    // Optimistic update
    setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, title: newTitle } : issue
    ));

    try {
        const res = await fetch("/api/issues", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, title: newTitle }),
        });
        if (!res.ok) {
          fetchIssues(); // Revert on error
        }
    } catch (error) {
        console.error("Failed to update title", error);
        fetchIssues(); // Revert on error
    }
  };

  const handleUpdateDescription = async (id: string, newDescription: string) => {
    if (!session) {
      setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, description: newDescription } : issue
      ));
      return;
    }

    // Optimistic update
    setIssues(prev => prev.map(issue => 
        issue.id === id ? { ...issue, description: newDescription } : issue
    ));

    try {
        const res = await fetch("/api/issues", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, description: newDescription }),
        });
        if (!res.ok) {
          fetchIssues(); // Revert on error
        }
    } catch (error) {
        console.error("Failed to update description", error);
        fetchIssues(); // Revert on error
    }
  };

  const handleDeleteIssue = async (id: string) => {
    // If not logged in, just remove locally (fake data)
    if (!session) {
      setIssues(prev => prev.filter(issue => issue.id !== id));
      return;
    }

    // Confirm deletion
    if (!confirm("Are you sure you want to delete this issue?")) {
      return;
    }

    // Optimistic update
    setIssues(prev => prev.filter(issue => issue.id !== id));

    try {
        const res = await fetch("/api/issues", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });

        if (!res.ok) {
            const errorData = await res.json();
            setError(errorData.message || "Failed to delete issue");
            fetchIssues(); // Revert on error
        }
    } catch (error) {
        console.error("Failed to delete issue", error);
        setError("Network error. Please try again.");
        fetchIssues(); // Revert on error
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setSummary(null);

    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary + (data.note ? `\n\n(${data.note})` : ''));
      } else {
        const error = await res.json();
        setSummary(`Error: ${error.message || "Failed to generate summary"}`);
      }
    } catch (error) {
      console.error("Failed to generate summary");
      setSummary("Error: Unable to connect to AI service.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const isDemoAccount = session?.user?.email === "litmerscontest2911@gmail.com";

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        #create-issue-form input::placeholder,
        #create-issue-form textarea::placeholder {
          color: #9ca3af;
        }
      `}} />
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {isDemoAccount && (
        <div style={{ 
          background: "#fef3c7", 
          border: "1px solid #f59e0b", 
          color: "#92400e", 
          padding: "0.75rem 1rem", 
          borderRadius: "8px", 
          marginBottom: "1rem",
          fontSize: "0.875rem",
          fontWeight: "500"
        }}>
          This is just UI demo account, please login
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ margin: 0, color: "#666", fontSize: "1.1rem" }}>Hello, {session?.user?.name || "User"}</h3>
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
      <div style={{ background: "#374151", border: "2px solid #1f2937", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
        <h2 style={{ color: "white", margin: "0 0 1rem 0" }}>Create New Issue</h2>
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
        <form id="create-issue-form" onSubmit={handleCreateIssue} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Issue Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ padding: "0.5rem", background: "#1f2937", color: "white", border: "1px solid #4b5563", borderRadius: "4px" }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: "0.5rem", minHeight: "80px", background: "#1f2937", color: "white", border: "1px solid #4b5563", borderRadius: "4px" }}
          />
          <div style={{ display: "flex", gap: "1rem" }}>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "0.5rem", background: "#1f2937", color: "white", border: "1px solid #4b5563", borderRadius: "4px" }}>
              <option value="Backlog">Backlog</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: "0.5rem", background: "#1f2937", color: "white", border: "1px solid #4b5563", borderRadius: "4px" }}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <button 
              type="submit" 
              disabled={creating}
              style={{ 
                padding: "0.5rem 1rem", 
                background: "blue", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: creating ? "not-allowed" : "pointer"
              }}
            >
              {creating ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </form>
      </div>

      {/* AI Summary Section */}
      <div style={{ background: "#1e3a8a", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem", border: "1px solid #1e40af" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0, color: "white" }}>🤖 AI Project Summary</h2>
          <button 
            onClick={handleGenerateSummary}
            disabled={summaryLoading}
            style={{ 
              padding: "0.5rem 1rem", 
              background: summaryLoading ? "#9ca3af" : "#3b82f6", 
              color: "white", 
              border: "none", 
              borderRadius: "4px",
              cursor: summaryLoading ? "not-allowed" : "pointer",
              fontWeight: "500"
            }}
          >
            {summaryLoading ? "Generating..." : "Generate Summary"}
          </button>
        </div>
        {summary && (
          <div style={{ 
            background: "#1e40af", 
            padding: "1rem", 
            borderRadius: "4px",
            border: "1px solid #3b82f6",
            lineHeight: "1.6",
            color: "white"
          }}>
            {summary}
          </div>
        )}
        {!summary && !summaryLoading && (
          <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.9rem" }}>
            Click "Generate Summary" to get an AI-powered overview of your project status.
          </p>
        )}
      </div>

      {/* Issue Board / List */}
      <div>
        <h2>{viewMode === "board" ? "Issue Board" : "Issue List"}</h2>
        {!session && (
          <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem", fontStyle: "italic" }}>
            Please login to use the service
          </p>
        )}
        {loading && (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            padding: "2rem",
            color: "#9ca3af"
          }}>
            <div style={{ 
              border: "3px solid #374151", 
              borderTop: "3px solid #3b82f6", 
              borderRadius: "50%", 
              width: "40px", 
              height: "40px", 
              animation: "spin 1s linear infinite"
            }}></div>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}} />
          </div>
        )}
        {!loading && issues.length === 0 ? (
            <p>No issues yet. Create one above!</p>
        ) : !loading && viewMode === "board" ? (
            <KanbanBoard 
              issues={issues} 
              onUpdateIssue={handleUpdateIssueStatus} 
              onUpdatePriority={handleUpdateIssuePriority}
              onDeleteIssue={handleDeleteIssue}
              onUpdateTitle={handleUpdateTitle}
              onUpdateDescription={handleUpdateDescription}
            />
        ) : !loading && (
            <div style={{ display: "grid", gap: "1rem" }}>
            {issues.map((issue) => (
                <div key={issue.id} style={{ 
                background: "#374151",
                border: "1px solid #1f2937", 
                padding: "1rem", 
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
                }}>
                <div style={{ flex: 1 }}>
                  {session ? (
                    <>
                      <input
                        type="text"
                        value={issue.title}
                        onChange={(e) => handleUpdateTitle(issue.id, e.target.value)}
                        onBlur={(e) => handleUpdateTitle(issue.id, e.target.value)}
                        style={{
                          padding: "0.5rem",
                          background: "#1f2937",
                          color: "white",
                          border: "1px solid #4b5563",
                          borderRadius: "4px",
                          fontSize: "0.95rem",
                          fontWeight: "600",
                          width: "100%",
                          marginBottom: "0.5rem"
                        }}
                      />
                      <textarea
                        value={issue.description || ""}
                        onChange={(e) => handleUpdateDescription(issue.id, e.target.value)}
                        onBlur={(e) => handleUpdateDescription(issue.id, e.target.value)}
                        placeholder="No description"
                        style={{
                          padding: "0.5rem",
                          background: "#1f2937",
                          color: "#d1d5db",
                          border: "1px solid #4b5563",
                          borderRadius: "4px",
                          minHeight: "60px",
                          fontSize: "0.875rem",
                          width: "100%",
                          resize: "vertical"
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <h3 style={{ margin: "0 0 0.5rem 0", color: "white" }}>{issue.title}</h3>
                      <p style={{ margin: 0, color: "#d1d5db" }}>{issue.description || "No description"}</p>
                    </>
                  )}
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {session ? (
                      <>
                        <select
                          value={issue.status}
                          onChange={(e) => handleUpdateIssueStatus(issue.id, e.target.value)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            background: "#1f2937",
                            color: "white",
                            border: "1px solid #4b5563",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                          }}
                        >
                          <option value="Backlog">Backlog</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>
                        <select
                          value={issue.priority}
                          onChange={(e) => handleUpdateIssuePriority(issue.id, e.target.value)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            background: "#1f2937",
                            color: "white",
                            border: "1px solid #4b5563",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                          }}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                    {session && (
                      <button
                        onClick={() => handleDeleteIssue(issue.id)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.75rem"
                        }}
                        title="Delete issue"
                      >
                        Delete
                      </button>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
    </>
  );
}
