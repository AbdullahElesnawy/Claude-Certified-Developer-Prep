# Exam Blueprint Checklist

All 25 skills from the official CCDV-F exam guide (version 1.0), with their share of the exam and where this repo
covers them. Use it to check yourself: tick a row only when you could answer a scenario question on it without
looking anything up.

Weights are each skill's share of the whole exam. Skill names are from the guide; the notes are written in Arabic
with the English terms kept.

## 1. Agents and Workflows · 14.7%

| ✓ | Skill | Weight | Where it's covered |
|---|---|---|---|
| ☐ | Agent Architecture: workflow vs agent, manager/supervisor hierarchies, subagents | 4.5% | [prompting/06-agents](production-grade-prompting/06-agents.md) |
| ☐ | Agent Construction with Claude: Agent SDK, custom loops and harnesses, self-hosted vs Anthropic-hosted, hooks | 5.3% | [prompting/06-agents](production-grade-prompting/06-agents.md), [prompting/03-tool-use](production-grade-prompting/03-tool-use.md), [claude-code/03-project-context](claude-code-mcp-integration/03-project-context.md) (hooks) |
| ☐ | Agent Patterns and Frameworks: tool loops, subagents, memory, context-window management; Strands, LangGraph, PydanticAI | 4.9% | [prompting/05-context-engineering](production-grade-prompting/05-context-engineering.md), [prompting/07-memory](production-grade-prompting/07-memory.md), [extra-topics/02-agentic-frameworks](extra-topics/02-agentic-frameworks.md) |

## 2. Applications and Integration · 33.1%

| ✓ | Skill | Weight | Where it's covered |
|---|---|---|---|
| ☐ | Understanding Requirements | 3.4% | [extra-topics/01-software-engineering](extra-topics/01-software-engineering.md), [accelerators/04-platform-comparison](accelerators-ip-contribution/04-platform-comparison.md) |
| ☐ | Systems Life Cycle | 2.8% | [extra-topics/01-software-engineering](extra-topics/01-software-engineering.md) |
| ☐ | Claude API Mechanics: messages, tools, streaming, vision, thinking, caching, third-party vendors, batch vs realtime | 6.8% | [prompting/](production-grade-prompting/README.md) (all files), [accelerators/03-platforms-and-versioning](accelerators-ip-contribution/03-platforms-and-versioning.md) |
| ☐ | Software Engineering Foundations: REST, JSON, async, version control, SDLC, code review, refactoring | 7.4% | [extra-topics/01-software-engineering](extra-topics/01-software-engineering.md), [claude-code/02-reviewing-ai-code](claude-code-mcp-integration/02-reviewing-ai-code.md) |
| ☐ | Claude Application Design: instructions across interfaces, content boundaries, schema design, session hygiene, plugin management | 8.6% | [extra-topics/03-claude-across-interfaces](extra-topics/03-claude-across-interfaces.md), [claude-code/04-skills-commands-plugins](claude-code-mcp-integration/04-skills-commands-plugins.md) |
| ☐ | Configuration Management: CLAUDE.md, settings.json, model pinning, prompt versioning, plugin dependencies | 4.1% | [claude-code/03-project-context](claude-code-mcp-integration/03-project-context.md), [accelerators/03-platforms-and-versioning](accelerators-ip-contribution/03-platforms-and-versioning.md) |

## 3. Claude Code · 3.1%

| ✓ | Skill | Weight | Where it's covered |
|---|---|---|---|
| ☐ | Claude Code Operation: rules, skills, commands, agents, memory, sessions, slash commands, headless and streaming modes, auto mode, CLAUDE.md hierarchy, settings.json | 3.1% | [claude-code/01-workflow-and-permissions](claude-code-mcp-integration/01-workflow-and-permissions.md), [claude-code/03-project-context](claude-code-mcp-integration/03-project-context.md), [claude-code/04-skills-commands-plugins](claude-code-mcp-integration/04-skills-commands-plugins.md) |

## 4. Eval, Testing, and Debugging · 2.6%

| ✓ | Skill | Weight | Where it's covered |
|---|---|---|---|
| ☐ | Debugging and Error Handling: error types, recovery strategy, trace analysis, integration layer vs model output | 2.6% | [evals-security/02-testing-and-tracing](production-engineering-evals-security/02-testing-and-tracing.md), [evals-security/03-resilience](production-engineering-evals-security/03-resilience.md) |

## 5. Model Selection and Optimization · 16.8%

