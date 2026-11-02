# 4. Skills, Custom Commands & Plugins

## Skills

**Skill** = فولدر فيه `SKILL.md` (تعليمات) + ملفات مساعدة اختيارية (scripts، templates، references).
بيعلّم Claude **workflow معين** (ازاي تعمل release، ازاي تكتب report بشكل الشركة، ازاي تعمل PDF).

```
.claude/skills/release-notes/
├── SKILL.md
├── template.md
└── scripts/collect_commits.sh
```

```markdown
---
name: release-notes
description: Write release notes from merged PRs since the last tag. Use when the user asks for release notes or a changelog.
---
1. Run `scripts/collect_commits.sh` to list merged PRs since the last tag.
2. Group them into Features, Fixes, and Breaking changes.
3. Fill in `template.md`. Keep each item to one line.
```

### Progressive disclosure (أهم فكرة في الـ Skills)

| المستوى | بيتحمّل إمتى | الحجم |
|---|---|---|
| `name` + `description` | **دايمًا** (كل session) | سطر أو اتنين |
| Body بتاع `SKILL.md` | لما الـ skill **يتستخدم** | مئات السطور (الأفضل < 500) |
| الملفات المساعدة | لما الـ body **يشاور عليها** | أي حجم |
| Scripts | بتتنفذ، و **الـ output بس** بيدخل الـ context | — |

عشان كده تقدر تحط 50 skill من غير ما الـ context يتملي، عكس CLAUDE.md اللي بيتحمّل كله.

- الـ **description** هو اللي بيخلي Claude يختار الـ skill صح: قول بيعمل إيه و **إمتى يتستخدم**.
- الأماكن: `.claude/skills/<name>/` (project)، `~/.claude/skills/<name>/` (personal)، plugin، managed.
- `disable-model-invocation: true` = المستخدم بس يقدر يناديه بـ `/name` (Claude ميستخدموش لوحده).
- `allowed-tools` في الـ frontmatter يحدد الـ tools المسموحة أثناء الـ skill.

## Custom (slash) commands

- القديم: `.claude/commands/deploy.md` → `/deploy`. فيه `$ARGUMENTS` للـ input.
- دلوقتي الـ commands **اتدمجت في الـ skills**: `.claude/commands/deploy.md` و
  `.claude/skills/deploy/SKILL.md` الاتنين بيعملوا `/deploy`. لو نفس الاسم، الـ skill بيكسب.
- الفرق العملي: Command = prompt المستخدم بيناديه بنفسه. Skill = Claude ممكن يقرر يستخدمه لوحده
  من الـ description، وممكن يكون معاه ملفات و scripts.
- Arguments: `$ARGUMENTS` (كله)، `$0` / `$1`... (بالترتيب).

## Plugins (عشان الفريق كله ياخد نفس الـ setup)

**Plugin** = حزمة بتجمع كذا حاجة وتتوزع مرة واحدة:

```
my-team-plugin/
├── .claude-plugin/plugin.json   ← الـ manifest (لازم فيه name)
├── skills/<name>/SKILL.md
├── commands/*.md
├── agents/*.md                  ← subagents
├── hooks/hooks.json
├── .mcp.json                    ← MCP servers
└── .lsp.json                    ← LSP servers
```

- **Marketplace** = مكان فيه plugins (git repo، local path، URL):
  `/plugin marketplace add owner/repo` ثم `/plugin install name@marketplace`.
- Scopes: user / project (في `.claude/settings.json`، يعني الفريق كله ياخده) / local.
- Skills من plugin بتتنادى بـ `/plugin-name:skill-name` (namespace عشان ميحصلش تعارض).
- **Plugin dependencies / versioning:** الامتحان بيذكر "plugin dependencies" تحت Configuration
  Management. فكّر فيها زي أي dependency: version معروف، تراجع اللي بيتحدث، ومتسطّبش plugin من مصدر
  مش موثوق (فيه hooks = كود بيشتغل على جهازك، و MCP servers).

## نفس الـ Skill في Claude Code و Messages API و Agent SDK

ده objective صريح في الكورس. نفس الـ `SKILL.md` بيشتغل في التلاتة، بس **الـ loading مختلف**:

| السطح | الـ Skill بيتحمّل إزاي | ملاحظات |
|---|---|---|
| **Claude Code** | من الـ filesystem (`.claude/skills/`, `~/.claude/skills/`, plugins) | أوتوماتيك |
| **Agent SDK** | من الـ filesystem برضه، **بس** لازم `settingSources` / `setting_sources` يشمل `user` و/أو `project` | لو حددت `settingSources` من غيرهم، **مفيش skills** هتتحمّل |
| **Messages API** | تـ **upload** الـ skill بالـ Skills API (`POST /v1/skills`) وتاخد `skill_id`، وبعدين في الـ request: `container.skills` + لازم **code execution tool** | الـ container **مفيهوش network** ومينفعش install packages وقت التشغيل |

```ts
// Messages API: custom skill + code execution
await client.beta.messages.create({
  model: "claude-opus-5-5",
  max_tokens: 16000,
  betas: ["code-execution-2025-08-25"],
  container: { skills: [{ type: "custom", skill_id: "skill_abc123", version: "latest" }] },
  tools: [{ type: "code_execution_20260521", name: "code_execution" }],
  messages: [{ role: "user", content: "Write release notes for v2.3" }],
});
```

**عشان الـ skill يشتغل نفس الطريقة في التلاتة ("portable"):**
- متعتمدش على network من جوه الـ scripts (الـ API container مفيهوش).
- متعتمدش على packages مش موجودة في الـ container.
- متعتمدش على tools خاصة بـ Claude Code بس.
- Paths **relative** للـ skill folder.
- Pin الـ version في الـ API (`version` محدد بدل `latest` في production).

## Built-in tools vs Custom tools vs Skills vs MCP (Agentic Customization، 4.1%)

| | إمتى تختاره |
|---|---|
| **Built-in tool** (Read، Bash، WebSearch...) | الـ capability موجودة أصلًا. أبسط حاجة |
| **Custom tool** (في الكود بتاعك) | capability خاصة بـ app واحد، logic عندك |
| **Skill** | **معرفة / workflow** (إزاي تعمل حاجة)، مش وصول لـ system جديد. بيتحمّل on demand |
| **MCP server** | **وصول لـ system خارجي** (DB، Jira، API داخلي) يتشارك بين **كذا app / client** ويتعمله maintain لوحده |

سؤال تفرقة سريع: "Claude محتاج **يعرف إزاي**؟" → Skill. "Claude محتاج **يوصل لـ** حاجة؟" → tool / MCP.
"هيتستخدم في كذا app؟" → MCP.

## الغلطة الشائعة في الامتحان

- ❌ تحط workflow طويل في CLAUDE.md. ✅ Skill (progressive disclosure).
- ❌ Skill بيعمل `pip install` أو network call، وتتوقع يشتغل في الـ Messages API.
- ❌ Agent SDK مش بيلاقي الـ skills → السبب غالبًا `settingSources` مش فيها `project`/`user`.
- ❌ Skill عشان توصل لـ DB. ✅ MCP server أو tool.
- ❌ كل واحد في الفريق يعمل setup يدوي. ✅ Plugin في marketplace + project scope.
