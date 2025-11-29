# GitHub and Vercel MCP Server Installation Guide

This guide will help you set up the Model Context Protocol (MCP) servers for **GitHub** and **Vercel**.

## Prerequisites

1.  **Docker**: Required for running the GitHub MCP server locally. [Install Docker Desktop](https://www.docker.com/products/docker-desktop/).
2.  **GitHub Personal Access Token (PAT)**:
    *   Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens).
    *   Generate a new token (classic) with `repo` and `user` scopes.
    *   **Save this token**; you will need it for the configuration.
3.  **Vercel API Token**:
    *   Go to [Vercel Account Settings > Tokens](https://vercel.com/account/tokens).
    *   Create a new token.

---

## 1. GitHub MCP Server

The recommended way to run the GitHub MCP server is using Docker. This ensures you have the latest version and all dependencies.

### Configuration for Claude Desktop

1.  Open your Claude Desktop configuration file:
    *   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
    *   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

2.  Add the following entry to the `mcpServers` object:

```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_GITHUB_TOKEN_HERE",
        "ghcr.io/modelcontextprotocol/servers/github:latest"
      ]
    }
  }
}
```

> [!IMPORTANT]
> Replace `YOUR_GITHUB_TOKEN_HERE` with your actual GitHub Personal Access Token.

### Configuration for VS Code (with MCP Extension)

If you are using an MCP extension in VS Code, you can typically add the same configuration in the extension's settings or `settings.json` under the MCP servers section.

---

## 2. Vercel MCP Server

Vercel provides an official hosted MCP server.

### Official Server URL

*   **URL**: `https://mcp.vercel.com`

### Configuration

#### For Clients Supporting Remote/SSE Servers (e.g., Cursor, some VS Code extensions)

1.  Look for an option to "Add MCP Server" or "Connect to Remote Server".
2.  Enter the URL: `https://mcp.vercel.com`
3.  Follow the authentication flow (usually opens a browser window to authorize with Vercel).

#### For Claude Desktop

Currently, Claude Desktop primarily supports local process-based (stdio) MCP servers. Support for remote SSE servers like Vercel's official one might require a local bridge or a specific update.

**Alternative: Local Vercel Server (Community)**

If you need a local Vercel server for Claude Desktop, you can use a community implementation or build one. However, the official recommendation is to use the hosted URL with a compatible client.

If you want to try a local setup via `npx` (if a package is available), you can add:

```json
"vercel": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-vercel" 
  ],
  "env": {
    "VERCEL_API_TOKEN": "YOUR_VERCEL_TOKEN_HERE"
  }
}
```
*(Note: Verify if the `@modelcontextprotocol/server-vercel` package supports stdio mode. If not, you may need to rely on the hosted URL method with a different client.)*

---

## Troubleshooting

*   **Docker Errors**: Ensure Docker Desktop is running. If you see "image not found" or permission errors, try running `docker pull ghcr.io/modelcontextprotocol/servers/github:latest` manually in your terminal.
*   **Authentication**: Double-check that your API tokens have the correct permissions.
