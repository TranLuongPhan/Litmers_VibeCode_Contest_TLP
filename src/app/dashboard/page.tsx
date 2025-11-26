import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Dashboard</h1>
            <p>Welcome, {session.user?.name || session.user?.email}</p>
            <p>This is a protected page.</p>
        </div>
    );
}
