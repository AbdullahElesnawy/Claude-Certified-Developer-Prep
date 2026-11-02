# 1. Explore → Plan → Code، والـ Permission Modes

## الـ loop: Explore → Plan → Code (→ Commit)

أكبر غلطة مع Claude Code إنك تقوله "صلّح كذا" على طول. الطريقة الصح:

1. **Explore:** خلّيه يقرا الكود الأول ويفهم، **من غير ما يعدّل**.
   "Read the auth module and explain how sessions are validated. Don't change anything yet."
2. **Plan:** يكتب خطة: هيغير إيه، في أنهي ملفات، وإزاي هيتأكد إنها اشتغلت. **أنت تراجع الخطة.**
   ده أرخص مكان تصلّح فيه غلطة: تغيير سطر في خطة أرخص من revert لـ 20 ملف.
3. **Code:** ينفّذ الخطة، ويتحقق (tests، build، lint).
4. **Commit:** commit / PR بوصف واضح.

**إمتى تقصّر الـ loop؟** تغيير صغير وواضح (typo، rename في ملف واحد): مفيش داعي للـ plan.
كل ما المهمة أكبر أو أغمض أو أخطر، كل ما الـ explore والـ plan يبقوا أهم.

**ادّيله طريقة يتحقق بيها:** أقوى حاجة تحسّن النتيجة هي إن Claude يقدر يشيّك على شغله بنفسه
(test بيفشل قبل وينجح بعد، screenshot، أمر build). من غيرها أنت الـ test الوحيد.

## Permission modes

| Mode | بيعمل إيه | مناسب لـ |
|---|---|---|
| `default` (Manual) | القراءة بس من غير سؤال؛ أي edit أو command بيسأل | شغل عادي، repo مش متعود عليه |
| `plan` | قراءة بس؛ التعديل ممنوع لحد ما توافق على plan | الـ explore والـ plan؛ مهام خطرة |
| `acceptEdits` | بيوافق تلقائي على تعديل الملفات و commands بسيطة (`mkdir`, `mv`, `cp`...) جوه الـ working directory | تنفيذ خطة أنت راجعتها؛ git بيحميك |
| `auto` | **classifier** بيراجع كل action بدالك، وبيمنع اللي بيتعدى الطلب أو شكله جاي من content عدائي | شغل طويل وأنت مش قاعد تراقب، بخطر أقل من bypass |
| `dontAsk` | أي حاجة كانت هتسأل **بتترفض**. بس الـ tools اللي عاملها pre-approve هي اللي بتشتغل | CI / automation محكوم (**fails closed**) |
| `bypassPermissions` | مفيش أي سؤال خالص | **بس** في container / VM معزول من غير بيانات أو credentials حقيقية (**fails open**) |

- التبديل: **Shift+Tab** في الـ session، أو `claude --permission-mode plan`، أو
  `permissions.defaultMode` في settings.
- `--dangerously-skip-permissions` = `bypassPermissions`.
- `auto` و `bypassPermissions` **بيتجاهلوا** لو اتحطوا في project أو local settings؛ لازم
  user أو managed settings. (عشان repo تعمله clone ميقدرش يفتح كل حاجة لوحده.)

**اختيار الـ mode حسب الـ risk:**

```
مهمة غامضة أو repo جديد        → plan
تنفيذ خطة اتراجعت + git نضيف    → acceptEdits
شغل طويل من غير مراقبة          → auto (أو container + bypass)
CI pipeline                     → dontAsk + allow list محدد
أي حاجة فيها prod credentials   → default، ومتستخدمش bypass أبدًا
```

## Permission rules (في `settings.json`)

```json
{
  "permissions": {
    "allow": ["Bash(npm run test *)", "Bash(git diff *)", "Read(./src/**)"],
    "ask":   ["Bash(git push *)"],
    "deny":  ["Read(./.env)", "Read(./secrets/**)", "Bash(curl *)", "WebFetch(domain:pastebin.com)"],
    "defaultMode": "default"
  }
}
```

- **الأولوية: `deny` → `ask` → `allow`.** أول rule تطابق هي اللي بتكسب. deny واسع بيغلب allow ضيق.
- الصيغة: `Tool` أو `Tool(specifier)`:
  - `Bash(npm run build)` بالظبط؛ `Bash(npm run *)` أي حاجة بعدها.
  - `Read(./.env)` / `Edit(./src/**)`: paths بأسلوب gitignore.
  - `WebFetch(domain:example.com)`.
  - MCP: `mcp__github` (كل tools الـ server) أو `mcp__github__create_issue`.
- الـ arrays **بتتجمع** (merge) عبر كل ملفات الـ settings، مش بتلغي بعض.
- **Read deny مش sandbox:** بيمنع Claude يقرا الملف بالـ tools، لكن script بيشغله ممكن يقراه.
  للحماية على مستوى الـ OS استخدم الـ **sandbox**.

## Headless mode (`claude -p`)

لـ CI و scripts:

```bash
claude -p "Run the tests and fix failures" \
  --permission-mode dontAsk \
  --allowedTools "Bash(npm test *),Read,Edit" \
  --output-format json
```

- `--output-format`: `text` / `json` (فيه `result`، `session_id`، `total_cost_usd`) / `stream-json` (NDJSON).
- `--json-schema` مع `json` بيرجّع output متحقق منه في `structured_output`.
- في `-p` مفيش إنسان يوافق، فالـ calls اللي محتاجة موافقة **بتترفض** (إلا لو hook وافق).
- `--bare`: يتجاهل hooks و skills و plugins و CLAUDE.md و MCP عشان الـ CI يبقى reproducible.
- `--continue` / `--resume <id>` عشان تكمّل session.

## الغلطة الشائعة في الامتحان

- ❌ `bypassPermissions` على laptop فيه AWS credentials "عشان يخلص أسرع".
  ✅ `auto`، أو container معزول.
- ❌ commit لـ `.claude/settings.json` فيه allow واسع زي `Bash(*)` للفريق كله.
- ❌ deny rule في الـ prompt ("don't read .env"). ✅ `Read(./.env)` في `permissions.deny`.
- ❌ تنفيذ refactor كبير من غير plan mode ومراجعة.
