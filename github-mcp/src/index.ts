import { Octokit } from "@octokit/rest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "Missing GITHUB_TOKEN. Set it to a GitHub Personal Access Token before starting the server."
    );
  }
  return new Octokit({ auth: token, userAgent: "github-mcp/0.0.1" });
}

function jsonResult<T extends Record<string, unknown>>(output: T) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
    structuredContent: output,
  };
}

const server = new McpServer({ name: "github-mcp", version: "0.0.1" });

server.registerTool(
  "github_list_repos",
  {
    title: "List GitHub repositories",
    description:
      "List repositories for a user, org, or the authenticated account (default).",
    annotations: { readOnlyHint: true },
    inputSchema: z.object({
      username: z.string().min(1).optional(),
      org: z.string().min(1).optional(),
      page: z.number().int().min(1).optional(),
      perPage: z.number().int().min(1).max(100).optional(),
      sort: z.enum(["created", "updated", "pushed", "full_name"]).optional(),
      direction: z.enum(["asc", "desc"]).optional(),
      visibility: z.enum(["all", "public", "private"]).optional(),
    }),
    outputSchema: z.object({
      repos: z
        .array(
          z.object({
            id: z.number(),
            full_name: z.string(),
            private: z.boolean(),
            html_url: z.string().url(),
            default_branch: z.string(),
            description: z.string().nullable().optional(),
            updated_at: z.string().optional(),
          })
        )
        .default([]),
    }),
  },
  async (args) => {
    const octokit = getOctokit();
    const page = args.page ?? 1;
    const per_page = args.perPage ?? 30;

    const { data } = args.org
      ? await octokit.rest.repos.listForOrg({
          org: args.org,
          page,
          per_page,
          sort: args.sort,
          direction: args.direction,
          type: "all",
        })
      : args.username
        ? await octokit.rest.repos.listForUser({
            username: args.username,
            page,
            per_page,
            sort: args.sort,
            direction: args.direction,
          })
        : await octokit.rest.repos.listForAuthenticatedUser({
            page,
            per_page,
            sort: args.sort,
            direction: args.direction,
            visibility: args.visibility,
          });

    const output = {
      repos: data.map((r) => ({
        id: r.id,
        full_name: r.full_name,
        private: r.private,
        html_url: r.html_url,
        default_branch: r.default_branch,
        description: r.description ?? null,
        updated_at: r.updated_at,
      })),
    };
    return jsonResult(output);
  }
);

server.registerTool(
  "github_get_repo",
  {
    title: "Get a GitHub repository",
    description: "Fetch repository metadata by owner/name.",
    annotations: { readOnlyHint: true },
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
    }),
  },
  async ({ owner, repo }) => {
    const octokit = getOctokit();
    const { data } = await octokit.rest.repos.get({ owner, repo });
    return jsonResult({
      id: data.id,
      full_name: data.full_name,
      private: data.private,
      html_url: data.html_url,
      default_branch: data.default_branch,
      description: data.description,
      topics: data.topics,
      visibility: data.visibility,
      archived: data.archived,
      disabled: data.disabled,
      pushed_at: data.pushed_at,
      updated_at: data.updated_at,
      created_at: data.created_at,
      open_issues_count: data.open_issues_count,
    });
  }
);

server.registerTool(
  "github_list_issues",
  {
    title: "List GitHub issues",
    description:
      "List issues for a repository. Pull requests may be included; filter them client-side if needed.",
    annotations: { readOnlyHint: true },
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      state: z.enum(["open", "closed", "all"]).optional(),
      labels: z.string().optional(),
      assignee: z.string().optional(),
      page: z.number().int().min(1).optional(),
      perPage: z.number().int().min(1).max(100).optional(),
    }),
  },
  async ({ owner, repo, state, labels, assignee, page, perPage }) => {
    const octokit = getOctokit();
    const { data } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state,
      labels,
      assignee,
      page: page ?? 1,
      per_page: perPage ?? 30,
    });

    return jsonResult({
      issues: data.map((i) => ({
        id: i.id,
        number: i.number,
        title: i.title,
        state: i.state,
        html_url: i.html_url,
        user: i.user?.login ?? null,
        labels: i.labels.map((l) =>
          typeof l === "string" ? l : l.name ?? ""
        ),
        comments: i.comments,
        created_at: i.created_at,
        updated_at: i.updated_at,
      })),
    });
  }
);

server.registerTool(
  "github_create_issue",
  {
    title: "Create a GitHub issue",
    description: "Create a new issue in a repository.",
    annotations: { readOnlyHint: false },
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      title: z.string().min(1),
      body: z.string().optional(),
      labels: z.array(z.string().min(1)).optional(),
    }),
  },
  async ({ owner, repo, title, body, labels }) => {
    const octokit = getOctokit();
    const { data } = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
      labels,
    });

    return jsonResult({
      number: data.number,
      html_url: data.html_url,
      title: data.title,
      state: data.state,
    });
  }
);

server.registerTool(
  "github_add_issue_comment",
  {
    title: "Add an issue comment",
    description: "Add a comment to an existing issue.",
    annotations: { readOnlyHint: false },
    inputSchema: z.object({
      owner: z.string().min(1),
      repo: z.string().min(1),
      issue_number: z.number().int().min(1),
      body: z.string().min(1),
    }),
  },
  async ({ owner, repo, issue_number, body }) => {
    const octokit = getOctokit();
    const { data } = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body,
    });
    return jsonResult({ id: data.id, html_url: data.html_url });
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // Stdio servers should write errors to stderr so clients can surface them.
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

