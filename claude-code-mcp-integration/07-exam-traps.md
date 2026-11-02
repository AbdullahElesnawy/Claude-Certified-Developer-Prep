# 7. Exam Traps + Cheat Sheet

> أسئلة التدريب بالإنجليزي في [quiz.html](quiz.html).

## القاعدة العامة

نفس قاعدة الكورس اللي فات: الإجابة الصح غالبًا **enforcement deterministic** (hook، permission
rule، managed setting) + **least privilege** + **أبسط أداة تحل المشكلة**. الإجابة الغلط غالبًا
"اكتبها في الـ prompt / CLAUDE.md" أو "اديله صلاحيات أكتر عشان يخلص".

الفخ الخاص بالكورس ده: **إعداد بيشتغل على جهازك بس بيبقى خطر لما يتشارك** (commit، plugin، .mcp.json).

## Cheat sheet

| السيناريو | الإجابة |
|---|---|
| Claude **يعرف** convention أو command في كل session | CLAUDE.md (project) |
| قواعد لملفات `src/api/**` بس | `.claude/rules/*.md` بـ `paths:` |
| تفضيل شخصي في مشروع مشترك | `CLAUDE.local.md` / `.claude/settings.local.json` |
| Policy للشركة كلها، المستخدم ميقدرش يغيرها | Managed settings |
| **لازم** يحصل / **ممنوع** يحصل كل مرة | Hook (أو permission rule) |
| منع command معين | `PreToolUse` hook بـ exit 2، أو `deny` rule |
| format بعد كل edit | `PostToolUse` hook بـ matcher `Edit\|Write` |
| Claude ميقراش `.env` | `permissions.deny: ["Read(./.env)"]` |
| مهمة read-heavy بـ context منفصل | Subagent |
| workflow بيتكرر + scripts | Skill |
| setup واحد للفريق كله (skills + hooks + MCP + agents) | Plugin |
| Skill مش بيتحمّل في Agent SDK | `settingSources` ناقصها `project` / `user` |
| Skill في Messages API | Skills API upload + `container.skills` + code execution |
| وصول لـ system يتشارك بين كذا app | MCP server |
| MCP لمستخدم واحد على جهازه | stdio، local scope |
| MCP مشترك لـ 200 موظف | Streamable HTTP + OAuth |
| MCP لكل الفريق في المشروع | project scope (`.mcp.json`) + `${ENV_VAR}` للـ secrets |
| data read-only المستخدم يختارها | MCP **resource** |
| action الموديل يقرر ينفذها | MCP **tool** |
| workflow المستخدم يبدأه | MCP **prompt** |
| مهمة غامضة / repo جديد | `plan` mode |
| تنفيذ خطة اتراجعت | `acceptEdits` |
| CI | `claude -p` + `dontAsk` + `--allowedTools` |
| `bypassPermissions` | container / VM معزول بس |
| Model access لعميل regulated | Bedrock / Vertex / Foundry، أو LLM gateway، أو short-lived creds |

## أرقام وأسماء تتحفظ

- Precedence الـ permissions: **deny → ask → allow**.
- Hook exit code **2** = block. أي رقم تاني غير 0 = error مش بيمنع.
- Settings precedence: **managed > CLI > local > project > user**.
- MCP scopes: **local** (default، `~/.claude.json`) / **project** (`.mcp.json`) / **user** (`~/.claude.json`).
- MCP transports: **stdio** / **Streamable HTTP** (SSE deprecated).
- Skill: الـ description دايمًا في الـ context، الـ body لما يتستخدم، الملفات لما يتشاور عليها.
