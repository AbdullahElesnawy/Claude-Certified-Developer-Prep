// Practice questions for this course. Original questions, not from the real exam.
// Fields: s = section, q = question, o = options, a = indexes of correct options, w = explanation.
(window.QUIZ_BANK = window.QUIZ_BANK || {})["claude-code"] = [
  {
    "s": "Workflow and permissions",
    "q": "A developer is asked to change how session tokens are refreshed in an unfamiliar 400K-line codebase. What is the best way to start with Claude Code?",
    "o": [
      "Ask Claude to implement the change immediately in `bypassPermissions` mode to save time.",
      "Use plan mode: have Claude explore the relevant code and write a plan listing files, changes, and how it will verify them, then review the plan before any edits.",
      "Paste the whole codebase into the first prompt.",
      "Use `acceptEdits` and review the result after Claude finishes."
    ],
    "a": [
      1
    ],
    "w": "For unfamiliar, risky changes, explore and plan before editing. Reviewing a plan is the cheapest place to catch a wrong approach. Bypass (A) removes every safeguard, and accepting edits first (D) moves review to the most expensive point."
  },
  {
    "s": "Workflow and permissions",
    "q": "A team wants Claude Code to run unattended for several hours on a developer laptop that also holds cloud credentials. Which permission approach fits best?",
    "o": [
      "`bypassPermissions`, because nobody will be there to approve prompts.",
      "`auto` mode, where a classifier reviews each action and blocks ones that go beyond the task, or run inside an isolated container with no real credentials.",
      "`default` mode, and accept that the run will stall on the first prompt.",
      "Add \"do not touch cloud resources\" to CLAUDE.md and use `bypassPermissions`."
    ],
    "a": [
      1
    ],
    "w": "`bypassPermissions` belongs only in isolated containers or VMs. `auto` adds a classifier check instead of a human, and isolation removes the credentials entirely. CLAUDE.md text (D) is not enforcement."
  },
  {
    "s": "Workflow and permissions",
    "q": "A settings file contains `\"allow\": [\"Bash(git *)\"]` and `\"deny\": [\"Bash(git push *)\"]`. What happens when Claude runs `git push origin main`?",
    "o": [
      "It runs, because the allow rule matches first.",
      "It is blocked, because deny rules are evaluated before ask and allow rules.",
      "Claude Code asks the user, because the two rules conflict.",
      "It runs, because the more specific rule wins."
    ],
    "a": [
      1
    ],
    "w": "Permission rules are checked in the order deny, then ask, then allow. A matching deny always wins, whatever the specificity."
  },
  {
    "s": "Workflow and permissions",
    "q": "A CI job runs `claude -p` to fix lint errors. It must not hang waiting for approvals and must only use a known set of tools. Which configuration fits best?",
    "o": [
      "`--dangerously-skip-permissions`",
      "`--permission-mode dontAsk` with `--allowedTools` listing the exact commands needed",
      "Interactive mode with a human watching the CI logs",
      "`--permission-mode plan`"
    ],
    "a": [
      1
    ],
    "w": "`dontAsk` fails closed: anything not pre-approved is denied rather than prompting. Combined with a narrow allow list, the job is non-interactive and bounded. Skipping permissions (A) fails open."
  },
  {
    "s": "Reviewing AI code",
    "q": "Claude reports \"All 48 tests pass\" after a change to the billing module. What should the reviewer rely on before merging?",
    "o": [
      "Claude's report, since it ran the tests.",
      "The CI result, plus at least one test that failed before the change and passes after it, and a review of whether any tests were modified.",
      "A second prompt asking Claude whether it is sure.",
      "The fact that the code is well formatted and commented."
    ],
    "a": [
      1
    ],
    "w": "Calibrated trust means trusting evidence, not confidence. Independent CI results, a test that proves the fix, and a check that tests weren't edited to pass are evidence. The model's own claim is not."
  },
  {
    "s": "Reviewing AI code",
    "q": "Where should a team place the strictest human review gate for AI-generated changes?",
    "o": [
      "Equally on every change, regardless of risk.",
      "On documentation changes, since they are customer-facing.",
      "On changes whose mistakes are costly or irreversible, such as auth, payments, data migrations, and production deploys.",
      "Nowhere, if CI passes."
    ],
    "a": [
      2
    ],
    "w": "Review effort should scale with the cost of a wrong call. Uniform heavy review (A) wastes effort and gets skipped; no review (D) ignores what CI can't catch."
  },
  {
    "s": "Reviewing AI code",
    "q": "A modernization effort will migrate 300 files from a legacy framework. Which approach is easiest to review safely?",
    "o": [
      "One large PR so the change is atomic.",
      "Small staged PRs, each covered by characterization tests that pin current behavior, so each step can be reviewed and reverted.",
      "Let Claude merge directly to main once its tests pass.",
      "Rewrite everything from scratch in a new repo."
    ],
    "a": [
      1
    ],
    "w": "Nobody reviews a 300-file PR properly. Small staged changes protected by characterization tests keep each step reviewable and reversible."
  },
  {
    "s": "Project context",
    "q": "Every developer on a team must have the project's build, test, and lint commands available to Claude in every session. Where should they go?",
    "o": [
      "Each developer's `~/.claude/CLAUDE.md`.",
      "The project's `CLAUDE.md`, committed to the repository.",
      "`CLAUDE.local.md`.",
      "A comment at the top of `main.ts`."
    ],
    "a": [
      1
    ],
    "w": "Project `CLAUDE.md` is shared through git and loads every session. User files (A) and `CLAUDE.local.md` (C) are personal."
  },
  {
    "s": "Project context",
    "q": "Claude must never run `rm -rf` or `git push --force` in this repository, with no exceptions. What is the most reliable control?",
    "o": [
      "A line in CLAUDE.md saying never to run these commands.",
      "A `PreToolUse` hook on Bash that blocks these commands (exit code 2), and/or deny rules in settings.",
      "A Skill describing safe git usage.",
      "A reminder in each prompt."
    ],
    "a": [
      1
    ],
    "w": "CLAUDE.md is guidance the model can miss. Hooks and permission rules are enforced deterministically by the harness."
  },
  {
    "s": "Project context",
    "q": "A `PreToolUse` hook script is meant to block a dangerous command, but the command still runs. The script prints an error and exits with code 1. What is wrong?",
    "o": [
      "Hooks cannot block commands.",
      "Exit code 1 is a non-blocking error; the hook must exit with code 2 (or return a JSON `deny` decision) to block.",
      "The hook must be defined in CLAUDE.md.",
      "The matcher must be `*`."
    ],
    "a": [
      1
    ],
    "w": "Only exit code 2 blocks. Any other non-zero code is treated as a non-blocking error, and the action proceeds."
  },
  {
    "s": "Project context",
    "q": "Rules for API handlers in `src/api/**` are long and irrelevant when developers work on the frontend. How should they be provided?",
    "o": [
      "Put them all in the root CLAUDE.md.",
      "Put them in a `.claude/rules/` file with `paths:` frontmatter matching `src/api/**`, so they load only when Claude works on those files.",
      "Put them in `~/.claude/CLAUDE.md`.",
      "Put them in the system prompt of every subagent."
    ],
    "a": [
      1
    ],
    "w": "Path-scoped rules load only when matching files are touched, which keeps the always-loaded context small."
  },
  {
    "s": "Project context",
    "q": "A security team must enforce deny rules and disable `bypassPermissions` for every developer, and developers must not be able to override this. Where should the configuration live?",
    "o": [
      "`.claude/settings.json` in each repository.",
      "Each developer's `~/.claude/settings.json`.",
      "Managed settings deployed by IT (for example `managed-settings.json` or MDM).",
      "`.claude/settings.local.json`."
    ],
    "a": [
      2
    ],
    "w": "Managed settings have the highest precedence and can't be overridden by user, project, or local settings."
  },
  {
    "s": "Project context",
    "q": "You want a reviewer subagent that inspects diffs for security issues but can never modify files. Which configuration fits?",
    "o": [
      "A subagent in `.claude/agents/` with `tools: Read, Grep, Glob` and a description saying when to use it.",
      "A subagent with all tools and an instruction not to edit files.",
      "A CLAUDE.md section called \"security review\".",
      "A PostToolUse hook that reverts any edit."
    ],
    "a": [
      0
    ],
    "w": "Restricting the subagent's tool allowlist is least privilege: it cannot edit because it has no edit tools. The description tells Claude when to delegate to it."
  },
  {
    "s": "Skills, commands, plugins",
    "q": "A team has a 600-line release procedure with helper scripts. They want Claude to use it only when doing a release, without loading it into every session. What fits best?",
    "o": [
      "Add the procedure to the root CLAUDE.md.",
      "Package it as a Skill: `SKILL.md` with a clear description, plus the scripts as supporting files.",
      "Build an MCP server that returns the procedure as text.",
      "Paste it into the prompt whenever a release is needed."
    ],
    "a": [
      1
    ],
    "w": "Skills use progressive disclosure: only the description is always loaded; the body and files load when the Skill is used. CLAUDE.md (A) loads everything every session."
  },
  {
    "s": "Skills, commands, plugins",
    "q": "An Agent SDK application cannot find the project's Skills in `.claude/skills/`, although Claude Code finds them. What is the most likely cause?",
    "o": [
      "Skills only work in Claude Code.",
      "The app sets `settingSources` (or `setting_sources`) without including `project`, so project Skills are not discovered.",
      "Skills must be uploaded with the Skills API to work in the SDK.",
      "The Skill's `SKILL.md` is longer than 100 lines."
    ],
    "a": [
      1
    ],
    "w": "The Agent SDK discovers filesystem Skills through its setting sources. Setting them explicitly without `project` or `user` loads no Skills from those locations."
  },
  {
    "s": "Skills, commands, plugins",
    "q": "A Skill works in Claude Code but fails when used through the Messages API with code execution. Its script runs `pip install` and calls an external HTTP API. Why?",
    "o": [
      "The Messages API does not support custom Skills.",
      "The code execution container has no network access and cannot install packages at runtime.",
      "Skills require the Agent SDK.",
      "The Skill's description is too short."
    ],
    "a": [
      1
    ],
    "w": "Skills used through the API run in a sandboxed container without network access or runtime package installs. A portable Skill must not depend on either."
  },
  {
    "s": "Skills, commands, plugins",
    "q": "A platform team wants 40 engineers to get the same Skills, subagents, hooks, and MCP servers, versioned and updatable from one place. What should they ship?",
    "o": [
      "A wiki page with copy-paste instructions.",
      "A plugin published to a team marketplace and enabled at project scope.",
      "A shared CLAUDE.md file emailed to everyone.",
      "One large Skill containing everything."
    ],
    "a": [
      1
    ],
    "w": "Plugins bundle Skills, commands, agents, hooks, and MCP servers into one installable, versioned unit that a marketplace distributes."
  },
  {
    "s": "Skills, commands, plugins",
    "q": "Claude needs to read and update tickets in the company's internal ticketing system from Claude Code, Claude Desktop, and a customer-facing app. Which approach fits best?",
    "o": [
      "A Skill describing the ticketing system.",
      "An MCP server exposing ticket operations as tools, maintained independently and connected to each client.",
      "A built-in tool, since built-in tools can reach internal APIs.",
      "Copy the ticket data into each app's context on every request."
    ],
    "a": [
      1
    ],
    "w": "Access to an external system shared across several clients is what MCP is for. A Skill (A) teaches how to do something; it does not grant access to a system."
  },
  {
    "s": "MCP servers",
    "q": "An MCP server should expose the database schema so users can attach it to a conversation as read-only context. Which primitive fits?",
    "o": [
      "Tool",
      "Resource",
      "Prompt",
      "Sampling"
    ],
    "a": [
      1
    ],
    "w": "Resources are read-only data identified by a URI and are application/user-controlled. Tools are model-controlled actions; prompts are user-invoked templates."
  },
  {
    "s": "MCP servers",
    "q": "Which statement correctly matches MCP primitives to who controls them?",
    "o": [
      "Tools: user-controlled. Resources: model-controlled. Prompts: application-controlled.",
      "Tools: model-controlled. Resources: application-controlled. Prompts: user-controlled.",
      "All three are model-controlled.",
      "Tools: application-controlled. Resources: user-controlled. Prompts: model-controlled."
    ],
    "a": [
      1
    ],
    "w": "The model decides when to call tools, the host application decides which resources to include, and users choose prompts explicitly (like slash commands)."
  },
  {
    "s": "MCP servers",
    "q": "An MCP server will be used by 200 employees and must authenticate each user against the company identity provider. Which transport fits?",
    "o": [
      "stdio, launched on each laptop.",
      "Streamable HTTP, deployed remotely, with OAuth.",
      "SSE.",
      "Writing results to a shared file."
    ],
    "a": [
      1
    ],
    "w": "A shared, remote, authenticated server uses Streamable HTTP with OAuth. stdio is for local single-user processes, and SSE is deprecated."
  },
  {
    "s": "MCP servers",
    "q": "A stdio MCP server fails with protocol errors right after startup. The developer added `console.log` debug statements. What is the likely cause?",
    "o": [
      "stdio servers can't log at all.",
      "stdout carries the protocol messages, so logging to stdout corrupts them; logs should go to stderr.",
      "The server must use HTTP to log.",
      "`console.log` is too slow."
    ],
    "a": [
      1
    ],
    "w": "In stdio transport, stdout is the protocol channel. Debug output there breaks JSON-RPC framing."
  },
  {
    "s": "MCP servers",
    "q": "A team commits an MCP server to `.mcp.json` so everyone gets it. The server needs an API token. How should the token be handled?",
    "o": [
      "Write the token directly in `.mcp.json`.",
      "Reference an environment variable in `.mcp.json` (for example `${INVENTORY_TOKEN}`) and have each developer set it locally or through a secrets manager.",
      "Put the token in CLAUDE.md.",
      "Use the same shared token in the URL query string."
    ],
    "a": [
      1
    ],
    "w": "`.mcp.json` supports environment variable expansion, so the config can be shared through git without containing secrets."
  },
  {
    "s": "MCP servers",
    "q": "Which statements about MCP configuration scopes in Claude Code are correct?",
    "o": [
      "Project scope is stored in `.mcp.json` at the project root and is meant to be shared.",
      "Local scope is the default and applies only to you in the current project.",
      "User scope servers are stored in `.mcp.json` in every project.",
      "Project-scoped servers run without any approval prompt in interactive sessions."
    ],
    "a": [
      0,
      1
    ],
    "w": "Project scope lives in `.mcp.json`; local (default) and user scopes live in `~/.claude.json`. Interactive sessions ask for approval before using project-scoped servers."
  },
  {
    "s": "Enterprise integration",
    "q": "A regulated bank wants developers to use Claude Code while keeping model traffic inside its AWS account, with IAM-controlled access and CloudTrail auditing. Which setup fits?",
    "o": [
      "A shared Anthropic API key stored in each developer's `.env` file.",
      "Claude Code configured for Amazon Bedrock (`CLAUDE_CODE_USE_BEDROCK=1`) with IAM / SSO credentials, enforced through managed settings.",
      "Personal claude.ai accounts.",
      "An API key hard-coded in a shared script."
    ],
    "a": [
      1
    ],
    "w": "Routing through the customer's cloud provider uses their identity, access control, and audit tooling. Managed settings keep developers from switching away."
  },
  {
    "s": "Enterprise integration",
    "q": "An MCP server gives Claude access to a CRM. In the security review, which design is most likely to be accepted?",
    "o": [
      "A single service account with admin rights, shared by all users.",
      "OAuth per user with narrowly scoped, short-lived tokens, so every action is attributable to a person and limited to their permissions.",
      "A static API key embedded in the server's source code.",
      "No authentication, since the server is on the internal network."
    ],
    "a": [
      1
    ],
    "w": "Per-user identity, least-privilege scopes, and short-lived tokens give attribution, containment, and revocation. A shared admin account (A) does none of these."
  },
  {
    "s": "Enterprise integration",
    "q": "You are scoping a Claude Code modernization engagement for a regulated customer. Which elements help it pass a security review?",
    "o": [
      "Work runs on a branch or copy in an isolated environment with no production credentials.",
      "Every change goes through PR review and CI before merge.",
      "Claude is given production database access so it can verify behavior directly.",
      "Managed settings deny access to secrets and disable `bypassPermissions`.",
      "The whole codebase is migrated in one release to finish faster."
    ],
    "a": [
      0,
      1,
      3
    ],
    "w": "Isolation, human review gates, and centrally enforced permissions are the controls reviewers look for. Production access (C) and a big-bang migration (E) increase risk."
  }
];
