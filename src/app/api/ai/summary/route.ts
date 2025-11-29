import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Please login to use the service" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ message: "OpenAI API key not configured" }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get all issues for the user's projects
    const issues = await prisma.issue.findMany({
      where: {
        project: {
          ownerId: user.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to last 20 issues for summary
    });

    if (issues.length === 0) {
      return NextResponse.json({ 
        summary: "You don't have any issues yet. Create some issues to get an AI summary!" 
      });
    }

    // Format issues for the AI prompt
    const issuesText = issues.map((issue, idx) => 
      `${idx + 1}. [${issue.status}] ${issue.title} (Priority: ${issue.priority})${issue.description ? ` - ${issue.description}` : ''}`
    ).join('\n');

    const prompt = `You are a project management assistant. Analyze the following list of issues and provide a concise summary (2-3 sentences) highlighting:
1. Overall project status
2. Key priorities or blockers
3. Progress trends

Issues:
${issuesText}

Provide a friendly, actionable summary:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful project management assistant that provides concise, actionable summaries." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content || "Unable to generate summary.";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return NextResponse.json({ 
      message: "Failed to generate summary",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

