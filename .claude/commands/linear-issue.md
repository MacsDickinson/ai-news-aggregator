# linear-issue

Implements a Linear issue for the AI News Aggregator project using the Linear MCP integration configured in `.cursor/mcp.json`.

## Usage

```
linear-issue <ISSUE_KEY>
```

- **ISSUE_KEY**: the human key from Linear, e.g. `APP-123` or `ENG-42`.
- You can also start with a search query if you don’t know the key.

## Implementation Workflow

### 1. Fetch and Analyze Issue (via Linear MCP)

- Ask to retrieve the issue: “Get Linear issue APP-123”.
- If needed, search: “Search Linear issues for: onboarding modal in team APP”.
- Extract: title, description, team, project, status, labels, priority, estimate, assignee, and any acceptance criteria.
- Identify phase/milestone from labels or description.

### 2. Understand Requirements

- Determine if this is a feature, fix, infrastructure, or testing task.
- List specific changes needed per acceptance criteria.
- Note dependencies or links to related issues/projects.
- Review referenced docs in `/docs` if mentioned.

### 3. Create Feature Branch

- Determine branch type from labels or inferred type (feat, fix, chore, docs, test).
- Use the Linear key and a kebab title, for example:
  - `git checkout -b feat/APP-123-implement-onboarding-modal`
- Ensure you’re not on `main` before changes.

### 4. Search and Analyze Codebase

- Search for related code and patterns.
- Review existing implementations for consistency.
- Check tests that might need updates.

### 5. Plan Implementation

- Break down the task into concrete steps.
- List files to create/modify and any config changes.
- Track steps in a todo list.

### 5. Implement Changes

- Follow existing patterns and conventions.
- Use TypeScript with strict typing.
- Ensure all acceptance criteria are addressed.

### 6. Write/Update Tests

- Use Bun test runner.
- Cover acceptance criteria and edge cases.

### 7. Run Validation Checks

Execute in parallel:

- `bun test` - all tests
- `bun run lint` - Biome lint
- `bun run format` - Biome format
- `bun run typecheck` - TypeScript compile

Fix issues before proceeding.

### 8. Update Implementation Status (via Linear MCP)

- Move the issue to “In Progress” when starting.
- Post progress comments as milestones are met.
- Move to “In Review” when PR is opened; “Done” after merge.

### 9. Create Commit

Use conventional commits and include the Linear key (helps linking):

- Format: `<type>: <description> (<ISSUE_KEY>)`
- Example: `feat: implement onboarding modal (APP-123)`

### 10. Push Branch and Create Pull Request

- Push the branch: `git push -u origin <branch>`
- Create a PR (e.g., via GitHub CLI or UI). Include the Linear key in the PR title/body.
- PR body should include:
  - Summary of changes
  - Issue reference: `APP-123`
  - Checklist of acceptance criteria
  - Test results summary
  - Any notes/risks
- Target branch: `main`. Never push directly to `main`.

### 11. Provide Summary

Recap:

- What was implemented
- Files changed
- Tests added/modified
- Follow-up work, if any

## Error Handling

- If the Linear MCP server isn’t reachable, ensure `.cursor/mcp.json` contains the `linear` server and that credentials/integration are configured.
- If the issue isn’t found, search by keywords and team, or confirm the key.
- If validation checks fail, fix before creating the PR.

## Helpful MCP Prompts

- “List my Linear teams”
- “Get Linear issue APP-123”
- “Search Linear issues: onboarding modal in team APP”
- “Update Linear issue APP-123: move to In Progress”
- “Comment on Linear issue APP-123: <message>”

## Important Notes

- Always create a feature branch; never commit directly to `main`.
- Keep the Linear key in the branch name, commits, and PR title for auto-linking.
- Follow the monorepo structure and Bun tooling used in this repo.