import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, description, status, priority } = await req.json();

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    // Find the user to get their ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Find the user's project (we created a default "My Project" on signup)
    // In a real app, projectId would be passed in the request
    const project = await prisma.project.findFirst({
      where: { ownerId: user.id }
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found. Please re-login to create default project." }, { status: 404 });
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        status: status || "Backlog",
        priority: priority || "MEDIUM",
        projectId: project.id,
        creatorId: user.id,
        assigneeId: user.id, // Auto-assign to creator for MVP
      }
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get all issues for projects owned by the user
    // For MVP, we assume user only sees their own project's issues
    const issues = await prisma.issue.findMany({
      where: {
        project: {
          ownerId: user.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, status, priority, title, description } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Issue ID is required" }, { status: 400 });
    }

    // Verify ownership (simple check for MVP)
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const issue = await prisma.issue.findUnique({
        where: { id },
        include: { project: true }
    });

    if (!issue) {
        return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    if (issue.project.ownerId !== user.id) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: {
        status: status || undefined,
        priority: priority || undefined,
        title: title || undefined,
        description: description || undefined,
      }
    });

    return NextResponse.json(updatedIssue);
  } catch (error) {
    console.error("Error updating issue:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
