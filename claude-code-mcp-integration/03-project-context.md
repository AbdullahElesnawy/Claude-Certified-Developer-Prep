# 3. Durable Project Context: CLAUDE.md, Rules, Settings, Hooks, Subagents

**Durable context** = حاجات Claude يعرفها في **كل session** من غير ما تقولها كل مرة.

## أنهي أداة لأنهي حاجة؟ (أهم جدول في الملف)

| عايز... | استخدم | ليه |
|---|---|---|
| Claude **يعرف** حاجة (commands، conventions، architecture) | **CLAUDE.md** | context بيتحمّل كل session |
| قواعد لنوع ملفات معين بس | **Rules** (`.claude/rules/` بـ `paths:`) | بتتحمّل بس لما يلمس الملفات دي (context أقل) |
| حاجة **لازم** تحصل أو **ممنوع** تحصل، كل مرة | **Hooks** | deterministic، مش بيعتمد إن الموديل يفتكر |
| تسمح / تمنع tools | **Permissions** في `settings.json` | enforcement |
| مهمة جانبية بـ context منفصل | **Subagent** | context isolation + تخصص |
| workflow بتكرره | **Skill** ([04](04-skills-commands-plugins.md)) | بيتحمّل بس لما يلزم |

**القاعدة الذهبية:** CLAUDE.md **نصيحة** (الموديل ممكن ينساها أو يتجاهلها). Hooks و permissions **قانون**.
"Never commit to main" في CLAUDE.md ≠ ضمانة. الضمانة hook أو `deny` rule.

## CLAUDE.md

### الأماكن (كلهم بيتجمعوا مع بعض، مش بيلغوا بعض)

| المستوى | المكان | لمين |
|---|---|---|
| Managed policy | `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS) / `/etc/claude-code/CLAUDE.md` (Linux) | كل المستخدمين على الجهاز (IT) |
| User | `~/.claude/CLAUDE.md` | أنت، في كل المشاريع |
| Project | `./CLAUDE.md` أو `./.claude/CLAUDE.md` | الفريق كله (في git) |
| Local | `./CLAUDE.local.md` | أنت بس، في المشروع ده (حطه في `.gitignore`) |
| Subdirectory | `src/api/CLAUDE.md` | بيتحمّل **on demand** لما Claude يشتغل على ملفات في الفولدر ده |

- الملفات في الـ cwd و **كل الـ parent directories** بتتحمّل أول الـ session.
- **`@path` imports:** `@docs/architecture.md` جوه CLAUDE.md بيضيف الملف.
- `/init` يعمل CLAUDE.md أولي من الـ repo. `/memory` يفتح ملفات الـ memory. `/context` يوريك إيه اللي متحمّل.

### يتكتب فيه إيه؟

✅ اكتب:
- Commands: build، test، lint (بالظبط زي ما بتتكتب).
- Conventions مش واضحة من الكود ("use `Result<T>` not exceptions in the domain layer").
- Architecture باختصار + أماكن الحاجات المهمة.
- Gotchas ("tests need `docker compose up db` first").

❌ متكتبش:
- حاجات Claude يعرفها لوحده من قراءة الكود.
- Docs طويلة (حط link أو `@import` أو skill).
- **Secrets** (الملف ده في git).
- تعليمات متناقضة أو قديمة.

**خليه قصير.** كل سطر فيه بيتحمّل في **كل** request وبيكلّف tokens ويزحم الـ context.

## Rules files (`.claude/rules/*.md`)

قواعد بتتحمّل **بس** لما Claude يلمس ملفات معينة:

```markdown
---
paths:
  - "src/api/**/*.ts"
