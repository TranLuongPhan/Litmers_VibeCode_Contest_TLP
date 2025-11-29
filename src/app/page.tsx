import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Welcome to AI Powered Issue Tracking Web Application</h1>
      <p>Let's start!</p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <a href="/login" style={{ color: "blue" }}>Login</a>
        <a href="/register" style={{ color: "green" }}>Register</a>
        <a href="/dashboard" style={{ color: "purple" }}>Dashboard(Guest)</a>
      </div>
    </main>
  );
}
