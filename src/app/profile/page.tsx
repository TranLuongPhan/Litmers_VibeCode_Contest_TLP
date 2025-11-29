"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Load user data
    if (session.user) {
      setName(session.user.name || "");
      setProfileImage(session.user.image || "");
    }

    // Check if user has a password (not OAuth-only)
    checkPasswordStatus();
  }, [session, router]);

  const checkPasswordStatus = async () => {
    try {
      const res = await fetch("/api/profile/check-password");
      if (res.ok) {
        const data = await res.json();
        setHasPassword(data.hasPassword);
      }
    } catch (error) {
      console.error("Failed to check password status", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate name
    if (!name || name.length < 1 || name.length > 50) {
      setError("Name must be between 1 and 50 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profileImage }),
      });

      if (res.ok) {
        setSuccess("Profile updated successfully!");
        // Update session
        await update();
        // Reload after a short delay to show success message
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    // Validate passwords
    if (!currentPassword) {
      setPasswordError("Current password is required");
      setPasswordLoading(false);
      return;
    }

    if (!newPassword || newPassword.length < 6 || newPassword.length > 100) {
      setPasswordError("New password must be between 6 and 100 characters");
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setPasswordError(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Failed to change password", error);
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Profile Management</h1>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/dashboard" style={{ color: "blue", textDecoration: "underline", display: "flex", alignItems: "center" }}>Back to Dashboard</Link>
          <LogoutButton />
        </div>
      </div>

      {/* Profile Information Section */}
      <div style={{ background: "#374151", border: "2px solid #1f2937", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
        <h2 style={{ color: "white", margin: "0 0 1rem 0" }}>Edit Profile</h2>
        
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

        {success && (
          <div style={{ 
            background: "#d1fae5", 
            color: "#065f46", 
            padding: "0.75rem", 
            borderRadius: "4px", 
            marginBottom: "1rem",
            fontSize: "0.875rem"
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ color: "white", display: "block", marginBottom: "0.5rem" }}>
              Name (1-50 characters)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              required
              style={{ 
                padding: "0.5rem", 
                background: "#1f2937", 
                color: "white", 
                border: "1px solid #4b5563", 
                borderRadius: "4px",
                width: "100%"
              }}
            />
          </div>

          <div>
            <label style={{ color: "white", display: "block", marginBottom: "0.5rem" }}>
              Profile Image URL
            </label>
            <input
              type="url"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{ 
                padding: "0.5rem", 
                background: "#1f2937", 
                color: "white", 
                border: "1px solid #4b5563", 
                borderRadius: "4px",
                width: "100%"
              }}
            />
            {profileImage && (
              <div style={{ marginTop: "0.5rem" }}>
                <img 
                  src={profileImage} 
                  alt="Profile preview" 
                  style={{ 
                    maxWidth: "100px", 
                    maxHeight: "100px", 
                    borderRadius: "4px",
                    border: "1px solid #4b5563"
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

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
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>

      {/* Password Change Section - Only show if user has a password */}
      {hasPassword && (
        <div style={{ background: "#374151", border: "2px solid #1f2937", padding: "1.5rem", borderRadius: "8px" }}>
          <h2 style={{ color: "white", margin: "0 0 1rem 0" }}>Change Password</h2>
          
          {passwordError && (
            <div style={{ 
              background: "#fee2e2", 
              color: "#991b1b", 
              padding: "0.75rem", 
              borderRadius: "4px", 
              marginBottom: "1rem",
              fontSize: "0.875rem"
            }}>
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div style={{ 
              background: "#d1fae5", 
              color: "#065f46", 
              padding: "0.75rem", 
              borderRadius: "4px", 
              marginBottom: "1rem",
              fontSize: "0.875rem"
            }}>
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ color: "white", display: "block", marginBottom: "0.5rem" }}>
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ 
                  padding: "0.5rem", 
                  background: "#1f2937", 
                  color: "white", 
                  border: "1px solid #4b5563", 
                  borderRadius: "4px",
                  width: "100%"
                }}
              />
            </div>

            <div>
              <label style={{ color: "white", display: "block", marginBottom: "0.5rem" }}>
                New Password (6-100 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                maxLength={100}
                required
                style={{ 
                  padding: "0.5rem", 
                  background: "#1f2937", 
                  color: "white", 
                  border: "1px solid #4b5563", 
                  borderRadius: "4px",
                  width: "100%"
                }}
              />
            </div>

            <div>
              <label style={{ color: "white", display: "block", marginBottom: "0.5rem" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                maxLength={100}
                required
                style={{ 
                  padding: "0.5rem", 
                  background: "#1f2937", 
                  color: "white", 
                  border: "1px solid #4b5563", 
                  borderRadius: "4px",
                  width: "100%"
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={passwordLoading}
              style={{ 
                padding: "0.5rem 1rem", 
                background: passwordLoading ? "#6b7280" : "#3b82f6", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: passwordLoading ? "not-allowed" : "pointer"
              }}
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      )}

      {!hasPassword && (
        <div style={{ 
          background: "#fef3c7", 
          border: "1px solid #f59e0b", 
          color: "#92400e", 
          padding: "0.75rem", 
          borderRadius: "4px",
          fontSize: "0.875rem"
        }}>
          Password change is not available for users who signed up only via Google OAuth.
        </div>
      )}
    </div>
  );
}

