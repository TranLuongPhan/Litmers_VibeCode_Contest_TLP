import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Welcome to Vibecode</h1>
      <p>Project initialized successfully.</p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <a href="/login" style={{ color: "blue" }}>Login</a>
        <a href="/register" style={{ color: "green" }}>Register</a>
        <a href="/dashboard" style={{ color: "purple" }}>Dashboard</a>
      </div>
    </main>
  );
}