---
# API rules
- Every endpoint validates input with zod
- Return errors as RFC 7807 problem+json
```

- من غير `paths:` بتتحمّل دايمًا (زي CLAUDE.md).
- فايدتها: CLAUDE.md يفضل صغير، وقواعد الـ frontend متحمّلش وأنت شغال في الـ backend.
- `~/.claude/rules/` لقواعدك الشخصية في كل المشاريع.

## settings.json

| الأولوية (الأعلى الأول) | المكان | في git؟ |
|---|---|---|
| 1. Managed | `managed-settings.json` / MDM / server-managed | لأ (IT) |
| 2. CLI | `--settings`، `--permission-mode`... | — |
| 3. Local project | `.claude/settings.local.json` | **لأ** (شخصي) |
| 4. Shared project | `.claude/settings.json` | **آه** (الفريق) |
| 5. User | `~/.claude/settings.json` | لأ |

- **Managed بيكسب دايمًا**: ده اللي الـ enterprise بتستخدمه عشان تفرض policy (منع bypass، deny rules).
- الـ permission arrays و الـ hooks **بتتجمع** من كل المستويات.
- `~/.claude.json` مش settings؛ ده state (trust decisions، MCP servers بتاعة local/user scope).

## Hooks

Hook = command (أو HTTP call، أو prompt) بيشتغل **أوتوماتيك** عند event معين. **Deterministic**:
مش بيعتمد على إن الموديل يقرر.

### أهم الـ events

| Event | إمتى | استخدام شائع |
|---|---|---|
| `PreToolUse` | قبل ما tool يتنفذ | **منع** أوامر خطرة، validate |
| `PostToolUse` | بعد tool ما يخلص | format / lint بعد كل edit |
| `UserPromptSubmit` | لما المستخدم يبعت prompt | يضيف context، يمنع prompts فيها secrets |
| `Stop` | لما Claude يخلص رده | يتأكد إن الـ tests عدّت قبل ما يقف |
| `SessionStart` | بداية session | يحمّل context (git status، tickets) |
| `PreCompact` | قبل الـ compaction | يحفظ حاجة قبل ما تتلخص |
| `SubagentStop` / `Notification` / `SessionEnd` | ... | logging، notifications |

### الشكل

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{ "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-dangerous.sh" }]
    }],
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": "npx prettier --write \"$(jq -r .tool_input.file_path)\"" }]
    }]
  }
}
```

- الـ hook بياخد JSON على **stdin** (اسم الـ tool، الـ input، session info).
- **Exit codes:**
  - `0` = تمام (stdout ممكن يكون JSON بقرار).
  - **`2` = block.** الـ stderr بيرجع لـ Claude كسبب. بيمنع على `PreToolUse` و `UserPromptSubmit` و `Stop`.
  - أي رقم تاني = error مش blocking (الـ action بيكمل). ⚠️ hook بيفشل بـ exit 1 **مش** بيمنع حاجة.
- JSON output لـ `PreToolUse`: `permissionDecision`: `allow` / `ask` / `deny` + `permissionDecisionReason`.
- Hook بيقول `allow` **مش** بيتخطى `deny` rule في الـ settings.
- Hooks ممكن تتعرّف في: settings (كل المستويات)، plugins، skill أو subagent frontmatter.

**ملحوظة أمان:** الـ hooks بتشغّل shell commands بصلاحياتك. hook في `.claude/settings.json` بتاع
repo عملتله clone = كود بيشتغل على جهازك. راجعه.

## Subagents

Subagent = Claude تاني متخصص، ليه **context window منفصل** و system prompt و tools خاصة بيه.

```markdown
---
name: security-reviewer
description: Reviews diffs for security issues. Use after changes to auth, payments, or input handling.
tools: Read, Grep, Glob
model: sonnet
---
You are a security reviewer. Check for injection, missing authz checks, secrets in code...
Report findings as: file:line, severity, issue, fix.
```

- الأماكن: `.claude/agents/` (project، في git) و `~/.claude/agents/` (user)، أو من plugin.
- **`description`** هو اللي Claude بيقرر بيه إمتى يستخدمه (زي tool description بالظبط).
- **`tools`** allowlist: الـ reviewer مش محتاج `Edit` أو `Bash` (least privilege).
- **`model`**: ممكن تستخدم موديل أرخص للمهام البسيطة.
- الـ subagent **مش شايف** المحادثة الأساسية، وبيرجّع **ملخص** بس.
- مناسب لـ: exploration كبير، review مستقل، مهام read-heavy.

## الغلطة الشائعة في الامتحان

- ❌ "Add 'never run rm -rf' to CLAUDE.md" كـ guardrail. ✅ `PreToolUse` hook أو `deny` rule.
- ❌ secrets أو preferences شخصية في `.claude/settings.json` أو `CLAUDE.md` (في git).
  ✅ `.claude/settings.local.json` / `CLAUDE.local.md` / env vars.
- ❌ CLAUDE.md فيه 2000 سطر. ✅ قصير + rules بـ paths + skills + imports.
- ❌ hook بيرجّع exit 1 عشان يمنع. ✅ exit **2** (أو JSON `deny`).
- ❌ policy للشركة كلها في project settings. ✅ **managed settings** (المستخدم ميقدرش يغيرها).
