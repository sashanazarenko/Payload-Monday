# GitHub MCP Server

An MCP server that exposes a few GitHub tools (repos + issues) over stdio.

## Prereqs

- Node.js 20+ (recommended)
- A GitHub Personal Access Token in `GITHUB_TOKEN`
  - Fine-grained or classic token is OK.
  - Minimum scopes:
    - Public repos: usually none (still requires a token for higher rate limits)
    - Private repos: `repo`
    - Creating issues / commenting: repo access to the target repo

## Install

```bash
cd "github-mcp"
npm i
```

## Run (dev)

```bash
cd "github-mcp"
export GITHUB_TOKEN="ghp_***"
npm run dev
```

## Run (build + start)

```bash
cd "github-mcp"
npm run build
export GITHUB_TOKEN="ghp_***"
npm start
```

## Tools

- `github_list_repos`
- `github_get_repo`
- `github_list_issues`
- `github_create_issue`
- `github_add_issue_comment`