| ✓ | Skill | Weight | Where it's covered |
|---|---|---|---|
| ☐ | LLM Fundamentals: tokens, context, sampling, non-determinism; fast mode, extended and adaptive thinking, effort; zero/one/multi-shot | 5.2% | [mso/01](mso-foundations/01-tokens-and-context.md), [mso/02](mso-foundations/02-sampling-and-non-determinism.md), [mso/03](mso-foundations/03-models-and-reasoning.md), [mso/04](mso-foundations/04-shot-prompting.md), [prompting/02-extended-thinking](production-grade-prompting/02-extended-thinking.md) |
| ☐ | Technical Fundamentals: SDKs wrapping REST, websockets | 6.1% | [mso/05-access-patterns](mso-foundations/05-access-patterns.md) |
| ☐ | Model Selection and Tradeoffs: Opus vs Sonnet vs Haiku, quality/latency/cost, breaking changes across releases | 2.7% | [mso/03-models-and-reasoning](mso-foundations/03-models-and-reasoning.md), [accelerators/03-platforms-and-versioning](accelerators-ip-contribution/03-platforms-and-versioning.md) |
| ☐ | Cost and Token Management: usage tracking, cost modelling, prompt caching | 2.8% | [evals-security/04-cost-latency-reliability](production-engineering-evals-security/04-cost-latency-reliability.md), [prompting/08-multimodal-and-batch](production-grade-prompting/08-multimodal-and-batch.md) |

## 6. Prompt and Context Engineering · 11.0%

| ✓ | Skill | Weight | Where it's covered |
|---|---|---|---|
| ☐ | Context Engineering: window management, drift and bloat, tool output pruning, compaction, subagent isolation | 3.8% | [prompting/05-context-engineering](production-grade-prompting/05-context-engineering.md) |
| ☐ | Prompt Engineering: clarity, few-shot, system vs user placement, output constraints, iteration, input sanitization | 4.6% | [prompting/01-prompting](production-grade-prompting/01-prompting.md), [mso/04-shot-prompting](mso-foundations/04-shot-prompting.md) |
| ☐ | Output Handling: structured output, validation, defensive parsing, skepticism toward confident output | 2.6% | [prompting/01-prompting](production-grade-prompting/01-prompting.md), [claude-code/02-reviewing-ai-code](claude-code-mcp-integration/02-reviewing-ai-code.md) |

## 7. Security and Safety · 8.1%

| ✓ | Skill | Weight | Where it's covered |
|---|---|---|---|
| ☐ | AI Application Security: prompt injection, jailbreaks, untrusted input, data leakage, PII | 3.2% | [evals-security/05-security](production-engineering-evals-security/05-security.md) |
| ☐ | Guardrails and Safe Deployment: guardrail layering, least privilege, IAM | 2.3% | [evals-security/05-security](production-engineering-evals-security/05-security.md), [prompting/06-agents](production-grade-prompting/06-agents.md) |
| ☐ | Claude Hooks: guardrails that prevent destructive actions | 1.0% | [claude-code/03-project-context](claude-code-mcp-integration/03-project-context.md) |
| ☐ | Identity, Secrets, and Key Management | 1.6% | [claude-code/06-enterprise-integration](claude-code-mcp-integration/06-enterprise-integration.md), [accelerators/05-multi-deployment](accelerators-ip-contribution/05-multi-deployment.md) |

## 8. Tools and MCPs · 10.6%

| ✓ | Skill | Weight | Where it's covered |
|---|---|---|---|
| ☐ | Tool Implementation: function calling, descriptions, errors, client vs server tools, approval patterns, tool set design | 4.4% | [prompting/03-tool-use](production-grade-prompting/03-tool-use.md) |
| ☐ | MCP Server Development: tools, resources, prompts; stdio vs HTTP; client vs server | 2.1% | [claude-code/05-mcp-servers](claude-code-mcp-integration/05-mcp-servers.md) |
| ☐ | Agentic Customization: built-in tools vs custom tools vs Skills vs MCP | 4.1% | [claude-code/04-skills-commands-plugins](claude-code-mcp-integration/04-skills-commands-plugins.md) |

## How to use this

1. Go through the table and mark each skill: confident, shaky, or never heard of it.
2. Read the linked notes for anything shaky, biggest weights first. Applications and Integration alone is a third of
   the exam.
3. Take the [mock exam](mock-exam/index.html) and compare its per-domain scores with your ticks.
