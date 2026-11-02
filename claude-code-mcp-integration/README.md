# Claude Code, MCP & Integration — شرح بالعربي

الكورس التاني في الـ **Claude Certified Developer – Foundations Prep Course**.
المصطلحات بالإنجليزي زي ما هتلاقيها في الامتحان والـ docs.

> **ملحوظة:** صفحات الدروس محتاجة login، فالشرح مبني على الـ **learning objectives** بتاعة
> الكورس + الـ Claude Code / MCP docs الرسمية (اتراجعت 2026-10-27). لو الدرس قال حاجة مختلفة،
> الدرس هو المرجع. بعض الـ features مربوطة بـ version معين من Claude Code.

## فكرة الكورس في سطر

الكورس اللي فات كان: إزاي الكود اللي بيكلّم Claude ميقعش.
الكورس ده: إزاي تخلّي الـ integration **configurable** و **shareable** و **safe** لما تتوصل
بأنظمة حقيقية.

الخيط اللي ماشي في الكورس كله: **إعداد آمن على جهازك ممكن يبقى خطر لما حد تاني يشغّله.**
(مثلًا: `bypassPermissions` في `.claude/settings.json` اللي اتعمله commit، أو API key مكتوب في `.mcp.json`.)

## الملفات

| # | الملف | الموضوع | الـ objective |
|---|---|---|---|
| 1 | [01-workflow-and-permissions.md](01-workflow-and-permissions.md) | Explore → plan → code، الـ permission modes، الـ permission rules | 1 |
| 2 | [02-reviewing-ai-code.md](02-reviewing-ai-code.md) | Calibrated trust، human review gates | 2 |
| 3 | [03-project-context.md](03-project-context.md) | CLAUDE.md، rules، settings.json، hooks، subagents | 3 |
| 4 | [04-skills-commands-plugins.md](04-skills-commands-plugins.md) | Skills، custom commands، plugins، نفس الـ Skill في Claude Code / API / SDK | 4 |
| 5 | [05-mcp-servers.md](05-mcp-servers.md) | Tools / resources / prompts، transports، scopes | 5 |
| 6 | [06-enterprise-integration.md](06-enterprise-integration.md) | Auth للعملاء الـ regulated، scoping لمشروع modernization | 6 |
| — | [07-exam-traps.md](07-exam-traps.md) | Cheat sheet + الفخاخ | — |
| — | [quiz.html](quiz.html) | Practice quiz بالإنجليزي، تفاعلي مع score | — |

## الوزن في الامتحان (من الـ exam guide)

الكورس ده بيغطي حتت من كذا domain:

| Domain / skill | الوزن |
|---|---|
| Claude Application Design (plugins، session hygiene، content boundaries) | 8.6% |
| Software Engineering Foundations (code review، refactoring) | 7.4% |
| Configuration Management (CLAUDE.md، settings.json، plugin dependencies) | 4.1% |
| Agentic Customization (built-in vs custom tools vs Skills vs MCP) | 4.1% |
| Claude Code Operation | 3.1% |
| Guardrails and Safe Deployment | 2.3% |
| MCP Server Development | 2.1% |
| Identity, Secrets, and Key Management | 1.6% |
| Claude Hooks | 1.0% |
