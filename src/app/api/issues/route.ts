import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      console.error("Unauthorized: No session or email", { 
        hasSession: !!session, 
        hasUser: !!session?.user, 
        email: session?.user?.email 
      });
      return NextResponse.json({ message: "Please login to use the service" }, { status: 401 });
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
    let project = await prisma.project.findFirst({
      where: { ownerId: user.id }
    });

    // Auto-create project if it doesn't exist
    if (!project) {
      console.log("Project not found for user, creating default project", { userId: user.id, email: user.email });
      
      // Find or create a team for the user
      let team = await prisma.team.findFirst({
        where: { ownerId: user.id }
      });

      if (!team) {
        team = await prisma.team.create({
          data: {
            name: "Personal Team",
            ownerId: user.id,
            members: {
              create: {
                userId: user.id,
                role: "OWNER"
              }
            }
          }
        });
      }

      // Create the default project
      project = await prisma.project.create({
        data: {
          name: "My Project",
          description: "Your first project",
          teamId: team.id,
          ownerId: user.id,
        }
      });
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? errorMessage : undefined
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Please login to use the service" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const assigneeId = searchParams.get("assigneeId") || "";
    const priority = searchParams.get("priority") || "";
    const hasDueDate = searchParams.get("hasDueDate") === "true";
    const dueDateFrom = searchParams.get("dueDateFrom") || "";
    const dueDateTo = searchParams.get("dueDateTo") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build where clause
    const where: any = {
      project: {
        ownerId: user.id
      },
      deletedAt: null // Only get non-deleted issues
    };

    // Title text search
    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive"
      };
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Assignee filter
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    // Priority filter
    if (priority) {
      where.priority = priority;
    }

    // Due date filters
    if (hasDueDate) {
      where.dueDate = {
        not: null
      };
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) {
        where.dueDate.gte = new Date(dueDateFrom);
      }
      if (dueDateTo) {
        where.dueDate.lte = new Date(dueDateTo);
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "dueDate") {
      orderBy[sortBy] = sortOrder;
    } else if (sortBy === "priority") {
      // Custom priority sorting: HIGH > MEDIUM > LOW
      // We'll sort in memory for priority
      orderBy.createdAt = "desc"; // Default fallback
    } else {
      orderBy.createdAt = "desc"; // Default
    }

    // Get all issues for projects owned by the user
    let issues = await prisma.issue.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: sortBy === "priority" ? { createdAt: "desc" } : orderBy
    });

    // Sort by priority if needed (HIGH > MEDIUM > LOW)
    if (sortBy === "priority") {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      issues.sort((a, b) => {
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        if (sortOrder === "asc") {
          return aPriority - bPriority;
        } else {
          return bPriority - aPriority;
        }
      });
    }

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
      return NextResponse.json({ message: "Please login to use the service" }, { status: 401 });
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

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Please login to use the service" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Issue ID is required" }, { status: 400 });
    }

    // Verify ownership
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

    // Soft delete by setting deletedAt
    const deletedIssue = await prisma.issue.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return NextResponse.json({ message: "Issue deleted successfully", id: deletedIssue.id });
  } catch (error) {
    console.error("Error deleting issue:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
